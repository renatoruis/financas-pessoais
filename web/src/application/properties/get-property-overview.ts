import { summarizeProperties, type PropertyOverview } from '@/domain/properties/property-overview';
import type { YearMonth } from '@/domain/shared/iso-date';
import { loadPropertyContext, type PropertyDeps } from './property-context';

/** Apartamentos, cobertura entre eles e caixa comum no mês. */
export class GetPropertyOverview {
  constructor(private readonly deps: PropertyDeps) {}

  async execute(period: YearMonth): Promise<PropertyOverview> {
    const ctx = await loadPropertyContext(this.deps);
    return summarizeProperties({ ...ctx, period });
  }
}
