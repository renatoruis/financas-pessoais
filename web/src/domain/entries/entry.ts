import type { Entity } from '../reference/reference-data';
import type { Currency } from '../shared/currency';
import { DomainError } from '../shared/domain-error';
import { isIsoDate, type IsoDate } from '../shared/iso-date';
import { money, type Money } from '../shared/money';

export const ENTRY_KINDS = ['income', 'expense'] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export const ENTRY_STATUSES = ['pending', 'settled', 'cancelled'] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const ENTRY_SOURCES = ['manual', 'recurring', 'invoice', 'movement', 'import'] as const;
export type EntrySource = (typeof ENTRY_SOURCES)[number];

export interface Entry {
  readonly id: string;
  readonly entityId: string;
  readonly currency: Currency;
  readonly costCenterId: string;
  readonly categoryId: string;
  readonly kind: EntryKind;
  readonly description: string;
  readonly dueDate: IsoDate;
  readonly amount: Money | null;
  readonly expected: Money | null;
  readonly status: EntryStatus;
  readonly settledOn: IsoDate | null;
  readonly notes: string;
  readonly linkGroup: string | null;
  readonly source: EntrySource;
  readonly recurringId: string | null;
}

/** Campos editáveis de um lançamento. `settledOn` preenchido = liquidado. */
export interface EntryFields {
  readonly costCenterId: string;
  readonly categoryId: string;
  readonly kind: EntryKind;
  readonly description: string;
  readonly dueDate: IsoDate;
  readonly amountCents: number | null;
  readonly expectedCents?: number | null;
  readonly settledOn?: IsoDate | null;
  readonly notes?: string;
}

export interface CreateEntryProps extends EntryFields {
  readonly id: string;
  readonly entity: Entity;
  readonly linkGroup?: string | null;
  readonly source?: EntrySource;
  readonly recurringId?: string | null;
}

const toMoney = (cents: number | null | undefined, currency: Currency): Money | null =>
  cents === null || cents === undefined ? null : money(cents, currency);

function assertValid(entry: Entry): Entry {
  if (!entry.description.trim())
    throw new DomainError('description-required', 'Indica a descrição.');
  if (!isIsoDate(entry.dueDate)) throw new DomainError('invalid-date', 'Vencimento inválido.');
  if (entry.amount && entry.amount.cents <= 0) {
    throw new DomainError('invalid-amount', 'O valor tem de ser maior que zero.');
  }
  if (entry.expected && entry.expected.cents < 0) {
    throw new DomainError('invalid-amount', 'O previsto não pode ser negativo.');
  }
  if (entry.status === 'settled' && !entry.amount) {
    throw new DomainError('amount-required', 'Um lançamento liquidado precisa de valor.');
  }
  if (entry.settledOn !== null && !isIsoDate(entry.settledOn)) {
    throw new DomainError('invalid-date', 'Data de liquidação inválida.');
  }
  return entry;
}

function applyFields(
  base: Omit<Entry, keyof EntryFields | 'amount' | 'expected' | 'status'>,
  fields: EntryFields,
): Entry {
  const settledOn = fields.settledOn ?? null;
  return assertValid({
    ...base,
    costCenterId: fields.costCenterId,
    categoryId: fields.categoryId,
    kind: fields.kind,
    description: fields.description.trim(),
    dueDate: fields.dueDate,
    amount: toMoney(fields.amountCents, base.currency),
    expected: toMoney(fields.expectedCents, base.currency),
    status: settledOn ? 'settled' : 'pending',
    settledOn,
    notes: (fields.notes ?? '').trim(),
  });
}

export function createEntry(props: CreateEntryProps): Entry {
  return applyFields(
    {
      id: props.id,
      entityId: props.entity.id,
      currency: props.entity.currency,
      linkGroup: props.linkGroup ?? null,
      source: props.source ?? 'manual',
      recurringId: props.recurringId ?? null,
    },
    props,
  );
}

/** Edição completa. Um lançamento cancelado continua cancelado. */
export function updateEntry(entry: Entry, fields: EntryFields): Entry {
  const updated = applyFields(entry, fields);
  return entry.status === 'cancelled'
    ? { ...updated, status: 'cancelled', settledOn: null }
    : updated;
}
