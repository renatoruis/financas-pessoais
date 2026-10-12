import { addDays, type IsoDate } from '../shared/iso-date';
import type { Entry } from './entry';

export const DUE_SOON_DAYS = 7;

export const isOverdue = (entry: Entry, today: IsoDate): boolean =>
  entry.status === 'pending' && entry.dueDate < today;

export const isDueSoon = (entry: Entry, today: IsoDate): boolean =>
  entry.status === 'pending' &&
  entry.dueDate >= today &&
  entry.dueDate <= addDays(today, DUE_SOON_DAYS);

export const byDueDate = (a: Entry, b: Entry): number =>
  a.dueDate.localeCompare(b.dueDate) || a.description.localeCompare(b.description);
