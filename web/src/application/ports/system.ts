import type { IsoDate } from '@/domain/shared/iso-date';

/** Data de hoje no fuso da app. */
export interface Clock {
  today(): IsoDate;
}

export interface IdGenerator {
  next(): string;
}
