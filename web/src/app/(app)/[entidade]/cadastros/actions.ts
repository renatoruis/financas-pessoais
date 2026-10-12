'use server';

import { z } from 'zod';
import { getContainer } from '@/composition/container';
import { runAction, type ActionResult } from '../../_lib/action-result';
import { idInput, parseDecimalInput } from '../../_lib/input-schemas';

const PERCENT = 100;

/** Vazio = 0; aceita negativos (ex.: caixa inicial a descoberto). */
const signedCentsInput = z
  .string()
  .transform((v) => parseDecimalInput(v) ?? 0)
  .pipe(z.number({ error: 'Valor inválido.' }).int());

/** Cada entidade só envia os seus campos. */
const settingsFormSchema = z.object({
  propertyInitialCash: signedCentsInput.optional(),
  companyPtInitialCash: signedCentsInput.optional(),
  dailyRate: signedCentsInput.optional(),
  vatPercent: z
    .string()
    .transform((v) => Number(v.replace(',', '.')) / PERCENT)
    .pipe(z.number({ error: 'IVA inválido.' }))
    .optional(),
});

export type SettingsFormValues = z.input<typeof settingsFormSchema>;
export type SettingKey = keyof SettingsFormValues;

export async function updateSettingsAction(values: SettingsFormValues): Promise<ActionResult> {
  return runAction(async () => {
    const v = settingsFormSchema.parse(values);
    await getContainer().updateSettings.execute({
      propertyInitialCashCents: v.propertyInitialCash,
      companyPtInitialCashCents: v.companyPtInitialCash,
      dailyRateCents: v.dailyRate,
      vatRate: v.vatPercent,
    });
  }, 'Definições gravadas.');
}

const nameInput = z.string().trim().min(1, 'Indica o nome.');

export async function createCategoryAction(entityId: string, name: string): Promise<ActionResult> {
  return runAction(async () => {
    await getContainer().createCategory.execute({
      name: nameInput.parse(name),
      entityId: idInput.parse(entityId),
    });
  }, 'Categoria criada.');
}

export async function createCostCenterAction(
  entityId: string,
  name: string,
): Promise<ActionResult> {
  return runAction(async () => {
    await getContainer().createCostCenter.execute({
      name: nameInput.parse(name),
      entityId: idInput.parse(entityId),
    });
  }, 'Centro criado.');
}
