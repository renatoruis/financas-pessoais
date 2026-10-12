import { eq } from 'drizzle-orm';
import type { SettingsRepository } from '@/application/ports/settings-repository';
import { money } from '@/domain/shared/money';
import { DEFAULT_SETTINGS, type Settings } from '@/domain/settings/settings';
import type { Db } from '../db/client';
import { settings } from '../db/schema';

const SETTINGS_ID = 1;

export class DrizzleSettingsRepository implements SettingsRepository {
  constructor(private readonly db: Db) {}

  async get(): Promise<Settings> {
    const [row] = await this.db.select().from(settings).where(eq(settings.id, SETTINGS_ID));
    if (!row) return DEFAULT_SETTINGS;
    return {
      propertyInitialCash: money(row.propertyInitialCashCents, 'BRL'),
      companyPtInitialCash: money(row.companyPtInitialCashCents, 'EUR'),
      dailyRate: money(row.dailyRateCents, 'EUR'),
      vatRate: row.vatRate,
    };
  }

  async save(s: Settings): Promise<void> {
    const row = {
      id: SETTINGS_ID,
      propertyInitialCashCents: s.propertyInitialCash.cents,
      companyPtInitialCashCents: s.companyPtInitialCash.cents,
      dailyRateCents: s.dailyRate.cents,
      vatRate: s.vatRate,
    };
    await this.db
      .insert(settings)
      .values(row)
      .onConflictDoUpdate({ target: settings.id, set: row });
  }
}
