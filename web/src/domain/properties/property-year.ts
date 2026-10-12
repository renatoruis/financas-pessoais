import type { Entry } from '../entries/entry';
import { periodsOfYear, type YearMonth } from '../shared/iso-date';
import { add, zero, type Money } from '../shared/money';
import type { CenterCoverage } from './coverage';
import { summarizeProperties, type PropertyOverview } from './property-overview';

export interface PropertyMonthRow {
  readonly period: YearMonth;
  readonly monthResult: Money;
  readonly coveredBetween: Money;
  readonly coveredByCash: Money;
  readonly contributions: Money;
  readonly withdrawals: Money;
  readonly end: Money;
}

export type ApartmentYearRow = CenterCoverage;

export interface PropertyYear {
  readonly months: readonly PropertyMonthRow[];
  /** Totais do ano por apartamento. */
  readonly apartments: readonly ApartmentYearRow[];
}

export interface PropertyYearInput {
  readonly entries: readonly Entry[];
  readonly year: number;
  readonly centerIds: readonly string[];
  readonly initialCash: Money;
}

const toRow = (o: PropertyOverview): PropertyMonthRow => ({
  period: o.period,
  monthResult: o.coverage.monthResult,
  coveredBetween: o.coverage.coveredBetween,
  coveredByCash: o.cash.coveredByCash,
  contributions: o.cash.contributions,
  withdrawals: o.cash.withdrawals,
  end: o.cash.end,
});

function accumulate(rows: Map<string, ApartmentYearRow>, c: CenterCoverage): void {
  const none = zero(c.result.currency);
  const prev = rows.get(c.costCenterId) ?? {
    costCenterId: c.costCenterId,
    result: none,
    coveredOthers: none,
    coveredByOthers: none,
    coveredByCash: none,
  };
  rows.set(c.costCenterId, {
    costCenterId: c.costCenterId,
    result: add(prev.result, c.result),
    coveredOthers: add(prev.coveredOthers, c.coveredOthers),
    coveredByOthers: add(prev.coveredByOthers, c.coveredByOthers),
    coveredByCash: add(prev.coveredByCash, c.coveredByCash),
  });
}

/** Cobertura e caixa mês a mês, e totais por apartamento no ano. */
export function summarizePropertyYear(input: PropertyYearInput): PropertyYear {
  const overviews = periodsOfYear(input.year).map((period) =>
    summarizeProperties({ ...input, period }),
  );
  const apartments = new Map<string, ApartmentYearRow>();
  overviews.forEach((o) => o.coverage.centers.forEach((c) => accumulate(apartments, c)));
  return { months: overviews.map(toRow), apartments: [...apartments.values()] };
}
