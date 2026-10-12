import { describe, expect, it } from 'vitest';
import { money } from '../shared/money';
import { ENTITIES, makeEntry } from '../testing/fixtures';
import { summarizeProperties } from './property-overview';
import { buildPropertyMovement } from './property-movement';
import { summarizePropertyYear } from './property-year';

const settled = (
  costCenterId: string,
  kind: 'income' | 'expense',
  amount: number,
  dueDate = '2026-10-01',
) =>
  makeEntry({
    entity: ENTITIES.propertiesBr,
    costCenterId,
    kind,
    amount,
    dueDate,
    settledOn: dueDate,
  });

/** Outubro de 2026 conforme verificado na planilha. */
const october = [
  settled('rossi', 'income', 4650),
  settled('bella-cidade', 'income', 2570),
  settled('vitapolis', 'income', 900),
  settled('rossi', 'expense', 1110),
  settled('rossi', 'expense', 2480),
  settled('bella-cidade', 'expense', 500),
  settled('bella-cidade', 'expense', 2740),
  settled('vitapolis', 'expense', 358.18),
  settled('geral', 'expense', 200),
];

const centerIds = ['rossi', 'bella-cidade', 'vitapolis', 'geral'];

describe('summarizeProperties', () => {
  it('reproduz a cobertura de outubro da planilha', () => {
    const o = summarizeProperties({
      entries: october,
      period: '2026-10',
      centerIds,
      initialCash: money(0, 'BRL'),
    });
    const by = Object.fromEntries(o.coverage.centers.map((c) => [c.costCenterId, c]));
    expect(by.rossi?.coveredOthers.cents).toBe(57572);
    expect(by.vitapolis?.coveredOthers.cents).toBe(29428);
    expect(by['bella-cidade']?.coveredByOthers.cents).toBe(67000);
    expect(by.geral?.coveredByOthers.cents).toBe(20000);
    expect(o.coverage.coveredBetween.cents).toBe(87000);
    expect(o.cash.end.cents).toBe(73182);
    expect(o.cash.contributionNeeded.cents).toBe(0);
  });

  it('caixa início soma os meses anteriores e aportes contam só na caixa', () => {
    const contribution = buildPropertyMovement({
      type: 'contribution',
      amountCents: 50000,
      date: '2026-11-02',
      note: '',
      properties: ENTITIES.propertiesBr,
      id: 'i',
    });
    const november = [settled('bella-cidade', 'expense', 2000, '2026-11-01'), contribution];
    const o = summarizeProperties({
      entries: [...october, ...november],
      period: '2026-11',
      centerIds,
      initialCash: money(10000, 'BRL'),
    });
    expect(o.cash.start.cents).toBe(83182);
    expect(o.cash.monthResult.cents).toBe(-200000);
    expect(o.cash.contributions.cents).toBe(50000);
    expect(o.cash.coveredByCash.cents).toBe(83182);
    expect(o.cash.contributionNeeded.cents).toBe(116818);
    expect(o.cash.end.cents).toBe(-66818);
    expect(o.apartments.find((a) => a.costCenterId === 'caixa')).toBeUndefined();
  });

  it('saldo do apartamento desconta o que falta pagar', () => {
    const pending = makeEntry({
      entity: ENTITIES.propertiesBr,
      costCenterId: 'rossi',
      amount: 100,
    });
    const o = summarizeProperties({
      entries: [...october, pending],
      period: '2026-10',
      centerIds,
      initialCash: money(0, 'BRL'),
    });
    const rossi = o.apartments.find((a) => a.costCenterId === 'rossi');
    expect(rossi?.payable.cents).toBe(10000);
    expect(rossi?.balance.cents).toBe(96000);
  });
});

describe('summarizePropertyYear', () => {
  it('meses do ano e totais por apartamento', () => {
    const y = summarizePropertyYear({
      entries: october,
      year: 2026,
      centerIds,
      initialCash: money(0, 'BRL'),
    });
    expect(y.months).toHaveLength(12);
    expect(y.months[9]?.end.cents).toBe(73182);
    expect(y.months[10]?.end.cents).toBe(73182);
    expect(y.apartments.find((a) => a.costCenterId === 'rossi')?.coveredOthers.cents).toBe(57572);
  });
});

describe('buildPropertyMovement', () => {
  const base = {
    amountCents: 1000,
    date: '2026-10-05',
    note: 'x',
    properties: ENTITIES.propertiesBr,
    id: 'a',
  };

  it('aporte: só uma receita liquidada na caixa dos imóveis, sem ligação', () => {
    const entry = buildPropertyMovement({ ...base, type: 'contribution' });
    expect(entry).toMatchObject({
      entityId: 'imoveis-br',
      kind: 'income',
      categoryId: 'aporte',
      costCenterId: 'caixa',
      status: 'settled',
      linkGroup: null,
    });
  });

  it('retirada: despesa na caixa', () => {
    const entry = buildPropertyMovement({ ...base, type: 'withdrawal' });
    expect(entry).toMatchObject({ kind: 'expense', categoryId: 'retirada' });
  });

  it('recusa valor zero', () => {
    expect(() => buildPropertyMovement({ ...base, type: 'withdrawal', amountCents: 0 })).toThrow();
  });
});
