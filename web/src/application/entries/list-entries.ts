import type { Entry } from '@/domain/entries/entry';
import type { EntryFilter, EntryRepository } from '../ports/entry-repository';

interface Deps {
  readonly entries: EntryRepository;
}

export class ListEntries {
  constructor(private readonly deps: Deps) {}

  execute(filter: EntryFilter): Promise<Entry[]> {
    return this.deps.entries.list(filter);
  }
}
