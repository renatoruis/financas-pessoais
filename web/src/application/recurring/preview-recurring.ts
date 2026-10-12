import { planRecurringEntries, type PlannedEntry } from '@/domain/recurring/recurring-plan';
import { ofEntity } from '@/domain/reference/reference-data';
import type { YearMonth } from '@/domain/shared/iso-date';
import type { EntryRepository } from '../ports/entry-repository';
import type { RecurringRepository } from '../ports/recurring-repository';

export interface RecurringScope {
  readonly entityId: string;
  readonly period: YearMonth;
}

interface Deps {
  readonly entries: EntryRepository;
  readonly recurring: RecurringRepository;
}

/** O que "Gerar mês" vai criar na entidade (também usado no aviso "Falta lançar"). */
export class PreviewRecurring {
  constructor(private readonly deps: Deps) {}

  async execute({ entityId, period }: RecurringScope): Promise<PlannedEntry[]> {
    const [templates, existing] = await Promise.all([
      this.deps.recurring.list(),
      this.deps.entries.list({ period, entityIds: [entityId] }),
    ]);
    return planRecurringEntries({ templates: ofEntity(templates, entityId), period, existing });
  }
}
