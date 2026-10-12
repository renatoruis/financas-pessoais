import type { EntryFilter } from '@/application/ports/entry-repository';
import {
  ENTRY_KINDS,
  ENTRY_STATUSES,
  type EntryKind,
  type EntryStatus,
} from '@/domain/entries/entry';
import type { YearMonth } from '@/domain/shared/iso-date';
import { PERIOD_PARAM, type SearchParams } from '../../_lib/period';

export interface EntryFilterValues {
  readonly costCenterId: string;
  readonly categoryId: string;
  readonly kind: string;
  readonly status: string;
  readonly search: string;
}

/** Nome de cada filtro na query string. */
export const FILTER_PARAMS: Record<keyof EntryFilterValues, string> = {
  costCenterId: 'centro',
  categoryId: 'categoria',
  kind: 'tipo',
  status: 'estado',
  search: 'q',
};

const FILTER_KEYS = Object.keys(FILTER_PARAMS) as (keyof EntryFilterValues)[];

const text = (params: SearchParams, key: string): string => {
  const value = params[key];
  return typeof value === 'string' ? value.trim() : '';
};

const isStatus = (value: string): value is EntryStatus =>
  (ENTRY_STATUSES as readonly string[]).includes(value);

const isKind = (value: string): value is EntryKind =>
  (ENTRY_KINDS as readonly string[]).includes(value);

export function parseEntryFilters(params: SearchParams): EntryFilterValues {
  const entries = FILTER_KEYS.map((key) => [key, text(params, FILTER_PARAMS[key])]);
  return Object.fromEntries(entries) as Record<keyof EntryFilterValues, string>;
}

/** Link para a lista com os filtros dados (vazios ficam de fora). */
export function entriesHref(basePath: string, period: string, values: EntryFilterValues): string {
  const params = new URLSearchParams({ [PERIOD_PARAM]: period });
  FILTER_KEYS.forEach((key) => values[key] && params.set(FILTER_PARAMS[key], values[key]));
  return `${basePath}?${params.toString()}`;
}

/** Sem `entityId` (só na API) lista todas as entidades. */
export function toEntryFilter(
  values: EntryFilterValues,
  period: YearMonth,
  entityId?: string,
): EntryFilter {
  return {
    period,
    entityIds: entityId ? [entityId] : undefined,
    costCenterId: values.costCenterId || undefined,
    categoryId: values.categoryId || undefined,
    kind: isKind(values.kind) ? values.kind : undefined,
    statuses: isStatus(values.status) ? [values.status] : undefined,
    search: values.search || undefined,
  };
}
