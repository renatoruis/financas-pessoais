'use server';

import { z } from 'zod';
import { getContainer } from '@/composition/container';
import { runAction, type ActionResult } from '../../_lib/action-result';
import { idInput, isoDateInput, optionalIsoDateInput } from '../../_lib/input-schemas';

const invoiceFormSchema = z.object({
  costCenterId: idInput,
  invoiceDate: isoDateInput,
  days: z
    .string()
    .transform((v) => Number(v.replace(',', '.')))
    .pipe(z.number({ error: 'Dias inválidos.' }).positive('Indica os dias faturados.')),
  dueDate: optionalIsoDateInput,
});

export type InvoiceFormValues = z.input<typeof invoiceFormSchema>;

export async function registerInvoiceAction(values: InvoiceFormValues): Promise<ActionResult> {
  return runAction(async () => {
    await getContainer().registerInvoice.execute(invoiceFormSchema.parse(values));
  }, 'Fatura registada (base + IVA pendentes).');
}
