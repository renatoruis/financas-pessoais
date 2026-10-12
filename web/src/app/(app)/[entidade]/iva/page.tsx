import { getContainer } from '@/composition/container';
import { SYSTEM_COST_CENTERS } from '@/domain/reference/reference-data';
import { PageHeader } from '@/ui/page-header';
import { loadEntityRoute, type EntityParams } from '../../_lib/entity-route';
import { InvoiceButton } from './_components/invoice-button';
import {
  CompanyCashCard,
  OpenInvoicesCard,
  QuartersCard,
  VatBalanceCard,
} from './_components/vat-cards';

interface PageProps {
  readonly params: Promise<EntityParams>;
}

export default async function VatPage({ params }: PageProps) {
  const { reference } = await loadEntityRoute(params, 'iva');
  const c = getContainer();
  const today = c.clock.today();
  const vat = await c.getVatOverview.execute();

  return (
    <div className="space-y-6">
      <PageHeader
        title="IVA e faturas"
        icon="landmark"
        subtitle="Faturas, IVA e caixa disponível"
        actions={
          <InvoiceButton
            clients={reference.costCenters}
            defaultClientId={SYSTEM_COST_CENTERS.reachIt}
            today={today}
            dailyRateCents={vat.dailyRateCents}
            vatRate={vat.vatRate}
          />
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <VatBalanceCard vat={vat} />
        <CompanyCashCard vat={vat} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <OpenInvoicesCard vat={vat} reference={reference} today={today} />
        <QuartersCard vat={vat} />
      </div>
    </div>
  );
}
