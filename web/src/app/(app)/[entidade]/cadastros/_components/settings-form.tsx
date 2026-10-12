'use client';

import { useState } from 'react';
import { Button } from '@/ui/button';
import { Field, Input } from '@/ui/field';
import { useAction } from '../../../_components/use-action';
import { updateSettingsAction, type SettingKey, type SettingsFormValues } from '../actions';

const FIELD_LABEL: Record<SettingKey, { label: string; hint?: string }> = {
  propertyInitialCash: { label: 'Caixa inicial (R$)', hint: 'Antes do primeiro lançamento.' },
  companyPtInitialCash: { label: 'Caixa inicial (€)', hint: 'Antes do primeiro lançamento.' },
  dailyRate: { label: 'Taxa diária (€)', hint: 'Usada nas faturas.' },
  vatPercent: { label: 'IVA (%)' },
};

interface SettingsFormProps {
  readonly fields: readonly SettingKey[];
  readonly initial: Required<SettingsFormValues>;
}

export function SettingsForm({ fields, initial }: SettingsFormProps) {
  const [v, setV] = useState<SettingsFormValues>(() =>
    Object.fromEntries(fields.map((key) => [key, initial[key]])),
  );
  const { pending, run } = useAction();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => updateSettingsAction(v));
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((key) => (
          <Field key={key} label={FIELD_LABEL[key].label} hint={FIELD_LABEL[key].hint}>
            <Input
              inputMode="decimal"
              value={v[key] ?? ''}
              onChange={(e) => setV((cur) => ({ ...cur, [key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" icon="check" disabled={pending}>
          {pending ? 'A gravar…' : 'Gravar definições'}
        </Button>
      </div>
    </form>
  );
}
