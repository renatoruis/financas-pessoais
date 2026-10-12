import type { RecurringTemplate } from '@/domain/recurring/recurring-template';

export interface RecurringRepository {
  list(): Promise<RecurringTemplate[]>;
  findById(id: string): Promise<RecurringTemplate | null>;
  save(template: RecurringTemplate): Promise<void>;
  delete(id: string): Promise<void>;
}
