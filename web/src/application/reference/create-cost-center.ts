import { belongsToEntity, type CostCenter } from '@/domain/reference/reference-data';
import { slugify } from '@/domain/reference/slug';
import { DomainError } from '@/domain/shared/domain-error';
import type { ReferenceRepository } from '../ports/reference-repository';
import { loadReference, requireEntity } from '../shared/reference-lookup';

export interface CreateCostCenterInput {
  readonly name: string;
  readonly entityId: string;
}

interface Deps {
  readonly reference: ReferenceRepository;
}

export class CreateCostCenter {
  constructor(private readonly deps: Deps) {}

  async execute(input: CreateCostCenterInput): Promise<CostCenter> {
    const id = slugify(input.name);
    if (!id) throw new DomainError('name-required', 'Indica o nome do centro.');
    const ref = await loadReference(this.deps.reference);
    const entity = requireEntity(ref, input.entityId);
    if (ref.costCenters.some((c) => c.id === id && belongsToEntity(c, entity.id))) {
      throw new DomainError('duplicate', `O centro "${input.name.trim()}" já existe.`);
    }
    const center = { id, name: input.name.trim(), entityId: entity.id };
    await this.deps.reference.saveCostCenter(center);
    return center;
  }
}
