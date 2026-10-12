'use client';

import { useState } from 'react';
import type { MovementType } from '@/domain/properties/property-movement';
import type { IsoDate } from '@/domain/shared/iso-date';
import { Button } from '@/ui/button';
import { Field, Input } from '@/ui/field';
import { Modal } from '@/ui/modal';
import { Segmented } from '@/ui/segmented';
import { useAction } from '../../../_components/use-action';
import { registerMovementAction, type MovementFormValues } from '../actions';

const TYPE_OPTIONS = [
  { value: 'contribution' as const, label: 'Aporte', icon: 'arrow-right-to-bracket' },
  { value: 'withdrawal' as const, label: 'Retirada', icon: 'arrow-right-from-bracket' },
];

const HINT: Record<MovementType, string> = {
  contribution:
    'Entra na caixa dos Imóveis. A saída do outro lado regista-se na entidade de origem.',
  withdrawal:
    'Sai da caixa dos Imóveis. A entrada do outro lado regista-se na entidade de destino.',
};

export function MovementButton({ today }: { readonly today: IsoDate }) {
  const [open, setOpen] = useState(false);
  const initial: MovementFormValues = { type: 'contribution', amount: '', date: today, note: '' };
  const [v, setV] = useState<MovementFormValues>(initial);
  const { pending, run } = useAction();
  const set = (patch: Partial<MovementFormValues>) => setV((cur) => ({ ...cur, ...patch }));
  const close = () => {
    setOpen(false);
    setV(initial);
  };

  return (
    <>
      <Button variant="primary" icon="right-left" onClick={() => setOpen(true)}>
        Aporte / retirada
      </Button>
      <Modal
        open={open}
        onClose={close}
        title="Movimento da caixa"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon="check"
              disabled={pending}
              onClick={() => run(() => registerMovementAction(v), close)}
            >
              Registar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Segmented<MovementType>
            options={TYPE_OPTIONS}
            value={v.type}
            onChange={(type) => set({ type })}
          />
          <p className="text-sm text-slate-500">{HINT[v.type]}</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)">
              <Input
                autoFocus
                inputMode="decimal"
                placeholder="0,00"
                value={v.amount}
                onChange={(e) => set({ amount: e.target.value })}
              />
            </Field>
            <Field label="Data">
              <Input type="date" value={v.date} onChange={(e) => set({ date: e.target.value })} />
            </Field>
          </div>
          <Field label="Nota">
            <Input value={v.note} onChange={(e) => set({ note: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </>
  );
}
