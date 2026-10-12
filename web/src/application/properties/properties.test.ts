import { describe, expect, it } from 'vitest';
import { CreateEntry } from '../entries/create-entry';
import { makeDeps } from '../testing/in-memory';
import { GetPropertyOverview } from './get-property-overview';
import { GetPropertyYear } from './get-property-year';
import { RegisterPropertyMovement } from './register-property-movement';

const entry = (costCenterId: string, kind: 'income' | 'expense', amountCents: number) => ({
  entityId: 'imoveis-br',
  costCenterId,
  categoryId: 'servicos',
  kind,
  description: `${kind} ${costCenterId}`,
  dueDate: '2026-10-01',
  amountCents,
  settledOn: '2026-10-01',
});

describe('casos de uso dos imóveis', () => {
  it('cobertura e caixa com aporte', async () => {
    const deps = makeDeps();
    const create = new CreateEntry(deps);
    await create.execute(entry('rossi', 'income', 100000));
    await create.execute(entry('bella-cidade', 'expense', 150000));
    await new RegisterPropertyMovement(deps).execute({
      type: 'contribution',
      amountCents: 20000,
      date: '2026-10-05',
    });

    const o = await new GetPropertyOverview(deps).execute('2026-10');
    expect(o.coverage.coveredBetween.cents).toBe(100000);
    expect(o.cash.contributionNeeded.cents).toBe(50000);
    expect(o.cash.contributions.cents).toBe(20000);
    expect(o.cash.end.cents).toBe(-30000);
    expect(o.apartments.map((a) => a.costCenterId)).toEqual([
      'geral',
      'rossi',
      'bella-cidade',
      'vitapolis',
    ]);

    const others = [...deps.entries.rows.values()].filter((e) => e.entityId !== 'imoveis-br');
    expect(others).toHaveLength(0);

    const year = await new GetPropertyYear(deps).execute(2026);
    expect(year.months[11]?.end.cents).toBe(-30000);
  });
});
