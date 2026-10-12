import { describe, expect, it } from 'vitest';
import { CreateEntry } from '../entries/create-entry';
import { SaveRecurring } from '../recurring/save-recurring';
import { makeDeps } from '../testing/in-memory';
import { GetDashboard } from './get-dashboard';
import { GetHistory } from './get-history';

const base = {
  entityId: 'empresa-br',
  costCenterId: 'geral',
  categoryId: 'servicos',
  kind: 'income' as const,
  description: 'EuReciclo',
  dueDate: '2026-10-01',
  amountCents: 1900000,
};

describe('painel e histórico', () => {
  it('cartões por entidade, pendentes e falta lançar', async () => {
    const deps = makeDeps();
    const create = new CreateEntry(deps);
    await create.execute({ ...base, settledOn: '2026-10-01' });
    await create.execute({
      ...base,
      kind: 'expense',
      description: 'Impostos',
      amountCents: 510000,
      dueDate: '2026-09-20',
    });
    await new SaveRecurring(deps).execute({
      entityId: 'empresa-br',
      costCenterId: 'geral',
      categoryId: 'impostos',
      kind: 'expense',
      description: 'Contador',
      dayOfMonth: 5,
      expectedCents: 47500,
      months: null,
      manual: false,
      active: true,
    });

    const d = await new GetDashboard(deps).execute('2026-10');
    expect(d.cards).toHaveLength(5);
    const br = d.cards.find((c) => c.entity.id === 'empresa-br')!;
    expect(br.summary.result.cents).toBe(1900000);
    expect(br.summary.overdueCount).toBe(1);
    expect(br.pending.map((e) => e.description)).toEqual(['Impostos']);
    expect(br.missing).toEqual(['Contador']);
  });

  it('histórico anual da entidade', async () => {
    const deps = makeDeps();
    await new CreateEntry(deps).execute({ ...base, settledOn: '2026-10-01' });
    const h = await new GetHistory(deps).execute({ entityId: 'empresa-br', year: 2026 });
    expect(h.months[9]?.income.cents).toBe(1900000);
    expect(h.categories[0]?.categoryId).toBe('servicos');
  });
});
