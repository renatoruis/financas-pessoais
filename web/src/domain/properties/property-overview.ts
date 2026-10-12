import type { Entry } from '../entries/entry';
import { signedCents } from '../entries/entry-lifecycle';
import { SYSTEM_CATEGORIES, SYSTEM_COST_CENTERS } from '../reference/reference-data';
import { periodOf, type YearMonth } from '../shared/iso-date';
import { money, subtract, sum, type Money } from '../shared/money';
import { computeCoverage, type CoverageSummary } from './coverage';
import { computePropertyCash, type PropertyCash } from './property-cash';

export interface ApartmentSummary {
  readonly costCenterId: string;
  readonly income: Money;
  readonly expense: Money;
  readonly payable: Money;
  /** Receitas − despesas feitas − a pagar. */
  readonly balance: Money;
}

export interface PropertyOverview {
  readonly period: YearMonth;
  readonly apartments: readonly ApartmentSummary[];
  readonly coverage: CoverageSummary;
  readonly cash: PropertyCash;
}

export interface PropertyOverviewInput {
  /** Todos os lançamentos da entidade Imóveis (todos os meses). */
  readonly entries: readonly Entry[];
  readonly period: YearMonth;
  /** Centros a mostrar sempre (apartamentos + Geral), por ordem. */
  readonly centerIds: readonly string[];
  readonly initialCash: Money;
}

const totalOf = (entries: readonly Entry[], initial: Money): Money =>
  sum(
    entries.map((e) => money(e.amount?.cents ?? 0, initial.currency)),
    initial.currency,
  );

function apartmentSummary(
  entries: readonly Entry[],
  centerId: string,
  initial: Money,
): ApartmentSummary {
  const own = entries.filter((e) => e.costCenterId === centerId);
  const income = totalOf(
    own.filter((e) => e.kind === 'income' && e.status === 'settled'),
    initial,
  );
  const expense = totalOf(
    own.filter((e) => e.kind === 'expense' && e.status === 'settled'),
    initial,
  );
  const payable = totalOf(
    own.filter((e) => e.kind === 'expense' && e.status === 'pending'),
    initial,
  );
  return {
    costCenterId: centerId,
    income,
    expense,
    payable,
    balance: subtract(subtract(income, expense), payable),
  };
}

function centersOf(input: PropertyOverviewInput, periodEntries: readonly Entry[]): string[] {
  const seen = new Set([...input.centerIds, ...periodEntries.map((e) => e.costCenterId)]);
  seen.delete(SYSTEM_COST_CENTERS.propertyCash);
  return [...seen];
}

export function summarizeProperties(input: PropertyOverviewInput): PropertyOverview {
  const { currency } = input.initialCash;
  const periodEntries = input.entries.filter((e) => periodOf(e.dueDate) === input.period);
  const apartments = centersOf(input, periodEntries).map((id) =>
    apartmentSummary(periodEntries, id, input.initialCash),
  );
  const coverage = computeCoverage(
    apartments.map((a) => ({
      costCenterId: a.costCenterId,
      result: subtract(a.income, a.expense),
    })),
    currency,
  );
  const settledIn = (categoryId: string) =>
    totalOf(
      periodEntries.filter((e) => e.status === 'settled' && e.categoryId === categoryId),
      input.initialCash,
    );
  const prior = input.entries.filter(
    (e) => e.status === 'settled' && periodOf(e.dueDate) < input.period,
  );
  const cash = computePropertyCash({
    initialCash: input.initialCash,
    priorNet: money(
      prior.reduce((acc, e) => acc + signedCents(e), 0),
      currency,
    ),
    monthResult: coverage.monthResult,
    contributions: settledIn(SYSTEM_CATEGORIES.contribution),
    withdrawals: settledIn(SYSTEM_CATEGORIES.withdrawal),
    surplus: coverage.surplus,
    deficit: coverage.deficit,
  });
  return { period: input.period, apartments, coverage, cash };
}
