import type { Entry } from '@/domain/entries/entry';
import { ENTITY_IDS, SYSTEM_CATEGORIES } from '@/domain/reference/reference-data';
import type { IsoDate } from '@/domain/shared/iso-date';
import {
  computeVatBalance,
  vatByQuarter,
  type VatBalance,
  type VatQuarter,
} from '@/domain/vat/vat-balance';
import { nextVatDeadline } from '@/domain/vat/vat-calendar';
import type { EntryRepository } from '../ports/entry-repository';
import type { SettingsRepository } from '../ports/settings-repository';
import type { Clock } from '../ports/system';

export interface VatOverview {
  readonly balance: VatBalance;
  readonly nextDeadline: IsoDate;
  readonly quarters: readonly VatQuarter[];
  /** Faturas (base) ainda por receber. */
  readonly openInvoices: readonly Entry[];
  readonly dailyRateCents: number;
  readonly vatRate: number;
}

interface Deps {
  readonly entries: EntryRepository;
  readonly settings: SettingsRepository;
  readonly clock: Clock;
}

export class GetVatOverview {
  constructor(private readonly deps: Deps) {}

  async execute(): Promise<VatOverview> {
    const [entries, settings] = await Promise.all([
      this.deps.entries.list({ entityIds: [ENTITY_IDS.companyPt] }),
      this.deps.settings.get(),
    ]);
    return {
      balance: computeVatBalance(entries, settings.companyPtInitialCash),
      nextDeadline: nextVatDeadline(this.deps.clock.today()),
      quarters: vatByQuarter(entries, settings.companyPtInitialCash.currency),
      openInvoices: entries.filter(
        (e) =>
          e.source === 'invoice' &&
          e.status === 'pending' &&
          e.categoryId !== SYSTEM_CATEGORIES.vat,
      ),
      dailyRateCents: settings.dailyRate.cents,
      vatRate: settings.vatRate,
    };
  }
}
