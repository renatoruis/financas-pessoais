import type { Currency } from '@/domain/shared/currency';
import type { IsoDate, YearMonth } from '@/domain/shared/iso-date';
import type { Money } from '@/domain/shared/money';

const CENTS = 100;

const currencyFormat: Record<Currency, Intl.NumberFormat> = {
  BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
  EUR: new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    useGrouping: 'always',
  }),
};

export function formatMoney(m: Money, options: { signed?: boolean } = {}): string {
  const text = currencyFormat[m.currency].format(m.cents / CENTS);
  return options.signed && m.cents > 0 ? `+${text}` : text;
}

const dateFormat = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});
const shortDateFormat = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
});
const periodFormat = new Intl.DateTimeFormat('pt-PT', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const shortPeriodFormat = new Intl.DateTimeFormat('pt-PT', { month: 'short', timeZone: 'UTC' });

const asUtc = (date: IsoDate): Date => new Date(`${date}T00:00:00Z`);

export const formatDate = (date: IsoDate): string => dateFormat.format(asUtc(date));

export const formatShortDate = (date: IsoDate): string =>
  shortDateFormat.format(asUtc(date)).replace('.', '');

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export const formatPeriod = (period: YearMonth): string =>
  capitalize(periodFormat.format(asUtc(`${period}-01`)));

export const formatShortPeriod = (period: YearMonth): string =>
  shortPeriodFormat.format(asUtc(`${period}-01`)).replace('.', '');

const percentFormat = new Intl.NumberFormat('pt-PT', { style: 'percent' });

/** 0.25 → "25 %". */
export const formatPercent = (fraction: number): string => percentFormat.format(fraction);

/** [2, 5, 8, 11] → "fev, mai, ago, nov". */
export const formatMonthList = (months: readonly number[]): string =>
  months.map((m) => formatShortPeriod(`2000-${String(m).padStart(2, '0')}`)).join(', ');

/** Cêntimos → texto para inputs ("1234,56"). */
export const centsToInput = (cents: number | null | undefined): string =>
  cents === null || cents === undefined ? '' : (cents / CENTS).toFixed(2).replace('.', ',');
