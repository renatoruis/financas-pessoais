import { getContainer } from '@/composition/container';
import { ENTITY_IDS } from '@/domain/reference/reference-data';
import type { YearMonth } from '@/domain/shared/iso-date';
import { MoneyText } from '@/ui/money-text';
import { CardNote } from './entity-card';

interface EntityExtraProps {
  readonly entityId: string;
  readonly period: YearMonth;
}

/** Indicador próprio da entidade no cartão (IVA a guardar, caixa dos imóveis). */
export async function EntityExtra({ entityId, period }: EntityExtraProps) {
  const c = getContainer();
  if (entityId === ENTITY_IDS.companyPt) {
    const vat = await c.getVatOverview.execute();
    return (
      <CardNote icon="landmark" label="IVA a guardar">
        <MoneyText value={vat.balance.toSetAside} />
      </CardNote>
    );
  }
  if (entityId === ENTITY_IDS.propertiesBr) {
    const property = await c.getPropertyOverview.execute(period);
    return (
      <CardNote icon="piggy-bank" label="Caixa no fim do mês">
        <MoneyText value={property.cash.end} signed />
      </CardNote>
    );
  }
  return null;
}
