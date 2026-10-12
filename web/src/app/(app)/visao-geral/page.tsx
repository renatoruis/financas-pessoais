import { getContainer } from '@/composition/container';
import { MonthPicker } from '@/ui/month-picker';
import { PageHeader } from '@/ui/page-header';
import { monthPickerProps, resolvePeriod, type SearchParams } from '../_lib/period';
import { RegionOverview } from './_components/region-overview';

interface PageProps {
  readonly searchParams: Promise<SearchParams>;
}

export default async function OverviewPage({ searchParams }: PageProps) {
  const c = getContainer();
  const params = await searchParams;
  const today = c.clock.today();
  const period = resolvePeriod(params, today);
  const overview = await c.getOverview.execute(period);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        icon="chart-pie"
        subtitle="Todas as entidades juntas, Brasil e Portugal lado a lado (sem conversão)"
        actions={<MonthPicker {...monthPickerProps('/visao-geral', params, period, today)} />}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        {overview.regions.map((region) => (
          <RegionOverview key={region.currency} region={region} today={overview.today} />
        ))}
      </div>
    </div>
  );
}
