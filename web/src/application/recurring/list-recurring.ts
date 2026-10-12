import type { RecurringTemplate } from '@/domain/recurring/recurring-template';
import { ofEntity } from '@/domain/reference/reference-data';
import type { RecurringRepository } from '../ports/recurring-repository';

interface Deps {
  readonly recurring: RecurringRepository;
}

export class ListRecurring {
  constructor(private readonly deps: Deps) {}

  async execute(entityId: string): Promise<RecurringTemplate[]> {
    return ofEntity(await this.deps.recurring.list(), entityId);
  }
}
