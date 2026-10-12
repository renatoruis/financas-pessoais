import { describe, expect, it } from 'vitest';
import { cancelEntry } from '../entries/entry-lifecycle';
import { ENTITIES, makeEntry } from '../testing/fixtures';
import { totalsByCurrency } from './entry-totals';

describe('totalsByCurrency', () => {
  it('separa moedas e ignora cancelados', () => {
    const totals = totalsByCurrency([
      makeEntry({ entity: ENTITIES.companyBr, kind: 'income', amount: 1000 }),
      makeEntry({ entity: ENTITIES.companyBr, amount: 400 }),
      makeEntry({ entity: ENTITIES.personalPt, amount: 50 }),
      makeEntry({ entity: ENTITIES.personalPt, amount: null }),
      cancelEntry(makeEntry({ entity: ENTITIES.personalPt, amount: 999 })),
    ]);
    expect(totals.map((t) => [t.currency, t.income.cents, t.expense.cents, t.net.cents])).toEqual([
      ['BRL', 100000, 40000, 60000],
      ['EUR', 0, 5000, -5000],
    ]);
  });

  it('lista vazia não tem linhas', () => {
    expect(totalsByCurrency([])).toEqual([]);
  });
});
