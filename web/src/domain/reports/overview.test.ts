import { describe, expect, it } from 'vitest';
import { ENTITIES, makeEntry } from '../testing/fixtures';
import { summarizeEntity } from './entity-summary';
import {
  currencyKpis,
  rollingPeriods,
  rollingSeries,
  topExpenseCategories,
  upcomingCashflow,
} from './overview';

const { companyBr, personalBr, companyPt } = ENTITIES;
const settled = (date: string) => ({ dueDate: date, settledOn: date });

describe('currencyKpis', () => {
  it('soma entidades da mesma moeda e junta o resultado do mês anterior', () => {
    const summary = (entity = companyBr, amount = 100, kind: 'income' | 'expense' = 'income') =>
      summarizeEntity({
        entity,
        periodEntries: [makeEntry({ entity, kind, amount, ...settled('2026-10-05') })],
        pendingEntries: [],
        today: '2026-10-12',
      });
    const kpis = currencyKpis(
      [summary(companyBr, 1000), summary(personalBr, 300, 'expense')],
      [summary(companyBr, 500)],
      'BRL',
    );
    expect(kpis.income.cents).toBe(100000);
    expect(kpis.expense.cents).toBe(30000);
    expect(kpis.result.cents).toBe(70000);
    expect(kpis.previousResult.cents).toBe(50000);
    expect(() => currencyKpis([summary(companyPt)], [], 'BRL')).toThrow();
  });
});

describe('rollingSeries', () => {
  it('cobre 12 meses até ao mês escolhido, com o resultado por entidade', () => {
    expect(rollingPeriods('2026-03')).toHaveLength(12);
    expect(rollingPeriods('2026-03')[0]).toBe('2025-04');
    const entries = [
      makeEntry({ entity: companyBr, kind: 'income', amount: 1000, ...settled('2026-10-05') }),
      makeEntry({ entity: personalBr, amount: 200, ...settled('2026-10-07') }),
      makeEntry({ entity: personalBr, amount: 50 }),
      makeEntry({ entity: companyPt, kind: 'income', amount: 9, ...settled('2026-10-05') }),
      makeEntry({ entity: companyBr, amount: 1, categoryId: 'iva', ...settled('2026-10-05') }),
    ];
    const series = rollingSeries(entries, '2026-10', [companyBr.id, personalBr.id], 'BRL');
    const october = series.at(-1);
    expect(october?.period).toBe('2026-10');
    expect(october?.income.cents).toBe(100000);
    expect(october?.expense.cents).toBe(20000);
    expect(october?.byEntity[companyBr.id]?.cents).toBe(100000);
    expect(october?.byEntity[personalBr.id]?.cents).toBe(-20000);
    expect(series[0]?.result.cents).toBe(0);
  });
});

describe('topExpenseCategories', () => {
  it('junta a mesma categoria de várias entidades e ordena pelo total', () => {
    const entries = [
      makeEntry({
        entity: companyBr,
        categoryId: 'impostos',
        amount: 300,
        ...settled('2026-10-01'),
      }),
      makeEntry({
        entity: personalBr,
        categoryId: 'impostos',
        amount: 100,
        ...settled('2026-10-01'),
      }),
      makeEntry({
        entity: personalBr,
        categoryId: 'mercado',
        amount: 100,
        ...settled('2026-10-01'),
      }),
      makeEntry({ entity: personalBr, categoryId: 'mercado', amount: 999 }),
    ];
    const top = topExpenseCategories(entries, 'BRL');
    expect(top.map((c) => c.categoryId)).toEqual(['impostos', 'mercado']);
    expect(top[0]?.total.cents).toBe(40000);
    expect(top[0]?.share).toBe(0.8);
    expect(topExpenseCategories(entries, 'BRL', 1)).toHaveLength(1);
  });
});

describe('upcomingCashflow', () => {
  it('inclui atrasados e os próximos 30 dias, sem liquidados nem outra moeda', () => {
    const entries = [
      makeEntry({ entity: companyBr, kind: 'income', amount: 500, dueDate: '2026-10-20' }),
      makeEntry({ entity: personalBr, amount: 80, dueDate: '2026-10-01' }),
      makeEntry({ entity: personalBr, amount: 70, dueDate: '2026-11-30' }),
      makeEntry({ entity: personalBr, amount: 60, ...settled('2026-10-15') }),
      makeEntry({ entity: companyPt, amount: 10, dueDate: '2026-10-15' }),
    ];
    const upcoming = upcomingCashflow(entries, '2026-10-12', 'BRL');
    expect(upcoming.entries.map((e) => e.dueDate)).toEqual(['2026-10-01', '2026-10-20']);
    expect(upcoming.incoming.cents).toBe(50000);
    expect(upcoming.outgoing.cents).toBe(8000);
    expect(upcoming.overdueCount).toBe(1);
  });
});
