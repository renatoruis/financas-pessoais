import { entryFromPlan } from '@/domain/recurring/recurring-plan';
import type { EntryRepository } from '../ports/entry-repository';
import type { RecurringRepository } from '../ports/recurring-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import type { IdGenerator } from '../ports/system';
import { loadReference, requireEntity } from '../shared/reference-lookup';
import { PreviewRecurring, type RecurringScope } from './preview-recurring';

export interface GenerateRecurringResult {
  readonly created: number;
}

interface Deps {
  readonly entries: EntryRepository;
  readonly recurring: RecurringRepository;
  readonly reference: ReferenceRepository;
  readonly ids: IdGenerator;
}

/** Cria os pendentes do mês da entidade a partir dos modelos, sem duplicar. */
export class GenerateRecurring {
  constructor(private readonly deps: Deps) {}

  async execute(scope: RecurringScope): Promise<GenerateRecurringResult> {
    const entity = requireEntity(await loadReference(this.deps.reference), scope.entityId);
    const plan = await new PreviewRecurring(this.deps).execute(scope);
    const created = plan.map((p) => entryFromPlan(p, entity, this.deps.ids.next()));
    await this.deps.entries.saveMany(created);
    return { created: created.length };
  }
}
