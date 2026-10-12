import { settleWithLinked } from '@/domain/entries/linked-settlement';
import type { IsoDate } from '@/domain/shared/iso-date';
import type { EntryRepository } from '../ports/entry-repository';
import type { SettingsRepository } from '../ports/settings-repository';
import type { Clock } from '../ports/system';
import { requireEntry } from './require-entry';

export interface SettleEntryInput {
  readonly id: string;
  readonly finalAmountCents: number | null;
  /** Por omissão, hoje. */
  readonly on?: IsoDate;
}

export interface SettleEntryResult {
  readonly settled: number;
}

interface Deps {
  readonly entries: EntryRepository;
  readonly settings: SettingsRepository;
  readonly clock: Clock;
}

/** Liquida o lançamento e os ligados (ex.: fatura + IVA). */
export class SettleEntry {
  constructor(private readonly deps: Deps) {}

  async execute(input: SettleEntryInput): Promise<SettleEntryResult> {
    const main = await requireEntry(this.deps.entries, input.id);
    const linked = main.linkGroup
      ? await this.deps.entries.list({ linkGroup: main.linkGroup })
      : [];
    const { vatRate } = await this.deps.settings.get();
    const settled = settleWithLinked({
      main,
      linked,
      on: input.on ?? this.deps.clock.today(),
      finalAmountCents: input.finalAmountCents,
      vatRate,
    });
    await this.deps.entries.saveMany(settled);
    return { settled: settled.length };
  }
}
