'use client';

import { useState } from 'react';
import type { Entry } from '@/domain/entries/entry';
import type { IsoDate } from '@/domain/shared/iso-date';
import { Button } from '@/ui/button';
import { Field, Input } from '@/ui/field';
import { Icon } from '@/ui/icon';
import { Modal } from '@/ui/modal';
import { MoneyText } from '@/ui/money-text';
import { settleEntryAction } from '../actions';
import { useAction } from './use-action';

interface SettleModalProps {
  readonly entry: Entry;
  readonly today: IsoDate;
  readonly open: boolean;
  readonly onClose: () => void;
}

export function SettleModal({ entry, today, open, onClose }: SettleModalProps) {
  const [finalAmount, setFinalAmount] = useState('');
  const [on, setOn] = useState<string>(today);
  const { pending, run } = useAction();
  const submit = () => run(() => settleEntryAction(entry.id, finalAmount, on), onClose);
  const submitOnEnter = (key: string) => key === 'Enter' && submit();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry.kind === 'income' ? 'Marcar como recebido' : 'Marcar como pago'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="success" icon="check" disabled={pending} onClick={submit}>
            Liquidar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-surface-muted rounded-xl p-4">
          <p className="text-fg font-medium">{entry.description}</p>
          <p className="text-fg-muted mt-1 text-sm">
            Valor registado: <MoneyText value={entry.amount} />
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Valor final"
            hint={
              entry.amount
                ? 'Só se o valor real for diferente.'
                : 'Obrigatório: este item não tem valor.'
            }
          >
            <Input
              autoFocus
              inputMode="decimal"
              placeholder="0,00"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              onKeyDown={(e) => submitOnEnter(e.key)}
            />
          </Field>
          <Field label={entry.kind === 'income' ? 'Recebido em' : 'Pago em'}>
            <Input
              type="date"
              value={on}
              onChange={(e) => setOn(e.target.value)}
              onKeyDown={(e) => submitOnEnter(e.key)}
            />
          </Field>
        </div>
        {entry.linkGroup && (
          <p className="text-info flex items-center gap-2 text-sm">
            <Icon name="link" /> Os lançamentos ligados (ex.: IVA) também ficam liquidados.
          </p>
        )}
      </div>
    </Modal>
  );
}
