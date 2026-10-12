import type { Entry } from '@/domain/entries/entry';
import { DomainError } from '@/domain/shared/domain-error';
import type { EntryRepository } from '../ports/entry-repository';

export async function requireEntry(repo: EntryRepository, id: string): Promise<Entry> {
  const entry = await repo.findById(id);
  if (!entry) throw new DomainError('not-found', 'Lançamento não encontrado.');
  return entry;
}
