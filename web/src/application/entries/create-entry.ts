import { createEntry, type Entry, type EntryFields } from '@/domain/entries/entry';
import type { EntryRepository } from '../ports/entry-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import type { IdGenerator } from '../ports/system';
import { assertEntryReferences, loadReference } from '../shared/reference-lookup';

export interface CreateEntryInput extends EntryFields {
  readonly entityId: string;
}

interface Deps {
  readonly entries: EntryRepository;
  readonly reference: ReferenceRepository;
  readonly ids: IdGenerator;
}

export class CreateEntry {
  constructor(private readonly deps: Deps) {}

  async execute(input: CreateEntryInput): Promise<Entry> {
    const entity = assertEntryReferences(await loadReference(this.deps.reference), input);
    const entry = createEntry({ ...input, id: this.deps.ids.next(), entity });
    await this.deps.entries.saveMany([entry]);
    return entry;
  }
}
