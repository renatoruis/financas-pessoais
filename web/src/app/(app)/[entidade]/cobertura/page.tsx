import { getContainer } from '@/composition/container';
import { SYSTEM_COST_CENTERS } from '@/domain/reference/reference-data';
import { yearOf } from '@/domain/shared/iso-date';
import { isZero } from '@/domain/shared/money';
import { Card } from '@/ui/card';
import { formatShortPeriod } from '@/ui/format';
import { MonthPicker } from '@/ui/month-picker';
import { PageHeader } from '@/ui/page-header';
import { ComboChart } from '../../_components/combo-chart';
import { entityHref } from '../../_lib/entity-modules';
import { loadEntityRoute, type EntityParams } from '../../_lib/entity-route';
import { nameMap } from '../../_lib/labels';
import { monthPickerProps, resolvePeriod, type SearchParams } from '../../_lib/period';
import { ApartmentCard, CashCard, CoverageCard } from './_components/property-cards';
import { MovementButton } from './_components/movement-button';

interface PageProps {
  readonly params: Promise<EntityParams>;
  readonly searchParams: Promise<SearchParams>;
}

export default async function PropertiesPage({ params, searchParams }: PageProps) {
  const { entity, reference } = await loadEntityRoute(params, 'cobertura');
  const c = getContainer();
  const query = await searchParams;
  const today = c.clock.today();
  const period = resolvePeriod(query, today);
  const year = yearOf(`${period}-01`);
  const [overview, propertyYear] = await Promise.all([
    c.getPropertyOverview.execute(period),
    c.getPropertyYear.execute(year),
  ]);
  const names = nameMap(reference.costCenters);
  const apartments = overview.apartments.filter(
    (a) =>
      a.costCenterId !== SYSTEM_COST_CENTERS.general || !isZero(a.income) || !isZero(a.expense),
  );
  const chartData = propertyYear.months.map((m) => ({
    label: formatShortPeriod(m.period),
    result: m.monthResult.cents,
    end: m.end.cents,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cobertura e caixa"
        icon="building"
        subtitle="Apartamentos, cobertura entre eles e caixa"
        actions={
          <>
            <MonthPicker
              {...monthPickerProps(entityHref(entity.id, 'cobertura'), query, period, today)}
            />
            <MovementButton today={today} />
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {apartments.map((a) => (
          <ApartmentCard key={a.costCenterId} apartment={a} names={names} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <CoverageCard
          coverage={overview.coverage}
          names={names}
          visible={new Set(apartments.map((a) => a.costCenterId))}
        />
        <CashCard cash={overview.cash} />
      </div>
      <Card
        title={`Caixa em ${year}`}
        subtitle="Resultado e caixa no fim de cada mês"
        icon="chart-line"
      >
        <ComboChart
          data={chartData}
          currency={overview.cash.end.currency}
          bars={[{ key: 'result', label: 'Resultado do mês', color: 'var(--color-chart-extra)' }]}
          lines={[{ key: 'end', label: 'Caixa no fim', color: entity.color }]}
        />
      </Card>
    </div>
  );
}
