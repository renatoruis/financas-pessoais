import { reopenEntry } from '@/domain/entries/entry-lifecycle';
import type { EntryRepository } from '../ports/entry-repository';
import { requireEntry } from './require-entry';

interface Deps {
  readonly entries: EntryRepository;
}

/** Volta a pendente um lançamento liquidado ou cancelado. */
export class ReopenEntry {
  constructor(private readonly deps: Deps) {}

  async execute(id: string): Promise<void> {
    const entry = await requireEntry(this.deps.entries, id);
    await this.deps.entries.saveMany([reopenEntry(entry)]);
  }
}
