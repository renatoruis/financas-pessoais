import type { Category, CostCenter, Entity } from '@/domain/reference/reference-data';

export interface ReferenceRepository {
  listEntities(): Promise<Entity[]>;
  listCostCenters(): Promise<CostCenter[]>;
  listCategories(): Promise<Category[]>;
  saveCostCenter(center: CostCenter): Promise<void>;
  saveCategory(category: Category): Promise<void>;
}
