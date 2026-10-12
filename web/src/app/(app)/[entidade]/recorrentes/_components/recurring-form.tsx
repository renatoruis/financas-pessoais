'use client';

import { useState } from 'react';
import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { EntryKind } from '@/domain/entries/entry';
import type { RecurringTemplate } from '@/domain/recurring/recurring-template';
import { SYSTEM_COST_CENTERS } from '@/domain/reference/reference-data';
import { Button } from '@/ui/button';
import { Field, Input, Select } from '@/ui/field';
import { centsToInput } from '@/ui/format';
import { Segmented } from '@/ui/segmented';
import { useAction } from '../../../_components/use-action';
import { saveRecurringAction, type RecurringFormValues } from '../actions';

interface RecurringFormProps {
  readonly reference: ReferenceData;
  readonly template?: RecurringTemplate;
  readonly onDone: () => void;
}

/** A `reference` já vem filtrada pela entidade da página. */
function initialValues({ reference, template }: RecurringFormProps): RecurringFormValues {
  const general = reference.costCenters.find((c) => c.id === SYSTEM_COST_CENTERS.general);
  return {
    entityId: template?.entityId ?? reference.entities[0]?.id ?? '',
    costCenterId: template?.costCenterId ?? (general ?? reference.costCenters[0])?.id ?? '',
    categoryId: template?.categoryId ?? reference.categories[0]?.id ?? '',
    kind: template?.kind ?? 'expense',
    description: template?.description ?? '',
    dayOfMonth: template?.dayOfMonth?.toString() ?? '',
    expected: centsToInput(template?.expectedCents),
    months: template?.months?.join(', ') ?? '',
    manual: template?.manual ?? false,
    active: template?.active ?? true,
  };
}

const KIND_OPTIONS = [
  { value: 'expense' as const, label: 'Despesa', icon: 'arrow-trend-down' },
  { value: 'income' as const, label: 'Receita', icon: 'arrow-trend-up' },
];

function Toggle(props: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3">
      <input
        type="checkbox"
        className="mt-1 size-4 accent-slate-900"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-slate-800">{props.label}</span>
        <span className="block text-xs text-slate-500">{props.hint}</span>
      </span>
    </label>
  );
}

export function RecurringForm(props: RecurringFormProps) {
  const { reference, template, onDone } = props;
  const [v, setV] = useState<RecurringFormValues>(() => initialValues(props));
  const { pending, run } = useAction();
  const set = (patch: Partial<RecurringFormValues>) => setV((cur) => ({ ...cur, ...patch }));
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => saveRecurringAction(template?.id ?? null, v), onDone);
      }}
    >
      <Segmented<EntryKind>
        options={KIND_OPTIONS}
        value={v.kind}
        onChange={(kind) => set({ kind })}
      />
      <Field label="Descrição">
        <Input
          autoFocus
          value={v.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Centro">
          <Select value={v.costCenterId} onChange={(e) => set({ costCenterId: e.target.value })}>
            {reference.costCenters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Categoria">
          <Select value={v.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
            {reference.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Dia do mês" hint="Vazio = dia 1.">
          <Input
            inputMode="numeric"
            value={v.dayOfMonth}
            onChange={(e) => set({ dayOfMonth: e.target.value })}
          />
        </Field>
        <Field label="Valor previsto" hint="Vazio se varia.">
          <Input
            inputMode="decimal"
            placeholder="0,00"
            value={v.expected}
            onChange={(e) => set({ expected: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Meses" hint="Ex.: 2, 5, 8, 11. Vazio = todos os meses.">
        <Input value={v.months} onChange={(e) => set({ months: e.target.value })} />
      </Field>
      <Toggle
        label="Manual"
        hint="Não é gerado automaticamente; lança-se quando acontece."
        checked={v.manual}
        onChange={(manual) => set({ manual })}
      />
      <Toggle
        label="Ativo"
        hint="Inativo = deixa de aparecer em “Gerar mês”."
        checked={v.active}
        onChange={(active) => set({ active })}
      />
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
