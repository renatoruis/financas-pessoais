import type { Entry } from '../entries/entry';
import { CURRENCIES, type Currency } from '../shared/currency';
import { money, type Money } from '../shared/money';

export interface CurrencyTotals {
  readonly currency: Currency;
  readonly income: Money;
  readonly expense: Money;
  readonly net: Money;
}

/** Totais de uma lista de lançamentos (pendentes e liquidados), uma linha por moeda. */
export function totalsByCurrency(entries: readonly Entry[]): CurrencyTotals[] {
  return CURRENCIES.flatMap((currency) => {
    const own = entries.filter((e) => e.currency === currency && e.status !== 'cancelled');
    if (own.length === 0) return [];
    const total = (kind: Entry['kind']) =>
      own.filter((e) => e.kind === kind).reduce((acc, e) => acc + (e.amount?.cents ?? 0), 0);
    const income = total('income');
    const expense = total('expense');
    return [
      {
        currency,
        income: money(income, currency),
        expense: money(expense, currency),
        net: money(income - expense, currency),
      },
    ];
  });
}
