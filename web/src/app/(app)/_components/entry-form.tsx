'use client';

import { useState } from 'react';
import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { Entry, EntryKind } from '@/domain/entries/entry';
import { ofEntity, SYSTEM_COST_CENTERS } from '@/domain/reference/reference-data';
import type { IsoDate } from '@/domain/shared/iso-date';
import { Button } from '@/ui/button';
import { Field, Input, Select, Textarea } from '@/ui/field';
import { centsToInput } from '@/ui/format';
import { Segmented } from '@/ui/segmented';
import { createEntryAction, updateEntryAction, type EntryFormValues } from '../actions';
import { useAction } from './use-action';

interface EntryFormProps {
  readonly reference: ReferenceData;
  readonly today: IsoDate;
  readonly entry?: Entry;
  readonly onDone: () => void;
}

/** Centro e categoria por omissão ao escolher a entidade. */
function referenceDefaults(reference: ReferenceData, entityId: string) {
  const centers = ofEntity(reference.costCenters, entityId);
  const general = centers.find((c) => c.id === SYSTEM_COST_CENTERS.general);
  return {
    entityId,
    costCenterId: (general ?? centers[0])?.id ?? '',
    categoryId: ofEntity(reference.categories, entityId)[0]?.id ?? '',
  };
}

function initialValues({ reference, today, entry }: EntryFormProps): EntryFormValues {
  return {
    ...referenceDefaults(reference, reference.entities[0]?.id ?? ''),
    ...(entry && {
      entityId: entry.entityId,
      costCenterId: entry.costCenterId,
      categoryId: entry.categoryId,
    }),
    kind: entry?.kind ?? 'expense',
    description: entry?.description ?? '',
    dueDate: entry?.dueDate ?? today,
    amount: centsToInput(entry?.amount?.cents),
    expected: centsToInput(entry?.expected?.cents),
    settledOn: entry?.settledOn ?? '',
    notes: entry?.notes ?? '',
  };
}

const KIND_OPTIONS = [
  { value: 'expense' as const, label: 'Despesa', icon: 'arrow-trend-down' },
  { value: 'income' as const, label: 'Receita', icon: 'arrow-trend-up' },
];

export function EntryForm(props: EntryFormProps) {
  const { reference, entry, onDone } = props;
  const [v, setV] = useState<EntryFormValues>(() => initialValues(props));
  const { pending, run } = useAction();
  const set = (patch: Partial<EntryFormValues>) => setV((cur) => ({ ...cur, ...patch }));
  const centers = ofEntity(reference.costCenters, v.entityId);
  const categories = ofEntity(reference.categories, v.entityId);
  const submit = () =>
    run(() => (entry ? updateEntryAction(entry.id, v) : createEntryAction(v)), onDone);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Segmented<EntryKind>
        options={KIND_OPTIONS}
        value={v.kind ?? 'expense'}
        onChange={(kind) => set({ kind })}
      />
      {reference.entities.length > 1 && (
        <Field label="Entidade" hint={entry ? 'A entidade não muda depois de gravado.' : undefined}>
          <Select
            value={v.entityId}
            disabled={Boolean(entry)}
            onChange={(e) => set(referenceDefaults(reference, e.target.value))}
          >
            {reference.entities.map((e) => (
              <option key={e.id} value={e.id}>{`${e.name} (${e.currency})`}</option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Descrição">
        <Input
          autoFocus
          value={v.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Ex.: Condomínio Rossi"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Centro">
          <Select value={v.costCenterId} onChange={(e) => set({ costCenterId: e.target.value })}>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Categoria">
          <Select value={v.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Vencimento">
          <Input type="date" value={v.dueDate} onChange={(e) => set({ dueDate: e.target.value })} />
        </Field>
        <Field label="Valor" hint="Vazio se ainda não souberes.">
          <Input
            inputMode="decimal"
            value={v.amount}
            onChange={(e) => set({ amount: e.target.value })}
            placeholder="0,00"
          />
        </Field>
        <Field label="Previsto" hint="Para comparar com o real.">
          <Input
            inputMode="decimal"
            value={v.expected}
            onChange={(e) => set({ expected: e.target.value })}
            placeholder="0,00"
          />
        </Field>
        <Field label="Liquidado em" hint="Vazio = pendente.">
          <Input
            type="date"
            value={v.settledOn}
            onChange={(e) => set({ settledOn: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Notas">
        <Textarea value={v.notes} onChange={(e) => set({ notes: e.target.value })} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" icon="check" disabled={pending}>
          {pending ? 'A gravar…' : 'Gravar'}
        </Button>
      </div>
    </form>
  );
}
