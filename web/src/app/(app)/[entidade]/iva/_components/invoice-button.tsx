'use client';

import { useState } from 'react';
import type { CostCenter } from '@/domain/reference/reference-data';
import type { IsoDate } from '@/domain/shared/iso-date';
import { invoiceAmounts } from '@/domain/vat/invoice';
import { Button } from '@/ui/button';
import { Field, Input, Select } from '@/ui/field';
import { formatMoney } from '@/ui/format';
import { Modal } from '@/ui/modal';
import { ValueList, ValueRow } from '@/ui/value-list';
import { useAction } from '../../../_components/use-action';
import { registerInvoiceAction, type InvoiceFormValues } from '../actions';

const PERCENT = 100;

interface InvoiceButtonProps {
  readonly clients: readonly CostCenter[];
  readonly defaultClientId: string;
  readonly today: IsoDate;
  readonly dailyRateCents: number;
  readonly vatRate: number;
}

export function InvoiceButton(props: InvoiceButtonProps) {
  const { clients, defaultClientId, today, dailyRateCents, vatRate } = props;
  const initial: InvoiceFormValues = {
    costCenterId: defaultClientId,
    invoiceDate: today,
    days: '',
    dueDate: '',
  };
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<InvoiceFormValues>(initial);
  const { pending, run } = useAction();
  const set = (patch: Partial<InvoiceFormValues>) => setV((cur) => ({ ...cur, ...patch }));
  const close = () => {
    setOpen(false);
    setV(initial);
  };
  const days = Number(v.days.replace(',', '.')) || 0;
  const amounts = invoiceAmounts(days, dailyRateCents, vatRate);
  const eur = (cents: number) => formatMoney({ cents, currency: 'EUR' });

  return (
    <>
      <Button variant="primary" icon="file-invoice" onClick={() => setOpen(true)}>
        Nova fatura
      </Button>
      <Modal
        open={open}
        onClose={close}
        title="Nova fatura"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon="check"
              disabled={pending || days <= 0}
              onClick={() => run(() => registerInvoiceAction(v), close)}
            >
              Registar fatura
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cliente">
              <Select
                value={v.costCenterId}
                onChange={(e) => set({ costCenterId: e.target.value })}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Dias faturados">
              <Input
                autoFocus
                inputMode="decimal"
                placeholder="20"
                value={v.days}
                onChange={(e) => set({ days: e.target.value })}
              />
            </Field>
            <Field label="Data da fatura">
              <Input
                type="date"
                value={v.invoiceDate}
                onChange={(e) => set({ invoiceDate: e.target.value })}
              />
            </Field>
            <Field label="Vencimento" hint="Vazio = data da fatura.">
              <Input
                type="date"
                value={v.dueDate}
                onChange={(e) => set({ dueDate: e.target.value })}
              />
            </Field>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-2">
            <ValueList>
              <ValueRow label={`Base (${days} × ${eur(dailyRateCents)})`}>
                {eur(amounts.baseCents)}
              </ValueRow>
              <ValueRow label={`IVA ${Math.round(vatRate * PERCENT)}%`}>
                {eur(amounts.vatCents)}
              </ValueRow>
              <ValueRow label="Total a receber" strong>
                {eur(amounts.totalCents)}
              </ValueRow>
            </ValueList>
          </div>
        </div>
      </Modal>
    </>
  );
}
