/** Data de calendário `YYYY-MM-DD`, sem hora nem fuso. */
export type IsoDate = string;

/** Mês `YYYY-MM`. */
export type YearMonth = string;

export const MONTHS_PER_YEAR = 12;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const YEAR_LENGTH = 4;
const PERIOD_LENGTH = 7;
const MONTH_START = 5;

const pad = (n: number): string => String(n).padStart(2, '0');

export const toIsoDate = (year: number, month: number, day: number): IsoDate =>
  `${year}-${pad(month)}-${pad(day)}`;

export const toYearMonth = (year: number, month: number): YearMonth => `${year}-${pad(month)}`;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export const isYearMonth = (value: string): boolean => YEAR_MONTH_PATTERN.test(value);

export const periodOf = (date: IsoDate): YearMonth => date.slice(0, PERIOD_LENGTH);

export const yearOf = (value: IsoDate | YearMonth): number => Number(value.slice(0, YEAR_LENGTH));

export const monthOf = (value: IsoDate | YearMonth): number =>
  Number(value.slice(MONTH_START, PERIOD_LENGTH));

export const daysInMonth = (period: YearMonth): number =>
  new Date(Date.UTC(yearOf(period), monthOf(period), 0)).getUTCDate();

/** Dia do mês limitado a [1, último dia]: dia 31 em fevereiro passa a 28/29. */
export function dateInPeriod(period: YearMonth, day: number): IsoDate {
  const clamped = Math.min(Math.max(Math.trunc(day) || 1, 1), daysInMonth(period));
  return toIsoDate(yearOf(period), monthOf(period), clamped);
}

export function addMonths(period: YearMonth, months: number): YearMonth {
  const index = yearOf(period) * MONTHS_PER_YEAR + monthOf(period) - 1 + months;
  return toYearMonth(Math.floor(index / MONTHS_PER_YEAR), (index % MONTHS_PER_YEAR) + 1);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return toIsoDate(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
}

export const periodsOfYear = (year: number): YearMonth[] =>
  Array.from({ length: MONTHS_PER_YEAR }, (_, i) => toYearMonth(year, i + 1));
