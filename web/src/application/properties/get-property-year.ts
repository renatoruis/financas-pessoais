import { summarizePropertyYear, type PropertyYear } from '@/domain/properties/property-year';
import { loadPropertyContext, type PropertyDeps } from './property-context';

export class GetPropertyYear {
  constructor(private readonly deps: PropertyDeps) {}

  async execute(year: number): Promise<PropertyYear> {
    const ctx = await loadPropertyContext(this.deps);
    return summarizePropertyYear({ ...ctx, year });
  }
}
