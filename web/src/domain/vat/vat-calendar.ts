import type { Entry } from '../entries/entry';
import { addMonths, monthOf, periodOf, toIsoDate, yearOf, type IsoDate } from '../shared/iso-date';

/** IVA trimestral: entrega até dia 25 de fevereiro, maio, agosto e novembro. */
export const VAT_DEADLINE_DAY = 25;
enum Month {
  February = 2,
  May = 5,
  August = 8,
  November = 11,
}
export const VAT_DEADLINE_MONTHS = [Month.February, Month.May, Month.August, Month.November];
/** A entrega feita no mês M refere-se ao trimestre que acabou em M − 2 (ex.: maio → T1). */
export const VAT_PAYMENT_LAG_MONTHS = 2;
const MONTHS_PER_QUARTER = 3;

export function nextVatDeadline(today: IsoDate): IsoDate {
  const year = yearOf(today);
  const thisYear = VAT_DEADLINE_MONTHS.map((m) => toIsoDate(year, m, VAT_DEADLINE_DAY));
  return thisYear.find((d) => d >= today) ?? toIsoDate(year + 1, Month.February, VAT_DEADLINE_DAY);
}

/** Trimestre a que o IVA pertence: "2026-T3". Para entregas (despesa) recua 2 meses. */
export function vatQuarterOf(entry: Entry): string {
  const period = periodOf(entry.dueDate);
  const reference = entry.kind === 'expense' ? addMonths(period, -VAT_PAYMENT_LAG_MONTHS) : period;
  return `${yearOf(reference)}-T${Math.ceil(monthOf(reference) / MONTHS_PER_QUARTER)}`;
}
