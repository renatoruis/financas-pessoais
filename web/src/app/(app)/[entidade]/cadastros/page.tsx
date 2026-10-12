import { getContainer } from '@/composition/container';
import { ENTITY_IDS } from '@/domain/reference/reference-data';
import { Badge } from '@/ui/badge';
import { Card } from '@/ui/card';
import { centsToInput } from '@/ui/format';
import { PageHeader } from '@/ui/page-header';
import { loadEntityRoute, type EntityParams } from '../../_lib/entity-route';
import type { SettingKey } from './actions';
import { NewReferenceForm } from './_components/reference-forms';
import { SettingsForm } from './_components/settings-form';

const PERCENT = 100;

/** Definições que pertencem a cada entidade. */
const SETTING_FIELDS: Readonly<Record<string, readonly SettingKey[]>> = {
  [ENTITY_IDS.companyPt]: ['companyPtInitialCash', 'dailyRate', 'vatPercent'],
  [ENTITY_IDS.propertiesBr]: ['propertyInitialCash'],
};

interface PageProps {
  readonly params: Promise<EntityParams>;
}

export default async function EntitySettingsPage({ params }: PageProps) {
  const { entity, reference } = await loadEntityRoute(params, 'cadastros');
  const settings = await getContainer().getSettings.execute();
  const fields = SETTING_FIELDS[entity.id] ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Cadastros" icon="sliders" subtitle="Categorias, centros e definições" />
      {fields.length > 0 && (
        <Card title="Definições" icon="gear">
          <SettingsForm
            fields={fields}
            initial={{
              propertyInitialCash: centsToInput(settings.propertyInitialCash.cents),
              companyPtInitialCash: centsToInput(settings.companyPtInitialCash.cents),
              dailyRate: centsToInput(settings.dailyRate.cents),
              vatPercent: String(Math.round(settings.vatRate * PERCENT)),
            }}
          />
        </Card>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Categorias" icon="tags" subtitle={`${reference.categories.length} categorias`}>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {reference.categories.map((cat) => (
              <Badge key={cat.id}>{cat.name}</Badge>
            ))}
          </div>
          <NewReferenceForm kind="category" entityId={entity.id} />
        </Card>
        <Card
          title="Centros"
          icon="diagram-project"
          subtitle={`${reference.costCenters.length} centros`}
        >
          <div className="mb-4 flex flex-wrap gap-1.5">
            {reference.costCenters.map((cc) => (
              <Badge key={cc.id} tone="info">
                {cc.name}
              </Badge>
            ))}
          </div>
          <NewReferenceForm kind="costCenter" entityId={entity.id} />
        </Card>
      </div>
    </div>
  );
}
