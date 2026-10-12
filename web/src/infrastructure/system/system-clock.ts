import { randomUUID } from 'node:crypto';
import type { Clock, IdGenerator } from '@/application/ports/system';
import type { IsoDate } from '@/domain/shared/iso-date';

/** Data de hoje no fuso configurado (o servidor pode estar em UTC). */
export class SystemClock implements Clock {
  private readonly format: Intl.DateTimeFormat;

  constructor(timeZone: string) {
    this.format = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  today(): IsoDate {
    return this.format.format(new Date());
  }
}

export class UuidGenerator implements IdGenerator {
  next(): string {
    return randomUUID();
  }
}
