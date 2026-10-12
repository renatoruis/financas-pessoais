import type { Entry, EntryKind, EntryStatus } from '@/domain/entries/entry';
import type { YearMonth } from '@/domain/shared/iso-date';

export interface EntryFilter {
  readonly entityIds?: readonly string[];
  readonly period?: YearMonth;
  readonly periodFrom?: YearMonth;
  readonly periodTo?: YearMonth;
  readonly statuses?: readonly EntryStatus[];
  readonly kind?: EntryKind;
  readonly costCenterId?: string;
  readonly categoryId?: string;
  readonly linkGroup?: string;
  /** Texto livre na descrição ou nas notas. */
  readonly search?: string;
}

export interface EntryRepository {
  findById(id: string): Promise<Entry | null>;
  /** Ordenado por vencimento. */
  list(filter: EntryFilter): Promise<Entry[]>;
  /** Insere ou atualiza todos numa só transação. */
  saveMany(entries: readonly Entry[]): Promise<void>;
  delete(id: string): Promise<void>;
}
