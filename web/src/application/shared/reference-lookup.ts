import {
  ofEntity,
  type Category,
  type CostCenter,
  type Entity,
} from '@/domain/reference/reference-data';
import { DomainError } from '@/domain/shared/domain-error';
import type { ReferenceRepository } from '../ports/reference-repository';

export interface ReferenceData {
  readonly entities: readonly Entity[];
  readonly costCenters: readonly CostCenter[];
  readonly categories: readonly Category[];
}

export async function loadReference(repo: ReferenceRepository): Promise<ReferenceData> {
  const [entities, costCenters, categories] = await Promise.all([
    repo.listEntities(),
    repo.listCostCenters(),
    repo.listCategories(),
  ]);
  return { entities, costCenters, categories };
}

/** Só a entidade indicada, com os seus centros e categorias. */
export function scopeReference(ref: ReferenceData, entity: Entity): ReferenceData {
  return {
    entities: [entity],
    costCenters: ofEntity(ref.costCenters, entity.id),
    categories: ofEntity(ref.categories, entity.id),
  };
}

export function requireEntity(ref: ReferenceData, id: string): Entity {
  const entity = ref.entities.find((e) => e.id === id);
  if (!entity) throw new DomainError('not-found', `Entidade desconhecida: ${id}.`);
  return entity;
}

/** Centro da entidade; um centro de outra entidade conta como inexistente. */
export function requireCostCenter(ref: ReferenceData, entityId: string, id: string): CostCenter {
  const center = ref.costCenters.find((c) => c.entityId === entityId && c.id === id);
  if (!center)
    throw new DomainError('invalid-center', `Centro desconhecido nesta entidade: ${id}.`);
  return center;
}

export function requireCategory(ref: ReferenceData, entityId: string, id: string): Category {
  const category = ref.categories.find((c) => c.entityId === entityId && c.id === id);
  if (!category) {
    throw new DomainError('invalid-category', `Categoria desconhecida nesta entidade: ${id}.`);
  }
  return category;
}

export interface EntryReferences {
  readonly entityId: string;
  readonly costCenterId: string;
  readonly categoryId: string;
}

/** Garante que o centro e a categoria existem na entidade. Devolve a entidade. */
export function assertEntryReferences(ref: ReferenceData, ids: EntryReferences): Entity {
  const entity = requireEntity(ref, ids.entityId);
  requireCostCenter(ref, entity.id, ids.costCenterId);
  requireCategory(ref, entity.id, ids.categoryId);
  return entity;
}
