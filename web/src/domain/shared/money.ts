import type { Currency } from './currency';
import { DomainError } from './domain-error';

const CENTS_PER_UNIT = 100;

/** Valor monetário em cêntimos inteiros. Objeto simples para poder passar do servidor ao cliente. */
export interface Money {
  readonly cents: number;
  readonly currency: Currency;
}

export class CurrencyMismatchError extends DomainError {
  constructor(a: Currency, b: Currency) {
    super('currency-mismatch', `Não é possível combinar ${a} com ${b}.`);
  }
}

export function money(cents: number, currency: Currency): Money {
  if (!Number.isSafeInteger(cents)) {
    throw new DomainError('invalid-money', `Valor inválido: ${cents} cêntimos.`);
  }
  return { cents, currency };
}

export const zero = (currency: Currency): Money => money(0, currency);

export const fromDecimal = (value: number, currency: Currency): Money =>
  money(Math.round(value * CENTS_PER_UNIT), currency);

export const toDecimal = (m: Money): number => m.cents / CENTS_PER_UNIT;

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) throw new CurrencyMismatchError(a.currency, b.currency);
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.cents + b.cents, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.cents - b.cents, a.currency);
}

export const negate = (m: Money): Money => money(-m.cents, m.currency);

export const abs = (m: Money): Money => money(Math.abs(m.cents), m.currency);

export function min(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return a.cents <= b.cents ? a : b;
}

export function max(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return a.cents >= b.cents ? a : b;
}

export const multiply = (m: Money, factor: number): Money =>
  money(Math.round(m.cents * factor), m.currency);

/** Parte proporcional: `total × part / whole`, arredondada ao cêntimo. */
export function share(total: Money, part: Money, whole: Money): Money {
  assertSameCurrency(part, whole);
  if (whole.cents === 0) return zero(total.currency);
  return money(Math.round((total.cents * part.cents) / whole.cents), total.currency);
}

export const sum = (items: readonly Money[], currency: Currency): Money =>
  items.reduce(add, zero(currency));

export const isNegative = (m: Money): boolean => m.cents < 0;
export const isPositive = (m: Money): boolean => m.cents > 0;
export const isZero = (m: Money): boolean => m.cents === 0;
