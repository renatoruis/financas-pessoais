import { add, max, min, negate, subtract, zero, type Money } from '../shared/money';

export interface PropertyCashInput {
  readonly initialCash: Money;
  /** Líquido de todos os lançamentos liquidados dos meses anteriores. */
  readonly priorNet: Money;
  readonly monthResult: Money;
  readonly contributions: Money;
  readonly withdrawals: Money;
  readonly surplus: Money;
  readonly deficit: Money;
}

export interface PropertyCash {
  readonly start: Money;
  readonly monthResult: Money;
  readonly contributions: Money;
  readonly withdrawals: Money;
  readonly coveredByCash: Money;
  readonly contributionNeeded: Money;
  readonly end: Money;
}

export function computePropertyCash(input: PropertyCashInput): PropertyCash {
  const none = zero(input.initialCash.currency);
  const start = add(input.initialCash, input.priorNet);
  const uncovered = max(subtract(input.deficit, input.surplus), none);
  const coveredByCash = min(uncovered, max(start, none));
  const contributionNeeded = max(none, negate(add(start, input.monthResult)));
  const end = subtract(add(add(start, input.monthResult), input.contributions), input.withdrawals);
  return {
    start,
    monthResult: input.monthResult,
    contributions: input.contributions,
    withdrawals: input.withdrawals,
    coveredByCash,
    contributionNeeded,
    end,
  };
}
