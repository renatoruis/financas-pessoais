'use server';

import { z } from 'zod';
import { getContainer } from '@/composition/container';
import { MOVEMENT_TYPES } from '@/domain/properties/property-movement';
import { runAction, type ActionResult } from '../../_lib/action-result';
import { isoDateInput, requiredMoneyInput } from '../../_lib/input-schemas';

const movementFormSchema = z.object({
  type: z.enum(MOVEMENT_TYPES),
  amount: requiredMoneyInput,
  date: isoDateInput,
  note: z.string().default(''),
});

export type MovementFormValues = z.input<typeof movementFormSchema>;

export async function registerMovementAction(values: MovementFormValues): Promise<ActionResult> {
  return runAction(async () => {
    const { amount, ...rest } = movementFormSchema.parse(values);
    await getContainer().registerPropertyMovement.execute({ ...rest, amountCents: amount });
    return rest.type === 'contribution' ? 'Aporte registado.' : 'Retirada registada.';
  }, 'Movimento registado.');
}
