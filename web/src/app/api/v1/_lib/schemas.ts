import { z } from 'zod';
import { ENTRY_KINDS } from '@/domain/entries/entry';
import { MOVEMENT_TYPES } from '@/domain/properties/property-movement';
import { isIsoDate, isYearMonth } from '@/domain/shared/iso-date';

/** A API trabalha sempre em cêntimos inteiros e datas ISO. */
const cents = z.number().int().nonnegative();
const isoDate = z.string().refine(isIsoDate, 'Data inválida (AAAA-MM-DD).');

export const periodQuery = z.string().refine(isYearMonth, 'Mês inválido (AAAA-MM).');

const entryFields = {
  costCenterId: z.string().min(1),
  categoryId: z.string().min(1),
  kind: z.enum(ENTRY_KINDS),
  description: z.string().trim().min(1),
  dueDate: isoDate,
  amountCents: cents.nullable().default(null),
  expectedCents: cents.nullable().default(null),
  settledOn: isoDate.nullable().default(null),
  notes: z.string().default(''),
};

export const createEntryBody = z.object({ entityId: z.string().min(1), ...entryFields });
export const updateEntryBody = z.object(entryFields);

export const settleEntryBody = z.object({
  finalAmountCents: cents.nullable().default(null),
  on: isoDate.optional(),
});

export const entityQuery = z.string({ error: 'Indica a entidade.' }).min(1);

export const generateBody = z.object({ entityId: entityQuery, period: periodQuery });

export const movementBody = z.object({
  type: z.enum(MOVEMENT_TYPES),
  amountCents: cents.positive(),
  date: isoDate.optional(),
  note: z.string().optional(),
});

export const invoiceBody = z.object({
  invoiceDate: isoDate,
  days: z.number().positive(),
  dueDate: isoDate.nullable().optional(),
  costCenterId: z.string().optional(),
});

export const historyQuery = z.object({
  entidade: z.string().min(1),
  ano: z.coerce.number().int(),
});
