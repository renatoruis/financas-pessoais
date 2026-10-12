import {
  addMonths,
  isYearMonth,
  periodOf,
  type IsoDate,
  type YearMonth,
} from '@/domain/shared/iso-date';
import { formatPeriod } from '@/ui/format';

export type SearchParams = Record<string, string | string[] | undefined>;

export const PERIOD_PARAM = 'mes';

export function resolvePeriod(params: SearchParams, today: IsoDate): YearMonth {
  const value = params[PERIOD_PARAM];
  return typeof value === 'string' && isYearMonth(value) ? value : periodOf(today);
}

function withParam(path: string, params: SearchParams, period: YearMonth): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => typeof v === 'string' && query.set(k, v));
  query.set(PERIOD_PARAM, period);
  return `${path}?${query.toString()}`;
}

/** Props do `MonthPicker` mantendo os outros filtros da página. */
export function monthPickerProps(
  path: string,
  params: SearchParams,
  period: YearMonth,
  today: IsoDate,
) {
  const current = periodOf(today);
  return {
    label: formatPeriod(period),
    prevHref: withParam(path, params, addMonths(period, -1)),
    nextHref: withParam(path, params, addMonths(period, 1)),
    todayHref: period === current ? undefined : withParam(path, params, current),
  };
}
