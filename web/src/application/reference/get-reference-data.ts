import type { ReferenceRepository } from '../ports/reference-repository';
import {
  loadReference,
  requireEntity,
  scopeReference,
  type ReferenceData,
} from '../shared/reference-lookup';

interface Deps {
  readonly reference: ReferenceRepository;
}

/** Entidades, centros e categorias; com `entityId`, só os dessa entidade. */
export class GetReferenceData {
  constructor(private readonly deps: Deps) {}

  async execute(entityId?: string): Promise<ReferenceData> {
    const ref = await loadReference(this.deps.reference);
    return entityId ? scopeReference(ref, requireEntity(ref, entityId)) : ref;
  }
}
