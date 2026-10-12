import { DEFAULT_SETTINGS } from '@/domain/settings/settings';
import type { Db } from './client';
import { categories, costCenters, entities, settings } from './schema';
import { BASE_CATEGORIES, BASE_COST_CENTERS, BASE_ENTITIES } from './seed-data';

/** Dados base idempotentes: nunca altera o que já existe. */
export async function seedBaseData(db: Db): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .insert(entities)
      .values(BASE_ENTITIES.map((e, i) => ({ ...e, sortOrder: i })))
      .onConflictDoNothing();
    await tx
      .insert(costCenters)
      .values(BASE_COST_CENTERS.map((c, i) => ({ ...c, sortOrder: i })))
      .onConflictDoNothing();
    await tx
      .insert(categories)
      .values([...BASE_CATEGORIES])
      .onConflictDoNothing();
    await tx
      .insert(settings)
      .values({
        id: 1,
        propertyInitialCashCents: DEFAULT_SETTINGS.propertyInitialCash.cents,
        companyPtInitialCashCents: DEFAULT_SETTINGS.companyPtInitialCash.cents,
        dailyRateCents: DEFAULT_SETTINGS.dailyRate.cents,
        vatRate: DEFAULT_SETTINGS.vatRate,
      })
      .onConflictDoNothing();
  });
}
