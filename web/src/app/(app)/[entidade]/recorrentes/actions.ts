'use server';

import { z } from 'zod';
import { getContainer } from '@/composition/container';
import { ENTRY_KINDS } from '@/domain/entries/entry';
import { parseMonths } from '@/domain/recurring/recurring-template';
import { runAction, type ActionResult } from '../../_lib/action-result';
import { idInput, optionalMoneyInput, periodInput } from '../../_lib/input-schemas';

const dayInput = z
  .string()
  .transform((v) => (v.trim() ? Number(v) : null))
  .pipe(z.number({ error: 'Dia inválido.' }).int('Dia inválido.').nullable());

const recurringFormSchema = z.object({
  entityId: idInput,
  costCenterId: idInput,
  categoryId: idInput,
  kind: z.enum(ENTRY_KINDS),
  description: z.string().trim().min(1, 'Indica a descrição.'),
  dayOfMonth: dayInput,
  expected: optionalMoneyInput,
  months: z.string().transform(parseMonths),
  manual: z.boolean(),
  active: z.boolean(),
});

export type RecurringFormValues = z.input<typeof recurringFormSchema>;

export async function saveRecurringAction(
  id: string | null,
  values: RecurringFormValues,
): Promise<ActionResult> {
  return runAction(async () => {
    const { expected, ...fields } = recurringFormSchema.parse(values);
    await getContainer().saveRecurring.execute({
      ...fields,
      expectedCents: expected,
      id: id ?? undefined,
    });
  }, 'Recorrente gravado.');
}

export async function deleteRecurringAction(id: string): Promise<ActionResult> {
  return runAction(
    () => getContainer().deleteRecurring.execute(idInput.parse(id)),
    'Recorrente apagado.',
  );
}

export async function generateRecurringAction(
  entityId: string,
  period: string,
): Promise<ActionResult> {
  return runAction(async () => {
    const { created } = await getContainer().generateRecurring.execute({
      entityId: idInput.parse(entityId),
      period: periodInput.parse(period),
    });
    return created === 1 ? '1 lançamento criado.' : `${created} lançamentos criados.`;
  }, 'Mês gerado.');
}
