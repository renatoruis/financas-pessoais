import { validateTemplate, type RecurringTemplate } from '@/domain/recurring/recurring-template';
import type { RecurringRepository } from '../ports/recurring-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import type { IdGenerator } from '../ports/system';
import { assertEntryReferences, loadReference } from '../shared/reference-lookup';

/** Sem `id` cria um modelo novo. */
export type SaveRecurringInput = Omit<RecurringTemplate, 'id'> & { readonly id?: string };

interface Deps {
  readonly recurring: RecurringRepository;
  readonly reference: ReferenceRepository;
  readonly ids: IdGenerator;
}

export class SaveRecurring {
  constructor(private readonly deps: Deps) {}

  async execute(input: SaveRecurringInput): Promise<RecurringTemplate> {
    assertEntryReferences(await loadReference(this.deps.reference), input);
    const template = validateTemplate({ ...input, id: input.id ?? this.deps.ids.next() });
    await this.deps.recurring.save(template);
    return template;
  }
}
