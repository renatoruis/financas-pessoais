import { z } from 'zod';
import { isIsoDate, isYearMonth } from '@/domain/shared/iso-date';

const CENTS = 100;

/** "1.234,56", "1234.56" ou "1234" → cêntimos. */
export function parseDecimalInput(value: string): number | null {
  const raw = value.trim().replace(/\s|R\$|€/g, '');
  if (!raw) return null;
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * CENTS) : Number.NaN;
}

const cents = z.number({ error: 'Valor inválido.' }).int();
const positiveCents = cents.positive('Indica um valor maior que zero.');

export const optionalMoneyInput = z
  .string()
  .default('')
  .transform(parseDecimalInput)
  .pipe(cents.nonnegative('O valor não pode ser negativo.').nullable());

export const requiredMoneyInput = z.string().transform(parseDecimalInput).pipe(positiveCents);

export const isoDateInput = z.string().refine(isIsoDate, 'Data inválida.');

export const optionalIsoDateInput = z
  .string()
  .default('')
  .transform((v) => v.trim() || null)
  .refine((v) => v === null || isIsoDate(v), 'Data inválida.');

export const periodInput = z.string().refine(isYearMonth, 'Mês inválido.');

export const idInput = z.string().min(1);
