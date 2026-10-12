import { describe, expect, it } from 'vitest';
import { settleEntry } from '../entries/entry-lifecycle';
import { money } from '../shared/money';
import { ENTITIES, makeEntry } from '../testing/fixtures';
import { buildInvoiceEntries, invoiceAmounts } from './invoice';
import { computeVatBalance, vatByQuarter } from './vat-balance';
import { nextVatDeadline, vatQuarterOf } from './vat-calendar';

const invoice = (invoiceDate = '2026-10-31') =>
  buildInvoiceEntries({
    entity: ENTITIES.companyPt,
    costCenterId: 'reach-it',
    clientName: 'Reach IT',
    invoiceDate,
    dueDate: null,
    days: 20,
    dailyRateCents: 26000,
    vatRate: 0.23,
    ids: ['b', 'v'],
    linkGroup: 'g',
  });

describe('fatura', () => {
  it('calcula base, IVA e total', () => {
    expect(invoiceAmounts(20, 26000, 0.23)).toEqual({
      baseCents: 520000,
      vatCents: 119600,
      totalCents: 639600,
    });
  });

  it('cria base e IVA pendentes e ligados', () => {
    const [base, vat] = invoice();
    expect(base).toMatchObject({
      description: 'Fatura Reach IT 2026-10',
      categoryId: 'servicos',
      status: 'pending',
      linkGroup: 'g',
    });
    expect(vat).toMatchObject({ categoryId: 'iva', kind: 'income', linkGroup: 'g' });
    expect(vat.amount?.cents).toBe(119600);
    expect(base.notes).toBe('20 dias × 260 €');
  });

  it('recusa dias inválidos', () => {
    expect(() => buildInvoiceEntries({ ...invoiceInput(), days: 0 })).toThrow('dias');
  });
});

function invoiceInput() {
  return {
    entity: ENTITIES.companyPt,
    costCenterId: 'reach-it',
    clientName: 'Reach IT',
    invoiceDate: '2026-10-31',
    dueDate: null,
    days: 1,
    dailyRateCents: 26000,
    vatRate: 0.23,
    ids: ['b', 'v'] as const,
    linkGroup: 'g',
  };
}

describe('calendário do IVA', () => {
  it('próximo prazo é dia 25 de fev/mai/ago/nov', () => {
    expect(nextVatDeadline('2026-10-12')).toBe('2026-11-25');
    expect(nextVatDeadline('2026-11-25')).toBe('2026-11-25');
    expect(nextVatDeadline('2026-11-26')).toBe('2027-02-25');
  });

  it('entrega em novembro pertence ao T3; faturado em outubro ao T4', () => {
    const delivery = makeEntry({
      entity: ENTITIES.companyPt,
      categoryId: 'iva',
      dueDate: '2026-11-25',
    });
    expect(vatQuarterOf(delivery)).toBe('2026-T3');
    expect(vatQuarterOf(invoice()[1])).toBe('2026-T4');
  });
});

describe('saldo do IVA', () => {
  it('IVA a guardar, caixa e disponível', () => {
    const [base, vat] = invoice().map((e) => settleEntry(e, '2026-11-05'));
    const paid = makeEntry({
      entity: ENTITIES.companyPt,
      categoryId: 'iva',
      amount: 196,
      settledOn: '2026-11-25',
    });
    const cost = makeEntry({
      entity: ENTITIES.companyPt,
      categoryId: 'contabilidade',
      amount: 100,
      settledOn: '2026-11-01',
    });
    const pendingInvoice = invoice('2026-11-30');
    const b = computeVatBalance([base!, vat!, paid, cost, ...pendingInvoice], money(50000, 'EUR'));
    expect(b.collected.cents).toBe(119600);
    expect(b.paid.cents).toBe(19600);
    expect(b.toSetAside.cents).toBe(100000);
    expect(b.pendingInvoiceVat.cents).toBe(119600);
    expect(b.companyCash.cents).toBe(50000 + 520000 + 119600 - 19600 - 10000);
    expect(b.available.cents).toBe(b.companyCash.cents - 100000);
  });

  it('agrupa por trimestre', () => {
    const [, vat] = invoice('2026-08-31');
    const delivered = makeEntry({
      entity: ENTITIES.companyPt,
      categoryId: 'iva',
      amount: 1000,
      dueDate: '2026-11-25',
      settledOn: '2026-11-25',
    });
    const rows = vatByQuarter([vat!, delivered], 'EUR');
    expect(rows).toEqual([
      {
        quarter: '2026-T3',
        invoiced: money(119600, 'EUR'),
        delivered: money(100000, 'EUR'),
        outstanding: money(19600, 'EUR'),
      },
    ]);
  });
});
