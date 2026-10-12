import type { CurrencyOverview } from '@/application/reports/get-overview';
import { CURRENCY_SYMBOL, type Currency } from '@/domain/shared/currency';
import type { IsoDate } from '@/domain/shared/iso-date';
import { Card } from '@/ui/card';
import { EmptyState } from '@/ui/empty-state';
import { formatShortPeriod } from '@/ui/format';
import { ComboChart } from '../../_components/combo-chart';
import { CategoryBars } from './category-bars';
import { KpiStrip } from './kpi-strip';
import { UpcomingList } from './upcoming-list';

const REGION_LABEL: Record<Currency, string> = { BRL: 'Brasil', EUR: 'Portugal' };
const RESULT_COLOR = 'var(--color-fg)';

function RollingChart({ region }: { region: CurrencyOverview }) {
  const { series, entities, currency } = region;
  const empty = series.every((p) => p.income.cents === 0 && p.expense.cents === 0);
  return (
    <Card title="Últimos 12 meses" icon="chart-column" subtitle="Resultado liquidado por entidade">
      {empty ? (
        <EmptyState icon="chart-column" title="Sem movimentos liquidados nos últimos 12 meses">
          O gráfico aparece quando houver lançamentos liquidados.
        </EmptyState>
      ) : (
        <ComboChart
          currency={currency}
          stacked
          data={series.map((p) => ({
            label: formatShortPeriod(p.period),
            result: p.result.cents,
            ...Object.fromEntries(entities.map((e) => [e.id, p.byEntity[e.id]?.cents ?? 0])),
          }))}
          bars={entities.map((e) => ({ key: e.id, label: e.name, color: e.color }))}
          lines={[{ key: 'result', label: 'Resultado', color: RESULT_COLOR }]}
        />
      )}
    </Card>
  );
}

/** Uma coluna da visão geral: as entidades de uma moeda somadas. */
export function RegionOverview({ region, today }: { region: CurrencyOverview; today: IsoDate }) {
  return (
    <section className="min-w-0 space-y-4">
      <h2 className="text-fg-muted text-sm font-semibold tracking-wide uppercase">
        {`${REGION_LABEL[region.currency]} · ${CURRENCY_SYMBOL[region.currency]}`}
      </h2>
      <KpiStrip kpis={region.kpis} />
      <RollingChart region={region} />
      <CategoryBars categories={region.categories} />
      <UpcomingList upcoming={region.upcoming} entities={region.entities} today={today} />
    </section>
  );
}
