import { notFound } from 'next/navigation';
import { scopeReference, type ReferenceData } from '@/application/shared/reference-lookup';
import { getContainer } from '@/composition/container';
import type { Entity } from '@/domain/reference/reference-data';
import { hasModule } from './entity-modules';

export interface EntityParams {
  readonly entidade: string;
}

export interface EntityRoute {
  readonly entity: Entity;
  /** Só a entidade da rota, com os seus centros e categorias. */
  readonly reference: ReferenceData;
}

/** Resolve a entidade de `/[entidade]/…`; 404 se não existir ou se o módulo não for dela. */
export async function loadEntityRoute(
  params: Promise<EntityParams>,
  moduleSlug = '',
): Promise<EntityRoute> {
  const { entidade } = await params;
  const reference = await getContainer().getReferenceData.execute();
  const entity = reference.entities.find((e) => e.id === entidade);
  if (!entity || !hasModule(entity.id, moduleSlug)) notFound();
  return { entity, reference: scopeReference(reference, entity) };
}
