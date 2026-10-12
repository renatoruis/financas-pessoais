import type { Entry } from '@/domain/entries/entry';
import type { Entity } from '@/domain/reference/reference-data';
import { planRecurringEntries } from '@/domain/recurring/recurring-plan';
import {
  pendingForPeriod,
  summarizeEntity,
  type EntitySummary,
} from '@/domain/reports/entity-summary';
import type { IsoDate, YearMonth } from '@/domain/shared/iso-date';
import type { EntryRepository } from '../ports/entry-repository';
import type { RecurringRepository } from '../ports/recurring-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import type { Clock } from '../ports/system';

export interface EntityCard {
  readonly entity: Entity;
  readonly summary: EntitySummary;
  /** Descrições dos recorrentes devidos no mês ainda sem lançamento. */
  readonly missing: readonly string[];
  readonly pending: readonly Entry[];
}

export interface Dashboard {
  readonly period: YearMonth;
  readonly today: IsoDate;
  readonly cards: readonly EntityCard[];
}

interface Deps {
  readonly entries: EntryRepository;
  readonly recurring: RecurringRepository;
  readonly reference: ReferenceRepository;
  readonly clock: Clock;
}

export class GetDashboard {
  constructor(private readonly deps: Deps) {}

  async execute(period: YearMonth): Promise<Dashboard> {
    const today = this.deps.clock.today();
    const [entities, periodEntries, pendingEntries, templates] = await Promise.all([
      this.deps.reference.listEntities(),
      this.deps.entries.list({ period }),
      this.deps.entries.list({ statuses: ['pending'] }),
      this.deps.recurring.list(),
    ]);
    const missing = planRecurringEntries({ templates, period, existing: periodEntries });
    const cards = entities.map((entity): EntityCard => {
      const own = (list: readonly Entry[]) => list.filter((e) => e.entityId === entity.id);
      const pending = own(pendingEntries);
      return {
        entity,
        summary: summarizeEntity({
          entity,
          periodEntries: own(periodEntries),
          pendingEntries: pending,
          today,
        }),
        missing: missing
          .filter((p) => p.template.entityId === entity.id)
          .map((p) => p.template.description),
        pending: pendingForPeriod(pending, period, today),
      };
    });
    return { period, today, cards };
  }
}
