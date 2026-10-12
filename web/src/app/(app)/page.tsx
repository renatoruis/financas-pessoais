import { getContainer } from '@/composition/container';
import { ENTITY_GROUPS } from '@/domain/reference/reference-data';
import { Icon } from '@/ui/icon';
import { MonthPicker } from '@/ui/month-picker';
import { PageHeader } from '@/ui/page-header';
import { EntityCard } from './_components/entity-card';
import { EntityExtra } from './_components/entity-extra';
import { NewEntryButton } from './_components/new-entry-button';
import { PendingList } from './_components/pending-list';
import { entityHref } from './_lib/entity-modules';
import { GROUP_ICON, GROUP_LABEL } from './_lib/labels';
import { monthPickerProps, PERIOD_PARAM, resolvePeriod, type SearchParams } from './_lib/period';

interface PageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const c = getContainer();
  const params = await searchParams;
  const today = c.clock.today();
  const period = resolvePeriod(params, today);
  const [dashboard, reference] = await Promise.all([
    c.getDashboard.execute(period),
    c.getReferenceData.execute(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Painel"
        icon="gauge-high"
        subtitle="Como o mês vai fechar em cada entidade"
        actions={
          <>
            <MonthPicker {...monthPickerProps('/', params, period, today)} />
            <NewEntryButton reference={reference} today={today} />
          </>
        }
      />
      {ENTITY_GROUPS.map((group) => {
        const cards = dashboard.cards.filter((card) => card.entity.group === group);
        if (cards.length === 0) return null;
        return (
          <section key={group} className="space-y-3">
            <h2 className="text-fg-muted flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
              <Icon name={GROUP_ICON[group]} />
              {GROUP_LABEL[group]}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {cards.map((card) => (
                <EntityCard
                  key={card.entity.id}
                  card={card}
                  href={`${entityHref(card.entity.id)}?${PERIOD_PARAM}=${period}`}
                  extra={<EntityExtra entityId={card.entity.id} period={period} />}
                />
              ))}
            </div>
          </section>
        );
      })}
      <PendingList
        entries={dashboard.cards.flatMap((card) => card.pending)}
        reference={reference}
        today={today}
      />
    </div>
  );
}
