import { getContainer } from '@/composition/container';
import { yearOf } from '@/domain/shared/iso-date';
import { sum } from '@/domain/shared/money';
import { Card } from '@/ui/card';
import { formatShortPeriod } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';
import { MonthPicker } from '@/ui/month-picker';
import { PageHeader } from '@/ui/page-header';
import { Stat } from '@/ui/stat';
import { ComboChart } from '../../_components/combo-chart';
import { entityHref } from '../../_lib/entity-modules';
import { loadEntityRoute, type EntityParams } from '../../_lib/entity-route';
import { nameMap } from '../../_lib/labels';
import type { SearchParams } from '../../_lib/period';
import { CategoryTable, MonthlyTable } from './_components/history-tables';

interface PageProps {
  readonly params: Promise<EntityParams>;
  readonly searchParams: Promise<SearchParams>;
}

const YEAR_PATTERN = /^\d{4}$/;

export default async function HistoryPage({ params, searchParams }: PageProps) {
  const { entity, reference } = await loadEntityRoute(params, 'historico');
  const c = getContainer();
  const query = await searchParams;
  const currentYear = yearOf(c.clock.today());
  const year =
    typeof query.ano === 'string' && YEAR_PATTERN.test(query.ano) ? Number(query.ano) : currentYear;
  const history = await c.getHistory.execute({ entityId: entity.id, year });
  const { currency } = entity;
  const href = (y: number) => `${entityHref(entity.id, 'historico')}?ano=${y}`;
  const total = (pick: (m: (typeof history.months)[number]) => typeof m.income) =>
    sum(history.months.map(pick), currency);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico"
        icon="chart-line"
        subtitle="Receitas, despesas e resultado liquidados, por mês"
        actions={
          <MonthPicker
            unit="year"
            label={String(year)}
            prevHref={href(year - 1)}
            nextHref={href(year + 1)}
            todayHref={year === currentYear ? undefined : href(currentYear)}
          />
        }
      />
      <Card className="flex flex-wrap gap-x-12 gap-y-4">
        <Stat
          size="lg"
          label={`Receitas ${year}`}
          value={<MoneyText value={total((m) => m.income)} />}
        />
        <Stat
          size="lg"
          label={`Despesas ${year}`}
          value={<MoneyText value={total((m) => m.expense)} />}
        />
        <Stat
          size="lg"
          label={`Resultado ${year}`}
          value={<MoneyText value={total((m) => m.result)} signed />}
        />
      </Card>
      <Card title={`${entity.name} em ${year}`} icon="chart-column" accent={entity.color}>
        <ComboChart
          currency={currency}
          data={history.months.map((m) => ({
            label: formatShortPeriod(m.period),
            income: m.income.cents,
            expense: m.expense.cents,
            cumulative: m.cumulative.cents,
          }))}
          bars={[
            { key: 'income', label: 'Receitas', color: 'var(--color-chart-income)' },
            { key: 'expense', label: 'Despesas', color: 'var(--color-chart-expense)' },
          ]}
          lines={[{ key: 'cumulative', label: 'Acumulado', color: entity.color }]}
        />
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <MonthlyTable history={history} />
        <CategoryTable history={history} names={nameMap(reference.categories)} />
      </div>
    </div>
  );
}
