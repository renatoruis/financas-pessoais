import { asc } from 'drizzle-orm';
import type { ReferenceRepository } from '@/application/ports/reference-repository';
import type { Category, CostCenter, Entity } from '@/domain/reference/reference-data';
import type { Db } from '../db/client';
import { categories, costCenters, entities } from '../db/schema';

/** Centros criados na app aparecem depois dos de base (ordenados por nome entre si). */
const APPENDED_SORT_ORDER = 1000;

export class DrizzleReferenceRepository implements ReferenceRepository {
  constructor(private readonly db: Db) {}

  async listEntities(): Promise<Entity[]> {
    return this.db
      .select({
        id: entities.id,
        name: entities.name,
        group: entities.group,
        country: entities.country,
        currency: entities.currency,
        color: entities.color,
      })
      .from(entities)
      .orderBy(asc(entities.sortOrder));
  }

  async listCostCenters(): Promise<CostCenter[]> {
    return this.db
      .select({ id: costCenters.id, name: costCenters.name, entityId: costCenters.entityId })
      .from(costCenters)
      .orderBy(asc(costCenters.sortOrder), asc(costCenters.name));
  }

  async listCategories(): Promise<Category[]> {
    return this.db
      .select({ id: categories.id, name: categories.name, entityId: categories.entityId })
      .from(categories)
      .orderBy(asc(categories.name));
  }

  async saveCostCenter(center: CostCenter): Promise<void> {
    await this.db
      .insert(costCenters)
      .values({ ...center, sortOrder: APPENDED_SORT_ORDER })
      .onConflictDoUpdate({
        target: [costCenters.entityId, costCenters.id],
        set: { name: center.name },
      });
  }

  async saveCategory(category: Category): Promise<void> {
    await this.db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: [categories.entityId, categories.id],
        set: { name: category.name },
      });
  }
}
