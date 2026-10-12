import type { Currency } from '../shared/currency';
import {
  abs,
  isNegative,
  isPositive,
  min,
  negate,
  share,
  subtract,
  sum,
  zero,
  type Money,
} from '../shared/money';

export interface CenterResult {
  readonly costCenterId: string;
  /** Receitas − despesas liquidadas do mês. */
  readonly result: Money;
}

export interface CenterCoverage extends CenterResult {
  /** Quanto do excedente deste apartamento cobriu os outros. */
  readonly coveredOthers: Money;
  /** Quanto do défice deste apartamento foi coberto pelos outros. */
  readonly coveredByOthers: Money;
  /** Défice que sobra para a caixa (ou aporte). */
  readonly coveredByCash: Money;
}

export interface CoverageSummary {
  readonly centers: readonly CenterCoverage[];
  readonly surplus: Money;
  readonly deficit: Money;
  readonly coveredBetween: Money;
  readonly monthResult: Money;
}

/**
 * Caixa comum: o excedente de uns apartamentos cobre o défice de outros,
 * repartido proporcionalmente. S = soma dos positivos, D = soma dos negativos (abs).
 */
export function computeCoverage(
  results: readonly CenterResult[],
  currency: Currency,
): CoverageSummary {
  const surplus = sum(results.map((r) => r.result).filter(isPositive), currency);
  const deficit = abs(sum(results.map((r) => r.result).filter(isNegative), currency));
  const coveredBetween = min(surplus, deficit);
  const none = zero(currency);

  const centers = results.map((r): CenterCoverage => {
    if (isPositive(r.result)) {
      const coveredOthers = share(coveredBetween, r.result, surplus);
      return { ...r, coveredOthers, coveredByOthers: none, coveredByCash: none };
    }
    if (isNegative(r.result)) {
      const need = negate(r.result);
      const coveredByOthers = share(coveredBetween, need, deficit);
      return {
        ...r,
        coveredOthers: none,
        coveredByOthers,
        coveredByCash: subtract(need, coveredByOthers),
      };
    }
    return { ...r, coveredOthers: none, coveredByOthers: none, coveredByCash: none };
  });

  const monthResult = sum(
    results.map((r) => r.result),
    currency,
  );
  return { centers, surplus, deficit, coveredBetween, monthResult };
}
