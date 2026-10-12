import type { EntryKind } from '../entries/entry';
import { DomainError } from '../shared/domain-error';
import { monthOf, MONTHS_PER_YEAR, type YearMonth } from '../shared/iso-date';

export interface RecurringTemplate {
  readonly id: string;
  readonly entityId: string;
  readonly costCenterId: string;
  readonly categoryId: string;
  readonly kind: EntryKind;
  readonly description: string;
  /** Dia do vencimento; vazio = dia 1. Limitado ao fim do mês. */
  readonly dayOfMonth: number | null;
  readonly expectedCents: number | null;
  /** Meses em que é devido (1–12); `null` = todos os meses. */
  readonly months: readonly number[] | null;
  /** Manual = modelo que nunca é gerado automaticamente (lança-se quando acontece). */
  readonly manual: boolean;
  readonly active: boolean;
}

export function isDueInPeriod(template: RecurringTemplate, period: YearMonth): boolean {
  if (!template.active || template.manual) return false;
  return !template.months?.length || template.months.includes(monthOf(period));
}

/** "2,5,8,11" → [2, 5, 8, 11]; vazio → null (todos os meses). */
export function parseMonths(text: string): number[] | null {
  const parts = text
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map(Number);
  if (!parts.length) return null;
  if (parts.some((m) => m < 1 || m > MONTHS_PER_YEAR)) {
    throw new DomainError('invalid-months', 'Os meses têm de estar entre 1 e 12.');
  }
  return [...new Set(parts)].sort((a, b) => a - b);
}

const MAX_DAY = 31;

export function validateTemplate(template: RecurringTemplate): RecurringTemplate {
  if (!template.description.trim()) {
    throw new DomainError('description-required', 'Indica a descrição.');
  }
  if (template.dayOfMonth !== null && (template.dayOfMonth < 1 || template.dayOfMonth > MAX_DAY)) {
    throw new DomainError('invalid-day', 'O dia tem de estar entre 1 e 31.');
  }
  if (template.expectedCents !== null && template.expectedCents < 0) {
    throw new DomainError('invalid-amount', 'O previsto não pode ser negativo.');
  }
  return { ...template, description: template.description.trim() };
}
