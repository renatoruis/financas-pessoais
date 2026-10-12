import { describe, expect, it } from 'vitest';
import { makeDeps } from '../testing/in-memory';
import { CancelEntry } from './cancel-entry';
import { CreateEntry } from './create-entry';
import { DeleteEntry } from './delete-entry';
import { ListEntries } from './list-entries';
import { ReopenEntry } from './reopen-entry';
import { SettleEntry } from './settle-entry';
import { UpdateEntry } from './update-entry';

const input = {
  entityId: 'empresa-pt',
  costCenterId: 'geral',
  categoryId: 'servicos',
  kind: 'expense' as const,
  description: 'Contabilista',
  dueDate: '2026-10-20',
  amountCents: null,
};

describe('casos de uso de lançamentos', () => {
  it('cria com a moeda da entidade e lista por mês', async () => {
    const deps = makeDeps();
    const created = await new CreateEntry(deps).execute({ ...input, amountCents: 15000 });
    expect(created.currency).toBe('EUR');
    expect(await new ListEntries(deps).execute({ period: '2026-10' })).toHaveLength(1);
    expect(await new ListEntries(deps).execute({ period: '2026-11' })).toHaveLength(0);
  });

  it('filtra por tipo e categoria', async () => {
    const deps = makeDeps();
    const create = new CreateEntry(deps);
    await create.execute(input);
    await create.execute({ ...input, kind: 'income', description: 'Fatura' });
    await create.execute({ ...input, categoryId: 'impostos', description: 'IRC' });
    const list = new ListEntries(deps);
    const incomes = await list.execute({ period: '2026-10', kind: 'income' });
    expect(incomes.map((e) => e.description)).toEqual(['Fatura']);
    const taxes = await list.execute({ period: '2026-10', categoryId: 'impostos' });
    expect(taxes.map((e) => e.description)).toEqual(['IRC']);
  });

  it('recusa centro ou categoria de outra entidade', async () => {
    const deps = makeDeps();
    const create = new CreateEntry(deps);
    await expect(create.execute({ ...input, costCenterId: 'rossi' })).rejects.toThrow(
      'nesta entidade',
    );
    await expect(create.execute({ ...input, categoryId: 'aporte' })).rejects.toThrow(
      'nesta entidade',
    );
  });

  it('edita mantendo a entidade', async () => {
    const deps = makeDeps();
    const created = await new CreateEntry(deps).execute(input);
    const updated = await new UpdateEntry(deps).execute({
      ...input,
      id: created.id,
      amountCents: 9000,
    });
    expect(updated.amount).toEqual({ cents: 9000, currency: 'EUR' });
    expect(updated.entityId).toBe('empresa-pt');
  });

  it('liquida hoje com valor final; sem valor recusa', async () => {
    const deps = makeDeps();
    const { id } = await new CreateEntry(deps).execute(input);
    const settle = new SettleEntry(deps);
    await expect(settle.execute({ id, finalAmountCents: null })).rejects.toThrow('valor final');
    expect(await settle.execute({ id, finalAmountCents: 12000 })).toEqual({ settled: 1 });
    expect(deps.entries.rows.get(id)).toMatchObject({ status: 'settled', settledOn: '2026-10-12' });
  });

  it('liquida na data indicada', async () => {
    const deps = makeDeps();
    const { id } = await new CreateEntry(deps).execute({ ...input, amountCents: 5000 });
    await new SettleEntry(deps).execute({ id, finalAmountCents: null, on: '2026-10-03' });
    expect(deps.entries.rows.get(id)).toMatchObject({ status: 'settled', settledOn: '2026-10-03' });
  });

  it('cancela, reabre e apaga', async () => {
    const deps = makeDeps();
    const { id } = await new CreateEntry(deps).execute(input);
    await new CancelEntry(deps).execute(id);
    expect(deps.entries.rows.get(id)?.status).toBe('cancelled');
    await new ReopenEntry(deps).execute(id);
    expect(deps.entries.rows.get(id)?.status).toBe('pending');
    await new DeleteEntry(deps).execute(id);
    expect(deps.entries.rows.size).toBe(0);
    await expect(new DeleteEntry(deps).execute(id)).rejects.toThrow('não encontrado');
  });
});
