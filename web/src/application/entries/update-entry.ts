import { updateEntry, type Entry, type EntryFields } from '@/domain/entries/entry';
import type { EntryRepository } from '../ports/entry-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import { assertEntryReferences, loadReference } from '../shared/reference-lookup';
import { requireEntry } from './require-entry';

export interface UpdateEntryInput extends EntryFields {
  readonly id: string;
}

interface Deps {
  readonly entries: EntryRepository;
  readonly reference: ReferenceRepository;
}

/** A entidade não muda na edição (a moeda depende dela). */
export class UpdateEntry {
  constructor(private readonly deps: Deps) {}

  async execute(input: UpdateEntryInput): Promise<Entry> {
    const current = await requireEntry(this.deps.entries, input.id);
    const ref = await loadReference(this.deps.reference);
    assertEntryReferences(ref, { ...input, entityId: current.entityId });
    const updated = updateEntry(current, input);
    await this.deps.entries.saveMany([updated]);
    return updated;
  }
}
