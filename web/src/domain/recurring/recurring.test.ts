import { describe, expect, it } from 'vitest';
import { ENTITIES, makeEntry } from '../testing/fixtures';
import { entryFromPlan, planRecurringEntries } from './recurring-plan';
import {
  isDueInPeriod,
  parseMonths,
  validateTemplate,
  type RecurringTemplate,
} from './recurring-template';

const template = (overrides: Partial<RecurringTemplate> = {}): RecurringTemplate => ({
  id: 't1',
  entityId: ENTITIES.companyPt.id,
  costCenterId: 'geral',
  categoryId: 'iva',
  kind: 'expense',
  description: 'IVA trimestral',
  dayOfMonth: 25,
  expectedCents: null,
  months: [2, 5, 8, 11],
  manual: false,
  active: true,
  ...overrides,
});

describe('recurring-template', () => {
  it('respeita meses, manual e inativo', () => {
    expect(isDueInPeriod(template(), '2026-11')).toBe(true);
    expect(isDueInPeriod(template(), '2026-12')).toBe(false);
    expect(isDueInPeriod(template({ months: null }), '2026-12')).toBe(true);
    expect(isDueInPeriod(template({ manual: true }), '2026-11')).toBe(false);
    expect(isDueInPeriod(template({ active: false }), '2026-11')).toBe(false);
  });

  it('interpreta a lista de meses', () => {
    expect(parseMonths('2,5, 8 ;11')).toEqual([2, 5, 8, 11]);
    expect(parseMonths('')).toBeNull();
    expect(() => parseMonths('13')).toThrow('entre 1 e 12');
  });

  it('valida o modelo', () => {
    expect(() => validateTemplate(template({ dayOfMonth: 32 }))).toThrow('dia');
    expect(validateTemplate(template({ description: ' X ' })).description).toBe('X');
  });
});

describe('planRecurringEntries', () => {
  it('gera os devidos com dia limitado ao fim do mês', () => {
    const plan = planRecurringEntries({
      templates: [template({ id: 'a', months: null, dayOfMonth: 31, description: 'A' })],
      period: '2026-11',
      existing: [],
    });
    expect(plan.map((p) => p.dueDate)).toEqual(['2026-11-30']);
  });

  it('salta duplicados por modelo ou por entidade + descrição no mesmo mês', () => {
    const templates = [
      template({ id: 'a', months: null, description: 'A' }),
      template({ id: 'b', months: null, description: 'B' }),
      template({ id: 'c', months: null, description: 'C' }),
    ];
    const existing = [
      makeEntry({ entity: ENTITIES.companyPt, recurringId: 'a', dueDate: '2026-11-03' }),
      makeEntry({ entity: ENTITIES.companyPt, description: 'B', dueDate: '2026-11-03' }),
      makeEntry({ entity: ENTITIES.companyPt, recurringId: 'c', dueDate: '2026-10-03' }),
    ];
    const plan = planRecurringEntries({ templates, period: '2026-11', existing });
    expect(plan.map((p) => p.template.id)).toEqual(['c']);
  });

  it('cria lançamento pendente com valor igual ao previsto', () => {
    const [planned] = planRecurringEntries({
      templates: [template({ months: null, expectedCents: 4500 })],
      period: '2026-12',
      existing: [],
    });
    const entry = entryFromPlan(planned!, ENTITIES.companyPt, 'n1');
    expect(entry).toMatchObject({ status: 'pending', source: 'recurring', recurringId: 't1' });
    expect(entry.amount?.cents).toBe(4500);
    expect(entry.expected?.cents).toBe(4500);
  });
});
