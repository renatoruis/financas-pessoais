import type { Entry } from '../entries/entry';
import { signedCents } from '../entries/entry-lifecycle';
import { isOperationalCategory } from '../reference/reference-data';
import type { Currency } from '../shared/currency';
import { periodOf, periodsOfYear, yearOf, type YearMonth } from '../shared/iso-date';
import { money, type Money } from '../shared/money';

export interface MonthlyRow {
  readonly period: YearMonth;
  readonly income: Money;
  readonly expense: Money;
  readonly result: Money;
  /** Resultado acumulado no ano até este mês. */
  readonly cumulative: Money;
}

export interface CategoryRow {
  readonly categoryId: string;
  readonly income: Money;
  readonly expense: Money;
  readonly net: Money;
}

const settledOperational = (entries: readonly Entry[], year: number): Entry[] =>
  entries.filter(
    (e) =>
      e.status === 'settled' && isOperationalCategory(e.categoryId) && yearOf(e.dueDate) === year,
  );

const cents = (e: Entry): number => e.amount?.cents ?? 0;

/** Receitas, despesas e resultado liquidados por mês de vencimento, com acumulado do ano. */
export function monthlySeries(
  entries: readonly Entry[],
  year: number,
  currency: Currency,
): MonthlyRow[] {
  const relevant = settledOperational(entries, year);
  let cumulative = 0;
  return periodsOfYear(year).map((period) => {
    const inMonth = relevant.filter((e) => periodOf(e.dueDate) === period);
    const income = inMonth.filter((e) => e.kind === 'income').reduce((a, e) => a + cents(e), 0);
    const expense = inMonth.filter((e) => e.kind === 'expense').reduce((a, e) => a + cents(e), 0);
    cumulative += income - expense;
    return {
      period,
      income: money(income, currency),
      expense: money(expense, currency),
      result: money(income - expense, currency),
      cumulative: money(cumulative, currency),
    };
  });
}

/** Totais liquidados do ano por categoria, do maior para o menor movimento. */
export function categoryTotals(
  entries: readonly Entry[],
  year: number,
  currency: Currency,
): CategoryRow[] {
  const rows = new Map<string, { income: number; expense: number }>();
  for (const e of settledOperational(entries, year)) {
    const row = rows.get(e.categoryId) ?? { income: 0, expense: 0 };
    if (e.kind === 'income') row.income += cents(e);
    else row.expense += cents(e);
    rows.set(e.categoryId, row);
  }
  return [...rows.entries()]
    .map(([categoryId, r]) => ({
      categoryId,
      income: money(r.income, currency),
      expense: money(r.expense, currency),
      net: money(r.income - r.expense, currency),
    }))
    .sort((a, b) => b.income.cents + b.expense.cents - (a.income.cents + a.expense.cents));
}

export const netCents = (entries: readonly Entry[]): number =>
  entries.reduce((acc, e) => acc + signedCents(e), 0);
