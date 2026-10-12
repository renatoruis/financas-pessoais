import { belongsToEntity, type Category } from '@/domain/reference/reference-data';
import { slugify } from '@/domain/reference/slug';
import { DomainError } from '@/domain/shared/domain-error';
import type { ReferenceRepository } from '../ports/reference-repository';
import { loadReference, requireEntity } from '../shared/reference-lookup';

export interface CreateCategoryInput {
  readonly name: string;
  readonly entityId: string;
}

interface Deps {
  readonly reference: ReferenceRepository;
}

export class CreateCategory {
  constructor(private readonly deps: Deps) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const id = slugify(input.name);
    if (!id) throw new DomainError('name-required', 'Indica o nome da categoria.');
    const ref = await loadReference(this.deps.reference);
    const entity = requireEntity(ref, input.entityId);
    if (ref.categories.some((c) => c.id === id && belongsToEntity(c, entity.id))) {
      throw new DomainError('duplicate', `A categoria "${input.name.trim()}" já existe.`);
    }
    const category = { id, name: input.name.trim(), entityId: entity.id };
    await this.deps.reference.saveCategory(category);
    return category;
  }
}
