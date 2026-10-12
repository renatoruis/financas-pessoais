import type { RecurringRepository } from '../ports/recurring-repository';

interface Deps {
  readonly recurring: RecurringRepository;
}

/** Os lançamentos já gerados ficam (perdem só a ligação ao modelo). */
export class DeleteRecurring {
  constructor(private readonly deps: Deps) {}

  execute(id: string): Promise<void> {
    return this.deps.recurring.delete(id);
  }
}
