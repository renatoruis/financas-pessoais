import { createEntry, type Entry } from '../entries/entry';
import { SYSTEM_CATEGORIES, type Entity } from '../reference/reference-data';
import { DomainError } from '../shared/domain-error';
import { isIsoDate, periodOf, type IsoDate } from '../shared/iso-date';

const PERCENT = 100;

export interface InvoiceInput {
  readonly entity: Entity;
  readonly costCenterId: string;
  readonly clientName: string;
  readonly invoiceDate: IsoDate;
  readonly dueDate: IsoDate | null;
  readonly days: number;
  readonly dailyRateCents: number;
  readonly vatRate: number;
  readonly ids: readonly [string, string];
  readonly linkGroup: string;
}

export interface InvoiceAmounts {
  readonly baseCents: number;
  readonly vatCents: number;
  readonly totalCents: number;
}

export function invoiceAmounts(
  days: number,
  dailyRateCents: number,
  vatRate: number,
): InvoiceAmounts {
  const baseCents = Math.round(days * dailyRateCents);
  const vatCents = Math.round(baseCents * vatRate);
  return { baseCents, vatCents, totalCents: baseCents + vatCents };
}

/** Fatura de serviços: base (dias × taxa) e IVA como duas receitas pendentes ligadas. */
export function buildInvoiceEntries(input: InvoiceInput): [Entry, Entry] {
  if (!(input.days > 0)) throw new DomainError('invalid-days', 'Indica os dias faturados.');
  if (!isIsoDate(input.invoiceDate))
    throw new DomainError('invalid-date', 'Data da fatura inválida.');
  const { baseCents, vatCents } = invoiceAmounts(input.days, input.dailyRateCents, input.vatRate);
  const name = `Fatura ${input.clientName} ${periodOf(input.invoiceDate)}`;
  const rate = (input.dailyRateCents / PERCENT).toLocaleString('pt-PT');
  const common = {
    entity: input.entity,
    costCenterId: input.costCenterId,
    kind: 'income' as const,
    dueDate: input.dueDate ?? input.invoiceDate,
    linkGroup: input.linkGroup,
    source: 'invoice' as const,
  };
  const base = createEntry({
    ...common,
    id: input.ids[0],
    categoryId: SYSTEM_CATEGORIES.services,
    description: name,
    amountCents: baseCents,
    notes: `${input.days} dias × ${rate} €`,
  });
  const vat = createEntry({
    ...common,
    id: input.ids[1],
    categoryId: SYSTEM_CATEGORIES.vat,
    description: `IVA cobrado · ${name}`,
    amountCents: vatCents,
    notes: `IVA ${Math.round(input.vatRate * PERCENT)}%`,
  });
  return [base, vat];
}
