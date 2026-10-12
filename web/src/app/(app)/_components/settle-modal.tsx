'use client';

import { useState } from 'react';
import type { Entry } from '@/domain/entries/entry';
import { Button } from '@/ui/button';
import { Field, Input } from '@/ui/field';
import { Icon } from '@/ui/icon';
import { Modal } from '@/ui/modal';
import { MoneyText } from '@/ui/money-text';
import { settleEntryAction } from '../actions';
import { useAction } from './use-action';

interface SettleModalProps {
  readonly entry: Entry;
  readonly open: boolean;
  readonly onClose: () => void;
}

export function SettleModal({ entry, open, onClose }: SettleModalProps) {
  const [finalAmount, setFinalAmount] = useState('');
  const { pending, run } = useAction();
  const submit = () => run(() => settleEntryAction(entry.id, finalAmount), onClose);
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
            Liquidar hoje
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="font-medium text-slate-900">{entry.description}</p>
          <p className="mt-1 text-sm text-slate-500">
            Valor registado: <MoneyText value={entry.amount} />
          </p>
        </div>
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
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </Field>
        {entry.linkGroup && (
          <p className="flex items-center gap-2 text-sm text-sky-700">
            <Icon name="link" /> Os lançamentos ligados (ex.: IVA) também ficam liquidados.
          </p>
        )}
      </div>
    </Modal>
  );
}
