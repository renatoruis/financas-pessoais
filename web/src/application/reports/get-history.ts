import type { Entity } from '@/domain/reference/reference-data';
import {
  categoryTotals,
  monthlySeries,
  type CategoryRow,
  type MonthlyRow,
} from '@/domain/reports/history';
import type { EntryRepository } from '../ports/entry-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import { loadReference, requireEntity } from '../shared/reference-lookup';

export interface HistoryInput {
  readonly entityId: string;
  readonly year: number;
}

export interface History {
  readonly entity: Entity;
  readonly year: number;
  readonly months: readonly MonthlyRow[];
  readonly categories: readonly CategoryRow[];
}

interface Deps {
  readonly entries: EntryRepository;
  readonly reference: ReferenceRepository;
}

/** Histórico de uma entidade (uma só moeda) no ano. */
export class GetHistory {
  constructor(private readonly deps: Deps) {}

  async execute(input: HistoryInput): Promise<History> {
    const entity = requireEntity(await loadReference(this.deps.reference), input.entityId);
    const entries = await this.deps.entries.list({
      entityIds: [entity.id],
      periodFrom: `${input.year}-01`,
      periodTo: `${input.year}-12`,
    });
    return {
      entity,
      year: input.year,
      months: monthlySeries(entries, input.year, entity.currency),
      categories: categoryTotals(entries, input.year, entity.currency),
    };
  }
}
