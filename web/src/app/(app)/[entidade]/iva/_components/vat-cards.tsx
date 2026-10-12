import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { VatOverview } from '@/application/vat/get-vat-overview';
import type { IsoDate } from '@/domain/shared/iso-date';
import { Badge } from '@/ui/badge';
import { Card } from '@/ui/card';
import { EmptyState } from '@/ui/empty-state';
import { formatDate } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';
import { Stat } from '@/ui/stat';
import { Table, Td, Th } from '@/ui/table';
import { ValueList, ValueRow } from '@/ui/value-list';
import { EntryActions } from '../../../_components/entry-actions';

export function VatBalanceCard({ vat }: { readonly vat: VatOverview }) {
  const { balance } = vat;
  return (
    <Card
      title="IVA"
      icon="landmark"
      accent="#145A63"
      actions={
        <Badge
          tone="warning"
          icon="calendar-day"
        >{`Entrega até ${formatDate(vat.nextDeadline)}`}</Badge>
      }
    >
      <Stat
        size="lg"
        label="A guardar (é do Estado)"
        value={<MoneyText value={balance.toSetAside} />}
      />
      <ValueList className="mt-4">
        <ValueRow label="IVA recebido de clientes">
          <MoneyText value={balance.collected} />
        </ValueRow>
        <ValueRow label="IVA já entregue">
          <MoneyText value={balance.paid} />
        </ValueRow>
        <ValueRow label="IVA de faturas por receber">
          <MoneyText value={balance.pendingInvoiceVat} />
        </ValueRow>
      </ValueList>
    </Card>
  );
}

export function CompanyCashCard({ vat }: { readonly vat: VatOverview }) {
  return (
    <Card title="Caixa da empresa" icon="vault" accent="#145A63">
      <Stat
        size="lg"
        label="Disponível (sem o IVA)"
        value={<MoneyText value={vat.balance.available} signed />}
      />
      <ValueList className="mt-4">
        <ValueRow label="Caixa total">
          <MoneyText value={vat.balance.companyCash} signed />
        </ValueRow>
        <ValueRow label="− IVA a guardar">
          <MoneyText value={vat.balance.toSetAside} />
        </ValueRow>
      </ValueList>
    </Card>
  );
}

export function QuartersCard({ vat }: { readonly vat: VatOverview }) {
  return (
    <Card title="IVA por trimestre" icon="calendar" subtitle="Faturado, entregue e em falta">
      {vat.quarters.length === 0 ? (
        <EmptyState icon="calendar" title="Sem IVA registado" />
      ) : (
        <Table stickyFirst>
          <thead>
            <tr>
              <Th>Trimestre</Th>
              <Th className="text-right">Faturado</Th>
              <Th className="text-right">Entregue</Th>
              <Th className="text-right">Em falta</Th>
            </tr>
          </thead>
          <tbody>
            {vat.quarters.map((q) => (
              <tr key={q.quarter}>
                <Td className="text-fg font-medium">{q.quarter}</Td>
                <Td className="text-right">
                  <MoneyText value={q.invoiced} />
                </Td>
                <Td className="text-right">
                  <MoneyText value={q.delivered} />
                </Td>
                <Td className="text-right font-medium">
                  <MoneyText value={q.outstanding} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

interface OpenInvoicesProps {
  readonly vat: VatOverview;
  readonly reference: ReferenceData;
  readonly today: IsoDate;
}

export function OpenInvoicesCard({ vat, reference, today }: OpenInvoicesProps) {
  return (
    <Card
      title="Faturas por receber"
      icon="file-invoice-dollar"
      subtitle="Ao liquidar, o IVA ligado também fica recebido"
    >
      {vat.openInvoices.length === 0 ? (
        <EmptyState icon="circle-check" title="Nada por receber" />
      ) : (
        <ul className="divide-line-soft divide-y">
          {vat.openInvoices.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-fg truncate font-medium">{e.description}</p>
                <p className="text-fg-muted text-xs">
                  Vence {formatDate(e.dueDate)} · {e.notes}
                </p>
              </div>
              <MoneyText value={e.amount} className="font-medium" />
              <EntryActions entry={e} reference={reference} today={today} compact />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
