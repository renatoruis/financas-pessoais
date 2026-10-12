import { asc, eq } from 'drizzle-orm';
import type { RecurringRepository } from '@/application/ports/recurring-repository';
import type { RecurringTemplate } from '@/domain/recurring/recurring-template';
import type { Db } from '../db/client';
import { recurringTemplates } from '../db/schema';

type Row = typeof recurringTemplates.$inferSelect;

const toTemplate = (r: Row): RecurringTemplate => ({
  id: r.id,
  entityId: r.entityId,
  costCenterId: r.costCenterId,
  categoryId: r.categoryId,
  kind: r.kind,
  description: r.description,
  dayOfMonth: r.dayOfMonth,
  expectedCents: r.expectedCents,
  months: r.months,
  manual: r.manual,
  active: r.active,
});

export class DrizzleRecurringRepository implements RecurringRepository {
  constructor(private readonly db: Db) {}

  async list(): Promise<RecurringTemplate[]> {
    const rows = await this.db
      .select()
      .from(recurringTemplates)
      .orderBy(asc(recurringTemplates.entityId), asc(recurringTemplates.createdAt));
    return rows.map(toTemplate);
  }

  async findById(id: string): Promise<RecurringTemplate | null> {
    const [row] = await this.db
      .select()
      .from(recurringTemplates)
      .where(eq(recurringTemplates.id, id));
    return row ? toTemplate(row) : null;
  }

  async save(t: RecurringTemplate): Promise<void> {
    const row = { ...t, months: t.months ? [...t.months] : null, updatedAt: new Date() };
    await this.db
      .insert(recurringTemplates)
      .values(row)
      .onConflictDoUpdate({ target: recurringTemplates.id, set: row });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(recurringTemplates).where(eq(recurringTemplates.id, id));
  }
}
