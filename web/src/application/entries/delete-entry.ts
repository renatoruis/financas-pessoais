import type { EntryRepository } from '../ports/entry-repository';
import { requireEntry } from './require-entry';

interface Deps {
  readonly entries: EntryRepository;
}

export class DeleteEntry {
  constructor(private readonly deps: Deps) {}

  async execute(id: string): Promise<void> {
    await requireEntry(this.deps.entries, id);
    await this.deps.entries.delete(id);
  }
}
