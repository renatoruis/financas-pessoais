import type { Entry } from '@/domain/entries/entry';
import { periodOf } from '@/domain/shared/iso-date';
import { money } from '@/domain/shared/money';
import type { entries } from '../db/schema';

type EntryRow = typeof entries.$inferSelect;
type EntryInsert = typeof entries.$inferInsert;

export function toEntry(r: EntryRow): Entry {
  return {
    id: r.id,
    entityId: r.entityId,
    currency: r.currency,
    costCenterId: r.costCenterId,
    categoryId: r.categoryId,
    kind: r.kind,
    description: r.description,
    dueDate: r.dueDate,
    amount: r.amountCents === null ? null : money(r.amountCents, r.currency),
    expected: r.expectedCents === null ? null : money(r.expectedCents, r.currency),
    status: r.status,
    settledOn: r.settledOn,
    notes: r.notes,
    linkGroup: r.linkGroup,
    source: r.source,
    recurringId: r.recurringId,
  };
}

export function toEntryRow(e: Entry): EntryInsert {
  return {
    id: e.id,
    entityId: e.entityId,
    currency: e.currency,
    costCenterId: e.costCenterId,
    categoryId: e.categoryId,
    kind: e.kind,
    description: e.description,
    dueDate: e.dueDate,
    period: periodOf(e.dueDate),
    amountCents: e.amount?.cents ?? null,
    expectedCents: e.expected?.cents ?? null,
    status: e.status,
    settledOn: e.settledOn,
    notes: e.notes,
    linkGroup: e.linkGroup,
    source: e.source,
    recurringId: e.recurringId,
    updatedAt: new Date(),
  };
}
