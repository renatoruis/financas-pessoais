'use client';

import type { ReferenceData } from '@/application/shared/reference-lookup';
import { ENTRY_STATUSES } from '@/domain/entries/entry';
import { ButtonLink } from '@/ui/button';
import { Input, Select } from '@/ui/field';
import { STATUS_LABEL } from '../../../_lib/labels';
import { PERIOD_PARAM } from '../../../_lib/period';
import { FILTER_PARAMS, type EntryFilterValues } from '../filters';

interface EntryFiltersProps {
  readonly reference: ReferenceData;
  readonly values: EntryFilterValues;
  readonly period: string;
  readonly basePath: string;
}

/** Filtros por query string: muda um seletor e a página recarrega com os novos parâmetros. */
export function EntryFilters({ reference, values, period, basePath }: EntryFiltersProps) {
  const submit = (form: HTMLFormElement | null) => form?.requestSubmit();
  const active = Object.values(values).some(Boolean);
  return (
    <form
      method="get"
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(2,minmax(0,12rem))_auto]"
      onChange={(e) => e.target instanceof HTMLSelectElement && submit(e.currentTarget)}
    >
      <input type="hidden" name={PERIOD_PARAM} value={period} />
      <Input
        name={FILTER_PARAMS.search}
        defaultValue={values.search}
        placeholder="Procurar descrição ou notas…  (Enter)"
        type="search"
      />
      <Select name={FILTER_PARAMS.costCenter} defaultValue={values.costCenterId}>
        <option value="">Todos os centros</option>
        {reference.costCenters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select name={FILTER_PARAMS.status} defaultValue={values.status}>
        <option value="">Todos os estados</option>
        {ENTRY_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </Select>
      {active && (
        <ButtonLink variant="ghost" icon="xmark" href={`${basePath}?${PERIOD_PARAM}=${period}`}>
          Limpar
        </ButtonLink>
      )}
    </form>
  );
}
