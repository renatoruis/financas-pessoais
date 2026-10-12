import { describe, expect, it } from 'vitest';
import { CreateEntry } from '../entries/create-entry';
import { makeDeps } from '../testing/in-memory';
import { GetOverview } from './get-overview';

const base = {
  costCenterId: 'geral',
  categoryId: 'servicos',
  kind: 'income' as const,
  description: 'Fatura',
  dueDate: '2026-10-01',
  amountCents: 100000,
};

describe('visão geral', () => {
  it('uma região por moeda, com KPIs, série de 12 meses, categorias e agenda', async () => {
    const deps = makeDeps();
    const create = new CreateEntry(deps);
    await create.execute({ ...base, entityId: 'empresa-br', settledOn: '2026-10-01' });
    await create.execute({
      ...base,
      entityId: 'empresa-br',
      settledOn: '2026-09-01',
      dueDate: '2026-09-01',
      amountCents: 40000,
    });
    await create.execute({
      ...base,
      entityId: 'empresa-br',
      kind: 'expense',
      categoryId: 'impostos',
      description: 'DAS',
      dueDate: '2026-10-20',
      amountCents: 6000,
    });
    await create.execute({ ...base, entityId: 'empresa-pt', amountCents: 300000 });

    const overview = await new GetOverview(deps).execute('2026-10');
    expect(overview.regions.map((r) => r.currency)).toEqual(['BRL', 'EUR']);

    const [br, pt] = overview.regions;
    expect(br?.entities.every((e) => e.currency === 'BRL')).toBe(true);
    expect(br?.kpis.result.cents).toBe(100000);
    expect(br?.kpis.previousResult.cents).toBe(40000);
    expect(br?.kpis.payable.cents).toBe(6000);
    expect(br?.series).toHaveLength(12);
    expect(br?.series.at(-1)?.byEntity['empresa-br']?.cents).toBe(100000);
    expect(br?.upcoming.entries.map((e) => e.description)).toEqual(['DAS']);
    expect(pt?.kpis.receivable.cents).toBe(300000);
    expect(pt?.categories).toEqual([]);
  });

  it('nomeia as categorias de despesa', async () => {
    const deps = makeDeps();
    await new CreateEntry(deps).execute({
      ...base,
      entityId: 'pessoal-br',
      kind: 'expense',
      categoryId: 'impostos',
      settledOn: '2026-10-01',
    });
    const [br] = (await new GetOverview(deps).execute('2026-10')).regions;
    expect(br?.categories[0]).toMatchObject({ categoryId: 'impostos', share: 1 });
    expect(br?.categories[0]?.name).toBeTruthy();
  });
});
