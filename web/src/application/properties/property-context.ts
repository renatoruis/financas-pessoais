import type { Entry } from '@/domain/entries/entry';
import { ENTITY_IDS, ofEntity, SYSTEM_COST_CENTERS } from '@/domain/reference/reference-data';
import type { Money } from '@/domain/shared/money';
import type { EntryRepository } from '../ports/entry-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import type { SettingsRepository } from '../ports/settings-repository';

export interface PropertyContext {
  readonly entries: readonly Entry[];
  readonly centerIds: readonly string[];
  readonly initialCash: Money;
}

export interface PropertyDeps {
  readonly entries: EntryRepository;
  readonly reference: ReferenceRepository;
  readonly settings: SettingsRepository;
}

/** Centros dos Imóveis sem a Caixa (Geral + apartamentos) e todos os lançamentos dos Imóveis. */
export async function loadPropertyContext(deps: PropertyDeps): Promise<PropertyContext> {
  const [entries, allCenters, settings] = await Promise.all([
    deps.entries.list({ entityIds: [ENTITY_IDS.propertiesBr] }),
    deps.reference.listCostCenters(),
    deps.settings.get(),
  ]);
  const centers = ofEntity(allCenters, ENTITY_IDS.propertiesBr).filter(
    (c) => c.id !== SYSTEM_COST_CENTERS.propertyCash,
  );
  return {
    entries,
    centerIds: centers.map((c) => c.id),
    initialCash: settings.propertyInitialCash,
  };
}
