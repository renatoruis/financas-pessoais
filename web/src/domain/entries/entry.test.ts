import { describe, expect, it } from 'vitest';
import { ENTITIES, makeEntry } from '../testing/fixtures';
import { createEntry, updateEntry } from './entry';
import { cancelEntry, reopenEntry, settleEntry, signedCents } from './entry-lifecycle';
import { isDueSoon, isOverdue } from './entry-schedule';
import { settleWithLinked } from './linked-settlement';

describe('createEntry', () => {
  it('deriva a moeda da entidade e fica pendente sem data de liquidação', () => {
    const e = makeEntry({ entity: ENTITIES.companyPt, amount: 25 });
    expect(e.currency).toBe('EUR');
    expect(e.amount).toEqual({ cents: 2500, currency: 'EUR' });
    expect(e.status).toBe('pending');
  });

  it('fica liquidado quando tem data de liquidação', () => {
    expect(makeEntry({ settledOn: '2026-10-02' }).status).toBe('settled');
  });

  it('valida descrição, data e valor', () => {
    expect(() => makeEntry({ description: ' ' })).toThrow('descrição');
    expect(() => makeEntry({ dueDate: '2026-02-31' })).toThrow('Vencimento');
    expect(() => makeEntry({ amount: -1 })).toThrow('maior que zero');
    expect(() => makeEntry({ amount: null, settledOn: '2026-10-01' })).toThrow('precisa de valor');
  });

  it('aceita pendente sem valor (recorrente ainda por preencher)', () => {
    expect(makeEntry({ amount: null }).amount).toBeNull();
  });
});

describe('ciclo de vida', () => {
  it('liquida com o valor existente ou com o valor final', () => {
    const e = makeEntry({ amount: 90 });
    expect(settleEntry(e, '2026-10-21').amount?.cents).toBe(9000);
    const final = settleEntry(e, '2026-10-21', 8952);
    expect(final).toMatchObject({ status: 'settled', settledOn: '2026-10-21' });
    expect(final.amount?.cents).toBe(8952);
  });

  it('exige valor final quando o lançamento não tem valor', () => {
    expect(() => settleEntry(makeEntry({ amount: null }), '2026-10-21')).toThrow('valor final');
  });

  it('não liquida nem cancela o que já não está pendente', () => {
    const settled = settleEntry(makeEntry(), '2026-10-01');
    expect(() => settleEntry(settled, '2026-10-01')).toThrow('pendente');
    expect(() => cancelEntry(settled)).toThrow('pendente');
  });

  it('cancela e reabre', () => {
    const cancelled = cancelEntry(makeEntry());
    expect(cancelled.status).toBe('cancelled');
    expect(reopenEntry(cancelled).status).toBe('pending');
  });

  it('edição mantém cancelado e recalcula a moeda', () => {
    const cancelled = cancelEntry(makeEntry({ entity: ENTITIES.personalPt }));
    const edited = updateEntry(cancelled, { ...cancelled, amountCents: 500 });
    expect(edited.status).toBe('cancelled');
    expect(edited.amount).toEqual({ cents: 500, currency: 'EUR' });
  });

  it('sinal: receita positiva, despesa negativa', () => {
    expect(signedCents(makeEntry({ kind: 'income', amount: 10 }))).toBe(1000);
    expect(signedCents(makeEntry({ kind: 'expense', amount: 10 }))).toBe(-1000);
  });
});

describe('agenda', () => {
  it('em atraso e a vencer em 7 dias', () => {
    const e = makeEntry({ dueDate: '2026-10-10' });
    expect(isOverdue(e, '2026-10-11')).toBe(true);
    expect(isDueSoon(e, '2026-10-03')).toBe(true);
    expect(isDueSoon(e, '2026-10-02')).toBe(false);
  });
});

describe('settleWithLinked', () => {
  const invoice = () => {
    const base = makeEntry({
      entity: ENTITIES.companyPt,
      kind: 'income',
      amount: 5200,
      linkGroup: 'g1',
    });
    const vat = createEntry({
      ...base,
      id: 'vat',
      entity: ENTITIES.companyPt,
      categoryId: 'iva',
      amountCents: 119600,
      description: 'IVA',
    });
    return { base, vat };
  };

  it('liquida a fatura e o IVA ligado', () => {
    const { base, vat } = invoice();
    const result = settleWithLinked({
      main: base,
      linked: [base, vat],
      on: '2026-11-05',
      finalAmountCents: null,
      vatRate: 0.23,
    });
    expect(result.map((e) => e.status)).toEqual(['settled', 'settled']);
    expect(result[1]?.amount?.cents).toBe(119600);
  });

  it('recalcula o IVA quando a base muda', () => {
    const { base, vat } = invoice();
    const result = settleWithLinked({
      main: base,
      linked: [vat],
      on: '2026-11-05',
      finalAmountCents: 546000,
      vatRate: 0.23,
    });
    expect(result[0]?.amount?.cents).toBe(546000);
    expect(result[1]?.amount?.cents).toBe(125580);
  });

  it('ignora lançamentos ligados de outra entidade', () => {
    const { base } = invoice();
    const other = makeEntry({ entity: ENTITIES.personalPt, linkGroup: 'g1' });
    const result = settleWithLinked({
      main: base,
      linked: [base, other],
      on: '2026-11-05',
      finalAmountCents: null,
      vatRate: 0.23,
    });
    expect(result.map((e) => e.id)).toEqual([base.id]);
  });
});
