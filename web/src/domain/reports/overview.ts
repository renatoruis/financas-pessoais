import type { Entry } from '../entries/entry';
import { byDueDate, isOverdue } from '../entries/entry-schedule';
import { isOperationalCategory } from '../reference/reference-data';
import type { Currency } from '../shared/currency';
import { addDays, addMonths, periodOf, type IsoDate, type YearMonth } from '../shared/iso-date';
import { money, sum, type Money } from '../shared/money';
import type { EntitySummary } from './entity-summary';

export const ROLLING_MONTHS = 12;
export const UPCOMING_DAYS = 30;
export const TOP_CATEGORIES = 6;

export interface CurrencyKpis {
  readonly income: Money;
  readonly expense: Money;
  readonly result: Money;
  readonly receivable: Money;
  readonly payable: Money;
  /** Como o mês vai fechar, somando as entidades desta moeda. */
  readonly balance: Money;
  readonly previousResult: Money;
}

export interface RollingPoint {
  readonly period: YearMonth;
  readonly income: Money;
  readonly expense: Money;
  readonly result: Money;
  /** Resultado liquidado de cada entidade (id → valor). */
  readonly byEntity: Readonly<Record<string, Money>>;
}

export interface CategoryShare {
  readonly categoryId: string;
  readonly total: Money;
  /** Fração da despesa total (0–1). */
  readonly share: number;
}

export interface UpcomingCashflow {
  readonly entries: readonly Entry[];
  readonly incoming: Money;
  readonly outgoing: Money;
  readonly overdueCount: number;
}

const cents = (e: Entry): number => e.amount?.cents ?? 0;

const settledOperational = (entries: readonly Entry[], currency: Currency): Entry[] =>
  entries.filter(
    (e) => e.currency === currency && e.status === 'settled' && isOperationalCategory(e.categoryId),
  );

const totalOf = (entries: readonly Entry[], kind: Entry['kind']): number =>
  entries.filter((e) => e.kind === kind).reduce((acc, e) => acc + cents(e), 0);

/** Soma os cartões do mês (e o resultado do mês anterior) das entidades de uma moeda. */
export function currencyKpis(
  current: readonly EntitySummary[],
  previous: readonly EntitySummary[],
  currency: Currency,
): CurrencyKpis {
  const total = (list: readonly EntitySummary[], pick: (s: EntitySummary) => Money) =>
    sum(list.map(pick), currency);
  return {
    income: total(current, (s) => s.income),
    expense: total(current, (s) => s.expense),
    result: total(current, (s) => s.result),
    receivable: total(current, (s) => s.receivable),
    payable: total(current, (s) => s.payable),
    balance: total(current, (s) => s.balance),
    previousResult: total(previous, (s) => s.result),
  };
}

/** Os meses da janela móvel que termina em `endPeriod` (inclusive), do mais antigo ao mais recente. */
export const rollingPeriods = (endPeriod: YearMonth, months = ROLLING_MONTHS): YearMonth[] =>
  Array.from({ length: months }, (_, i) => addMonths(endPeriod, i - months + 1));

/** Receitas, despesas e resultado liquidados por mês, com o resultado de cada entidade. */
export function rollingSeries(
  entries: readonly Entry[],
  endPeriod: YearMonth,
  entityIds: readonly string[],
  currency: Currency,
): RollingPoint[] {
  const relevant = settledOperational(entries, currency);
  return rollingPeriods(endPeriod).map((period) => {
    const inMonth = relevant.filter((e) => periodOf(e.dueDate) === period);
    const income = totalOf(inMonth, 'income');
    const expense = totalOf(inMonth, 'expense');
    const byEntity = Object.fromEntries(
      entityIds.map((id) => {
        const own = inMonth.filter((e) => e.entityId === id);
        return [id, money(totalOf(own, 'income') - totalOf(own, 'expense'), currency)];
      }),
    );
    return {
      period,
      income: money(income, currency),
      expense: money(expense, currency),
      result: money(income - expense, currency),
      byEntity,
    };
  });
}

/**
 * Onde vai o dinheiro: despesa liquidada por categoria, juntando entidades pelo id da categoria
 * (ex.: `impostos` de várias entidades fica numa linha).
 */
export function topExpenseCategories(
  entries: readonly Entry[],
  currency: Currency,
  limit = TOP_CATEGORIES,
): CategoryShare[] {
  const totals = new Map<string, number>();
  for (const e of settledOperational(entries, currency)) {
    if (e.kind === 'expense') totals.set(e.categoryId, (totals.get(e.categoryId) ?? 0) + cents(e));
  }
  const all = [...totals.values()].reduce((a, b) => a + b, 0);
  return [...totals.entries()]
    .filter(([, total]) => total > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([categoryId, total]) => ({
      categoryId,
      total: money(total, currency),
      share: total / all,
    }));
}

/** Pendentes em atraso e os que vencem até `today + horizonDays`, com o que entra e sai. */
export function upcomingCashflow(
  pending: readonly Entry[],
  today: IsoDate,
  currency: Currency,
  horizonDays = UPCOMING_DAYS,
): UpcomingCashflow {
  const limit = addDays(today, horizonDays);
  const list = pending
    .filter((e) => e.currency === currency && e.status === 'pending' && e.dueDate <= limit)
    .sort(byDueDate);
  return {
    entries: list,
    incoming: money(totalOf(list, 'income'), currency),
    outgoing: money(totalOf(list, 'expense'), currency),
    overdueCount: list.filter((e) => isOverdue(e, today)).length,
  };
}
