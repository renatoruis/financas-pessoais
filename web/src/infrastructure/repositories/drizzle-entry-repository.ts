import { and, asc, eq, gte, ilike, inArray, lte, or, type SQL } from 'drizzle-orm';
import type { EntryFilter, EntryRepository } from '@/application/ports/entry-repository';
import type { Entry } from '@/domain/entries/entry';
import { DomainError } from '@/domain/shared/domain-error';
import type { Db } from '../db/client';
import { entries } from '../db/schema';
import { toEntry, toEntryRow } from './entry-mapper';

const UNIQUE_VIOLATION = '23505';

function conditions(f: EntryFilter): SQL[] {
  const list: (SQL | undefined)[] = [
    f.entityIds ? inArray(entries.entityId, [...f.entityIds]) : undefined,
    f.period ? eq(entries.period, f.period) : undefined,
    f.periodFrom ? gte(entries.period, f.periodFrom) : undefined,
    f.periodTo ? lte(entries.period, f.periodTo) : undefined,
    f.statuses ? inArray(entries.status, [...f.statuses]) : undefined,
    f.costCenterId ? eq(entries.costCenterId, f.costCenterId) : undefined,
    f.categoryId ? eq(entries.categoryId, f.categoryId) : undefined,
    f.linkGroup ? eq(entries.linkGroup, f.linkGroup) : undefined,
    f.search
      ? or(ilike(entries.description, `%${f.search}%`), ilike(entries.notes, `%${f.search}%`))
      : undefined,
  ];
  return list.filter((c): c is SQL => c !== undefined);
}

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'cause' in error &&
  (error.cause as { code?: string } | undefined)?.code === UNIQUE_VIOLATION;

export class DrizzleEntryRepository implements EntryRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Entry | null> {
    const [row] = await this.db.select().from(entries).where(eq(entries.id, id));
    return row ? toEntry(row) : null;
  }

  async list(filter: EntryFilter): Promise<Entry[]> {
    const rows = await this.db
      .select()
      .from(entries)
      .where(and(...conditions(filter)))
      .orderBy(asc(entries.dueDate), asc(entries.description));
    return rows.map(toEntry);
  }

  async saveMany(list: readonly Entry[]): Promise<void> {
    if (!list.length) return;
    try {
      await this.db.transaction(async (tx) => {
        for (const entry of list) {
          const row = toEntryRow(entry);
          await tx.insert(entries).values(row).onConflictDoUpdate({ target: entries.id, set: row });
        }
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      throw new DomainError('duplicate', 'Já existe um lançamento deste recorrente neste mês.');
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(entries).where(eq(entries.id, id));
  }
}
