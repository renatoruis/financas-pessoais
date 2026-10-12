import { getContainer } from '@/composition/container';
import { Card } from '@/ui/card';
import { EmptyState } from '@/ui/empty-state';
import { MonthPicker } from '@/ui/month-picker';
import { PageHeader } from '@/ui/page-header';
import { entityHref } from '../../_lib/entity-modules';
import { loadEntityRoute, type EntityParams } from '../../_lib/entity-route';
import { monthPickerProps, resolvePeriod, type SearchParams } from '../../_lib/period';
import { GeneratePanel } from './_components/generate-panel';
import { NewRecurringButton } from './_components/recurring-buttons';
import { RecurringTable } from './_components/recurring-table';

interface PageProps {
  readonly params: Promise<EntityParams>;
  readonly searchParams: Promise<SearchParams>;
}

export default async function RecurringPage({ params, searchParams }: PageProps) {
  const { entity, reference } = await loadEntityRoute(params, 'recorrentes');
  const c = getContainer();
  const query = await searchParams;
  const today = c.clock.today();
  const period = resolvePeriod(query, today);
  const [templates, plan] = await Promise.all([
    c.listRecurring.execute(entity.id),
    c.previewRecurring.execute({ entityId: entity.id, period }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recorrentes"
        icon="repeat"
        subtitle="Modelos que geram os pendentes de cada mês"
        actions={
          <>
            <MonthPicker
              {...monthPickerProps(entityHref(entity.id, 'recorrentes'), query, period, today)}
            />
            <NewRecurringButton reference={reference} />
          </>
        }
      />
      <GeneratePanel entity={entity} period={period} plan={plan} />
      {templates.length === 0 ? (
        <Card>
          <EmptyState icon="repeat" title="Sem recorrentes">
            Cria um modelo para as contas que se repetem todos os meses.
          </EmptyState>
        </Card>
      ) : (
        <RecurringTable entity={entity} templates={templates} reference={reference} />
      )}
    </div>
  );
}
