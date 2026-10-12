import type { EntryFilter } from '@/application/ports/entry-repository';
import { ENTRY_STATUSES, type EntryStatus } from '@/domain/entries/entry';
import type { YearMonth } from '@/domain/shared/iso-date';
import type { SearchParams } from '../../_lib/period';

export const FILTER_PARAMS = {
  costCenter: 'centro',
  status: 'estado',
  search: 'q',
} as const;

export interface EntryFilterValues {
  readonly costCenterId: string;
  readonly status: string;
  readonly search: string;
}

const text = (params: SearchParams, key: string): string => {
  const value = params[key];
  return typeof value === 'string' ? value.trim() : '';
};

const isStatus = (value: string): value is EntryStatus =>
  (ENTRY_STATUSES as readonly string[]).includes(value);

export function parseEntryFilters(params: SearchParams): EntryFilterValues {
  return {
    costCenterId: text(params, FILTER_PARAMS.costCenter),
    status: text(params, FILTER_PARAMS.status),
    search: text(params, FILTER_PARAMS.search),
  };
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
    statuses: isStatus(values.status) ? [values.status] : undefined,
    search: values.search || undefined,
  };
}
