import { DomainError } from '../shared/domain-error';
import { isIsoDate, type IsoDate } from '../shared/iso-date';
import { money } from '../shared/money';
import type { Entry } from './entry';

function assertPending(entry: Entry): void {
  if (entry.status !== 'pending') {
    throw new DomainError('not-pending', `"${entry.description}" já não está pendente.`);
  }
}

/**
 * Liquida um lançamento pendente. `finalAmountCents` substitui o valor (ex.: conta da luz real).
 * Sem valor final nem valor previamente registado, recusa.
 */
export function settleEntry(
  entry: Entry,
  on: IsoDate,
  finalAmountCents: number | null = null,
): Entry {
  assertPending(entry);
  if (!isIsoDate(on)) throw new DomainError('invalid-date', 'Data de liquidação inválida.');
  if (finalAmountCents !== null && finalAmountCents <= 0) {
    throw new DomainError('invalid-amount', 'O valor final tem de ser maior que zero.');
  }
  const amount = finalAmountCents !== null ? money(finalAmountCents, entry.currency) : entry.amount;
  if (!amount) {
    throw new DomainError(
      'amount-required',
      'Este lançamento não tem valor: indica o valor final.',
    );
  }
  return { ...entry, amount, status: 'settled', settledOn: on };
}

export function cancelEntry(entry: Entry): Entry {
  assertPending(entry);
  return { ...entry, status: 'cancelled', settledOn: null };
}

/** Desfaz uma liquidação ou um cancelamento. */
export function reopenEntry(entry: Entry): Entry {
  if (entry.status === 'pending') return entry;
  return { ...entry, status: 'pending', settledOn: null };
}

/** Receita positiva, despesa negativa; sem valor conta zero. */
export function signedCents(entry: Entry): number {
  const cents = entry.amount?.cents ?? 0;
  return entry.kind === 'income' ? cents : -cents;
}

export function signedExpectedCents(entry: Entry): number {
  const cents = entry.expected?.cents ?? 0;
  return entry.kind === 'income' ? cents : -cents;
}
