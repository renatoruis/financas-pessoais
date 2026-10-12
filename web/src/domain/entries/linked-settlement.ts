import { SYSTEM_CATEGORIES } from '../reference/reference-data';
import type { IsoDate } from '../shared/iso-date';
import type { Entry } from './entry';
import { settleEntry } from './entry-lifecycle';

export interface LinkedSettlementInput {
  readonly main: Entry;
  /** Outros lançamentos com o mesmo `linkGroup` (ex.: o IVA da fatura); só os da mesma entidade contam. */
  readonly linked: readonly Entry[];
  readonly on: IsoDate;
  readonly finalAmountCents: number | null;
  readonly vatRate: number;
}

const isVat = (entry: Entry): boolean => entry.categoryId === SYSTEM_CATEGORIES.vat;

/**
 * Liquida o lançamento e os pendentes ligados. Se a base de uma fatura mudar de valor,
 * o IVA ligado é recalculado com a taxa atual.
 */
export function settleWithLinked(input: LinkedSettlementInput): Entry[] {
  const { finalAmountCents } = input;
  const main = settleEntry(input.main, input.on, finalAmountCents);
  const newVatCents =
    finalAmountCents !== null && !isVat(input.main)
      ? Math.round(finalAmountCents * input.vatRate)
      : null;
  const others = input.linked
    .filter(
      (e) => e.id !== input.main.id && e.entityId === input.main.entityId && e.status === 'pending',
    )
    .map((e) => settleEntry(e, input.on, isVat(e) ? newVatCents : null));
  return [main, ...others];
}
