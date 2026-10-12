import type { Entry, EntryKind, EntryStatus } from '../entries/entry';
import { signedExpectedCents } from '../entries/entry-lifecycle';
import { byDueDate, isDueSoon, isOverdue } from '../entries/entry-schedule';
import { isOperationalCategory, type Entity } from '../reference/reference-data';
import { periodOf, type IsoDate, type YearMonth } from '../shared/iso-date';
import { money, type Money } from '../shared/money';

export interface EntitySummary {
  readonly entityId: string;
  readonly income: Money;
  readonly expense: Money;
  /** Receitas − despesas liquidadas. */
  readonly result: Money;
  readonly receivable: Money;
  readonly payable: Money;
  /** Resultado + a receber − a pagar: como o mês vai fechar. */
  readonly balance: Money;
  readonly expected: Money;
  readonly deviation: Money;
  readonly expectedCount: number;
  readonly overdueCount: number;
  readonly dueSoonCount: number;
}

export interface EntitySummaryInput {
  readonly entity: Entity;
  /** Lançamentos da entidade com vencimento no mês. */
  readonly periodEntries: readonly Entry[];
  /** Pendentes da entidade de qualquer mês (para atrasos). */
  readonly pendingEntries: readonly Entry[];
  readonly today: IsoDate;
}

const isCounted = (e: Entry): boolean =>
  e.status !== 'cancelled' && isOperationalCategory(e.categoryId);

function total(entries: readonly Entry[], kind: EntryKind, status: EntryStatus): number {
  return entries
    .filter((e) => e.kind === kind && e.status === status)
    .reduce((acc, e) => acc + (e.amount?.cents ?? 0), 0);
}

export function summarizeEntity(input: EntitySummaryInput): EntitySummary {
  const m = (cents: number) => money(cents, input.entity.currency);
  const counted = input.periodEntries.filter(isCounted);
  const income = total(counted, 'income', 'settled');
  const expense = total(counted, 'expense', 'settled');
  const receivable = total(counted, 'income', 'pending');
  const payable = total(counted, 'expense', 'pending');
  const balance = income - expense + receivable - payable;
  const expected = counted.reduce((acc, e) => acc + signedExpectedCents(e), 0);
  return {
    entityId: input.entity.id,
    income: m(income),
    expense: m(expense),
    result: m(income - expense),
    receivable: m(receivable),
    payable: m(payable),
    balance: m(balance),
    expected: m(expected),
    deviation: m(balance - expected),
    expectedCount: counted.filter((e) => e.expected !== null).length,
    overdueCount: input.pendingEntries.filter((e) => isOverdue(e, input.today)).length,
    dueSoonCount: input.pendingEntries.filter((e) => isDueSoon(e, input.today)).length,
  };
}

/** Pendentes a mostrar no painel: os do mês e os atrasados, por data de vencimento. */
export function pendingForPeriod(
  entries: readonly Entry[],
  period: YearMonth,
  today: IsoDate,
): Entry[] {
  return entries
    .filter((e) => e.status === 'pending' && (periodOf(e.dueDate) === period || e.dueDate < today))
    .sort(byDueDate);
}
