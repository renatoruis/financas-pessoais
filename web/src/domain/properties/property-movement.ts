import { createEntry, type Entry } from '../entries/entry';
import { SYSTEM_CATEGORIES, SYSTEM_COST_CENTERS, type Entity } from '../reference/reference-data';
import { DomainError } from '../shared/domain-error';
import type { IsoDate } from '../shared/iso-date';

export const MOVEMENT_TYPES = ['contribution', 'withdrawal'] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export interface PropertyMovementInput {
  readonly type: MovementType;
  readonly amountCents: number;
  readonly date: IsoDate;
  readonly note: string;
  readonly properties: Entity;
  readonly id: string;
}

/**
 * Aporte: dinheiro que entra na caixa dos imóveis. Retirada: o inverso.
 * Só regista o lado dos imóveis; a origem/destino regista-se na entidade respetiva.
 */
export function buildPropertyMovement(input: PropertyMovementInput): Entry {
  if (input.amountCents <= 0)
    throw new DomainError('invalid-amount', 'Indica um valor maior que zero.');
  const isContribution = input.type === 'contribution';
  return createEntry({
    id: input.id,
    entity: input.properties,
    costCenterId: SYSTEM_COST_CENTERS.propertyCash,
    categoryId: isContribution ? SYSTEM_CATEGORIES.contribution : SYSTEM_CATEGORIES.withdrawal,
    kind: isContribution ? 'income' : 'expense',
    description: isContribution ? 'Aporte na caixa' : 'Retirada da caixa',
    dueDate: input.date,
    amountCents: input.amountCents,
    settledOn: input.date,
    notes: input.note,
    source: 'movement',
  });
}
