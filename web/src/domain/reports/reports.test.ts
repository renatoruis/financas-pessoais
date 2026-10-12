import { describe, expect, it } from 'vitest';
import { ENTITIES, makeEntry } from '../testing/fixtures';
import { pendingForPeriod, summarizeEntity } from './entity-summary';
import { categoryTotals, monthlySeries } from './history';

const pt = ENTITIES.companyPt;

describe('summarizeEntity', () => {
  it('reproduz o cartão da planilha e ignora IVA', () => {
    const entries = [
      makeEntry({
        entity: pt,
        kind: 'income',
        amount: 3000,
        settledOn: '2026-10-09',
        expectedCents: 300000,
      }),
      makeEntry({ entity: pt, kind: 'expense', amount: 2500, expectedCents: 250000 }),
      makeEntry({ entity: pt, kind: 'expense', amount: null }),
      makeEntry({ entity: pt, kind: 'income', amount: 1196, categoryId: 'iva' }),
    ];
    const s = summarizeEntity({
      entity: pt,
      periodEntries: entries,
      pendingEntries: entries,
      today: '2026-10-12',
    });
    expect(s.income.cents).toBe(300000);
    expect(s.result.cents).toBe(300000);
    expect(s.payable.cents).toBe(250000);
    expect(s.receivable.cents).toBe(0);
    expect(s.balance.cents).toBe(50000);
    expect(s.expected.cents).toBe(50000);
    expect(s.deviation.cents).toBe(0);
    expect(s.expectedCount).toBe(2);
    expect(s.overdueCount).toBe(3);
    expect(s.income.currency).toBe('EUR');
  });

  it('ignora cancelados', () => {
    const cancelled = { ...makeEntry({ entity: pt, amount: 10 }), status: 'cancelled' as const };
    const s = summarizeEntity({
      entity: pt,
      periodEntries: [cancelled],
      pendingEntries: [],
      today: '2026-10-01',
    });
    expect(s.payable.cents).toBe(0);
  });
});

describe('pendingForPeriod', () => {
  it('mostra os do mês e os atrasados, por data', () => {
    const a = makeEntry({ dueDate: '2026-10-20', description: 'A' });
    const b = makeEntry({ dueDate: '2026-09-15', description: 'B' });
    const c = makeEntry({ dueDate: '2026-11-02', description: 'C' });
    const d = makeEntry({ dueDate: '2026-10-05', description: 'D', settledOn: '2026-10-05' });
    expect(
      pendingForPeriod([a, b, c, d], '2026-10', '2026-10-12').map((e) => e.description),
    ).toEqual(['B', 'A']);
  });
});

describe('histórico', () => {
  const entries = [
    makeEntry({
      kind: 'income',
      amount: 1000,
      dueDate: '2026-01-05',
      settledOn: '2026-01-05',
      categoryId: 'servicos',
    }),
    makeEntry({
      kind: 'expense',
      amount: 300,
      dueDate: '2026-01-10',
      settledOn: '2026-01-10',
      categoryId: 'impostos',
    }),
    makeEntry({
      kind: 'expense',
      amount: 200,
      dueDate: '2026-02-10',
      settledOn: '2026-02-10',
      categoryId: 'impostos',
    }),
    makeEntry({ kind: 'expense', amount: 999, dueDate: '2026-02-10' }),
  ];

  it('série mensal com acumulado', () => {
    const rows = monthlySeries(entries, 2026, 'BRL');
    expect(rows[0]?.result.cents).toBe(70000);
    expect(rows[1]?.result.cents).toBe(-20000);
    expect(rows[1]?.cumulative.cents).toBe(50000);
    expect(rows[11]?.cumulative.cents).toBe(50000);
  });

  it('totais por categoria', () => {
    const rows = categoryTotals(entries, 2026, 'BRL');
    expect(rows.map((r) => r.categoryId)).toEqual(['servicos', 'impostos']);
    expect(rows[1]?.net.cents).toBe(-50000);
  });
});
