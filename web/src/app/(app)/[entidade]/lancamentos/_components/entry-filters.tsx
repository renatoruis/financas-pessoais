'use client';

import type { ReferenceData } from '@/application/shared/reference-lookup';
import { ButtonLink } from '@/ui/button';
import { Input, Select } from '@/ui/field';
import { SegmentedLinks } from '@/ui/segmented-links';
import { PERIOD_PARAM } from '../../../_lib/period';
import { entriesHref, FILTER_PARAMS, type EntryFilterValues } from '../filters';

interface EntryFiltersProps {
  readonly reference: ReferenceData;
  readonly values: EntryFilterValues;
  readonly period: string;
  readonly basePath: string;
}

const STATUS_TABS = [
  { status: '', label: 'Todos' },
  { status: 'pending', label: 'Pendentes' },
  { status: 'settled', label: 'Liquidados' },
  { status: 'cancelled', label: 'Cancelados' },
];

const NO_FILTERS: EntryFilterValues = {
  costCenterId: '',
  categoryId: '',
  kind: '',
  status: '',
  search: '',
};

/** Filtros por query string: muda um seletor e a página recarrega com os novos parâmetros. */
export function EntryFilters({ reference, values, period, basePath }: EntryFiltersProps) {
  const submit = (form: HTMLFormElement | null) => form?.requestSubmit();
  const active = Object.values(values).some(Boolean);
  const tabs = STATUS_TABS.map(({ status, label }) => ({
    label,
    href: entriesHref(basePath, period, { ...values, status }),
    active: values.status === status,
  }));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentedLinks links={tabs} />
        {active && (
          <ButtonLink variant="ghost" icon="xmark" href={entriesHref(basePath, period, NO_FILTERS)}>
            Limpar filtros
          </ButtonLink>
        )}
      </div>
      <form
        key={entriesHref(basePath, period, values)}
        method="get"
        className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_repeat(3,minmax(0,12rem))]"
        onChange={(e) => e.target instanceof HTMLSelectElement && submit(e.currentTarget)}
      >
        <input type="hidden" name={PERIOD_PARAM} value={period} />
        {values.status && <input type="hidden" name={FILTER_PARAMS.status} value={values.status} />}
        <Input
          name={FILTER_PARAMS.search}
          defaultValue={values.search}
          placeholder="Procurar descrição ou notas…  (Enter)"
          type="search"
        />
        <Select name={FILTER_PARAMS.kind} defaultValue={values.kind}>
          <option value="">Receitas e despesas</option>
          <option value="income">Só receitas</option>
          <option value="expense">Só despesas</option>
        </Select>
        <Select name={FILTER_PARAMS.costCenterId} defaultValue={values.costCenterId}>
          <option value="">Todos os centros</option>
          {reference.costCenters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select name={FILTER_PARAMS.categoryId} defaultValue={values.categoryId}>
          <option value="">Todas as categorias</option>
          {reference.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </form>
    </div>
  );
}
