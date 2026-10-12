import { money } from '@/domain/shared/money';
import { validateSettings, type Settings } from '@/domain/settings/settings';
import type { SettingsRepository } from '../ports/settings-repository';

/** Atualização parcial: cada entidade só edita os seus campos. */
export interface UpdateSettingsInput {
  readonly propertyInitialCashCents?: number;
  readonly companyPtInitialCashCents?: number;
  readonly dailyRateCents?: number;
  readonly vatRate?: number;
}

interface Deps {
  readonly settings: SettingsRepository;
}

export class UpdateSettings {
  constructor(private readonly deps: Deps) {}

  async execute(input: UpdateSettingsInput): Promise<Settings> {
    const current = await this.deps.settings.get();
    const settings = validateSettings({
      propertyInitialCash: money(
        input.propertyInitialCashCents ?? current.propertyInitialCash.cents,
        'BRL',
      ),
      companyPtInitialCash: money(
        input.companyPtInitialCashCents ?? current.companyPtInitialCash.cents,
        'EUR',
      ),
      dailyRate: money(input.dailyRateCents ?? current.dailyRate.cents, 'EUR'),
      vatRate: input.vatRate ?? current.vatRate,
    });
    await this.deps.settings.save(settings);
    return settings;
  }
}
