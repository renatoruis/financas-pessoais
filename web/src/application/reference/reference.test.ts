import { describe, expect, it } from 'vitest';
import { UpdateSettings } from '../settings/update-settings';
import { makeDeps } from '../testing/in-memory';
import { CreateCategory } from './create-category';
import { CreateCostCenter } from './create-cost-center';
import { GetReferenceData } from './get-reference-data';

describe('referência e definições', () => {
  it('cria categoria na entidade e só recusa duplicada na mesma entidade', async () => {
    const deps = makeDeps();
    const create = new CreateCategory(deps);
    expect(await create.execute({ name: ' Saúde ', entityId: 'pessoal-pt' })).toEqual({
      id: 'saude',
      name: 'Saúde',
      entityId: 'pessoal-pt',
    });
    await expect(create.execute({ name: 'saúde', entityId: 'pessoal-pt' })).rejects.toThrow(
      'já existe',
    );
    await expect(create.execute({ name: 'Saúde', entityId: 'pessoal-br' })).resolves.toBeTruthy();
  });

  it('cria centro para uma entidade', async () => {
    const deps = makeDeps();
    const c = await new CreateCostCenter(deps).execute({
      name: 'Novo Apto',
      entityId: 'imoveis-br',
    });
    expect(c).toEqual({ id: 'novo-apto', name: 'Novo Apto', entityId: 'imoveis-br' });
    await expect(
      new CreateCostCenter(deps).execute({ name: 'X', entityId: 'nada' }),
    ).rejects.toThrow();
  });

  it('devolve a referência de uma só entidade', async () => {
    const deps = makeDeps();
    const ref = await new GetReferenceData(deps).execute('empresa-pt');
    expect(ref.entities.map((e) => e.id)).toEqual(['empresa-pt']);
    expect(ref.costCenters.every((c) => c.entityId === 'empresa-pt')).toBe(true);
    expect(ref.categories.map((c) => c.id)).toContain('iva');
    await expect(new GetReferenceData(deps).execute('nada')).rejects.toThrow('desconhecida');
  });

  it('atualiza só os campos indicados e valida', async () => {
    const deps = makeDeps();
    await new UpdateSettings(deps).execute({ propertyInitialCashCents: 100 });
    const s = await new UpdateSettings(deps).execute({ dailyRateCents: 27000 });
    expect(s.dailyRate).toEqual({ cents: 27000, currency: 'EUR' });
    expect(s.propertyInitialCash).toEqual({ cents: 100, currency: 'BRL' });
    await expect(new UpdateSettings(deps).execute({ vatRate: 2 })).rejects.toThrow('IVA');
  });
});
