'use server';

import { z } from 'zod';
import { ENTRY_KINDS } from '@/domain/entries/entry';
import { getContainer } from '@/composition/container';
import { runAction, type ActionResult } from './_lib/action-result';
import {
  idInput,
  isoDateInput,
  optionalIsoDateInput,
  optionalMoneyInput,
} from './_lib/input-schemas';

const entryFormSchema = z.object({
  costCenterId: idInput,
  categoryId: idInput,
  kind: z.enum(ENTRY_KINDS),
  description: z.string().trim().min(1, 'Indica a descrição.'),
  dueDate: isoDateInput,
  amount: optionalMoneyInput,
  expected: optionalMoneyInput,
  settledOn: optionalIsoDateInput,
  notes: z.string().default(''),
});

export type EntryFormValues = z.input<typeof entryFormSchema> & { entityId: string };

function toFields(values: z.output<typeof entryFormSchema>) {
  return { ...values, amountCents: values.amount, expectedCents: values.expected };
}

export async function createEntryAction(values: EntryFormValues): Promise<ActionResult> {
  return runAction(async () => {
    const fields = toFields(entryFormSchema.parse(values));
    await getContainer().createEntry.execute({
      ...fields,
      entityId: idInput.parse(values.entityId),
    });
  }, 'Lançamento gravado.');
}

export async function updateEntryAction(
  id: string,
  values: EntryFormValues,
): Promise<ActionResult> {
  return runAction(async () => {
    const fields = toFields(entryFormSchema.parse(values));
    await getContainer().updateEntry.execute({ ...fields, id: idInput.parse(id) });
  }, 'Lançamento atualizado.');
}

export async function settleEntryAction(id: string, finalAmount: string): Promise<ActionResult> {
  return runAction(async () => {
    const { settled } = await getContainer().settleEntry.execute({
      id: idInput.parse(id),
      finalAmountCents: optionalMoneyInput.parse(finalAmount),
    });
    return settled > 1 ? `Liquidado (e ${settled - 1} ligado).` : undefined;
  }, 'Liquidado.');
}

export async function cancelEntryAction(id: string): Promise<ActionResult> {
  return runAction(() => getContainer().cancelEntry.execute(idInput.parse(id)), 'Cancelado.');
}

export async function reopenEntryAction(id: string): Promise<ActionResult> {
  return runAction(
    () => getContainer().reopenEntry.execute(idInput.parse(id)),
    'Voltou a pendente.',
  );
}

export async function deleteEntryAction(id: string): Promise<ActionResult> {
  return runAction(() => getContainer().deleteEntry.execute(idInput.parse(id)), 'Apagado.');
}
