import { notFound } from 'next/navigation';
import { getContainer } from '@/composition/container';
import { MonthPicker } from '@/ui/month-picker';
import { PageHeader } from '@/ui/page-header';
import { EntityCard } from '../_components/entity-card';
import { EntityExtra } from '../_components/entity-extra';
import { NewEntryButton } from '../_components/new-entry-button';
import { PendingList } from '../_components/pending-list';
import { entityHref } from '../_lib/entity-modules';
import { loadEntityRoute, type EntityParams } from '../_lib/entity-route';
import { monthPickerProps, PERIOD_PARAM, resolvePeriod, type SearchParams } from '../_lib/period';

interface PageProps {
  readonly params: Promise<EntityParams>;
  readonly searchParams: Promise<SearchParams>;
}

export default async function EntitySummaryPage({ params, searchParams }: PageProps) {
  const { entity, reference } = await loadEntityRoute(params);
  const c = getContainer();
  const query = await searchParams;
  const today = c.clock.today();
  const period = resolvePeriod(query, today);
  const dashboard = await c.getDashboard.execute(period);
  const card = dashboard.cards.find((item) => item.entity.id === entity.id);
  if (!card) notFound();

  return (
    <>
      <PageHeader
        title="Resumo"
        icon="gauge"
        subtitle="Como o mês vai fechar"
        actions={
          <>
            <MonthPicker {...monthPickerProps(entityHref(entity.id), query, period, today)} />
            <NewEntryButton reference={reference} today={today} />
          </>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,26rem)_1fr]">
        <EntityCard
          card={card}
          href={`${entityHref(entity.id, 'lancamentos')}?${PERIOD_PARAM}=${period}`}
          extra={<EntityExtra entityId={entity.id} period={period} />}
        />
        <PendingList entries={card.pending} reference={reference} today={today} />
      </div>
    </>
  );
}
