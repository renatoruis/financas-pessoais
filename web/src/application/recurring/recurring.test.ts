import { describe, expect, it } from 'vitest';
import { makeDeps } from '../testing/in-memory';
import { DeleteRecurring } from './delete-recurring';
import { GenerateRecurring } from './generate-recurring';
import { ListRecurring } from './list-recurring';
import { PreviewRecurring } from './preview-recurring';
import { SaveRecurring } from './save-recurring';

const template = {
  entityId: 'empresa-pt',
  costCenterId: 'geral',
  categoryId: 'iva',
  kind: 'expense' as const,
  description: 'IVA trimestral',
  dayOfMonth: 25,
  expectedCents: null,
  months: [2, 5, 8, 11],
  manual: false,
  active: true,
};

const scope = (period: string) => ({ entityId: 'empresa-pt', period });

describe('casos de uso de recorrentes', () => {
  it('guarda, pré-visualiza e gera sem duplicar', async () => {
    const deps = makeDeps();
    await new SaveRecurring(deps).execute(template);
    await new SaveRecurring(deps).execute({
      ...template,
      description: 'Banco',
      months: null,
      dayOfMonth: null,
      expectedCents: 1500,
    });

    expect(await new PreviewRecurring(deps).execute(scope('2026-12'))).toHaveLength(1);
    const preview = await new PreviewRecurring(deps).execute(scope('2026-11'));
    expect(preview.map((p) => p.dueDate)).toEqual(['2026-11-25', '2026-11-01']);

    expect(await new GenerateRecurring(deps).execute(scope('2026-11'))).toEqual({ created: 2 });
    expect(await new GenerateRecurring(deps).execute(scope('2026-11'))).toEqual({ created: 0 });
    const banco = [...deps.entries.rows.values()].find((e) => e.description === 'Banco');
    expect(banco?.amount).toEqual({ cents: 1500, currency: 'EUR' });
  });

  it('só lista e gera os modelos da entidade', async () => {
    const deps = makeDeps();
    await new SaveRecurring(deps).execute(template);
    await new SaveRecurring(deps).execute({
      ...template,
      entityId: 'empresa-br',
      categoryId: 'servicos',
      months: null,
    });
    expect(await new ListRecurring(deps).execute('empresa-br')).toHaveLength(1);
    const other = { entityId: 'empresa-br', period: '2026-11' };
    expect(await new GenerateRecurring(deps).execute(other)).toEqual({ created: 1 });
    const entityIds = [...deps.entries.rows.values()].map((e) => e.entityId);
    expect(entityIds).toEqual(['empresa-br']);
  });

  it('edita e apaga modelos', async () => {
    const deps = makeDeps();
    const saved = await new SaveRecurring(deps).execute(template);
    await new SaveRecurring(deps).execute({ ...saved, manual: true });
    expect((await new ListRecurring(deps).execute('empresa-pt'))[0]?.manual).toBe(true);
    await new DeleteRecurring(deps).execute(saved.id);
    expect(await new ListRecurring(deps).execute('empresa-pt')).toHaveLength(0);
  });

  it('valida referências da própria entidade', async () => {
    const deps = makeDeps();
    await expect(
      new SaveRecurring(deps).execute({ ...template, categoryId: 'xpto' }),
    ).rejects.toThrow('Categoria');
    await expect(
      new SaveRecurring(deps).execute({ ...template, costCenterId: 'eureciclo' }),
    ).rejects.toThrow('Centro');
  });
});
