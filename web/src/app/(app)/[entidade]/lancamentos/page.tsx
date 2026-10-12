import { getContainer } from '@/composition/container';
import { totalsByCurrency } from '@/domain/reports/entry-totals';
import { Card } from '@/ui/card';
import { EmptyState } from '@/ui/empty-state';
import { MonthPicker } from '@/ui/month-picker';
import { MoneyText } from '@/ui/money-text';
import { PageHeader } from '@/ui/page-header';
import { NewEntryButton } from '../../_components/new-entry-button';
import { entityHref } from '../../_lib/entity-modules';
import { loadEntityRoute, type EntityParams } from '../../_lib/entity-route';
import { monthPickerProps, resolvePeriod, type SearchParams } from '../../_lib/period';
import { EntryFilters } from './_components/entry-filters';
import { EntryList } from './_components/entry-list';
import { EntryTable } from './_components/entry-table';
import { parseEntryFilters, toEntryFilter } from './filters';

interface PageProps {
  readonly params: Promise<EntityParams>;
  readonly searchParams: Promise<SearchParams>;
}

export default async function EntriesPage({ params, searchParams }: PageProps) {
  const { entity, reference } = await loadEntityRoute(params, 'lancamentos');
  const c = getContainer();
  const query = await searchParams;
  const today = c.clock.today();
  const period = resolvePeriod(query, today);
  const filters = parseEntryFilters(query);
  const entries = await c.listEntries.execute(toEntryFilter(filters, period, entity.id));
  const [totals] = totalsByCurrency(entries);
  const basePath = entityHref(entity.id, 'lancamentos');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lançamentos"
        icon="list-check"
        subtitle={`${entries.length} no mês`}
        actions={
          <>
            <MonthPicker {...monthPickerProps(basePath, query, period, today)} />
            <NewEntryButton reference={reference} today={today} />
          </>
        }
      />
      <EntryFilters reference={reference} values={filters} period={period} basePath={basePath} />
      {totals && (
        <div className="bg-surface ring-line-soft flex flex-wrap items-center gap-x-5 gap-y-1 rounded-2xl px-4 py-3 text-sm shadow-sm ring-1">
          <span className="text-fg-muted">
            Entradas <MoneyText value={totals.income} className="text-fg font-medium" />
          </span>
          <span className="text-fg-muted">
            Saídas <MoneyText value={totals.expense} className="text-fg font-medium" />
          </span>
          <span className="text-fg-muted">
            Líquido <MoneyText value={totals.net} signed className="font-semibold" />
          </span>
        </div>
      )}
      <Card>
        {entries.length === 0 ? (
          <EmptyState icon="magnifying-glass" title="Sem lançamentos">
            Muda o mês ou os filtros, ou cria um novo lançamento.
          </EmptyState>
        ) : (
          <>
            <div className="hidden xl:block">
              <EntryTable entries={entries} reference={reference} today={today} />
            </div>
            <div className="xl:hidden">
              <EntryList entries={entries} reference={reference} today={today} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
