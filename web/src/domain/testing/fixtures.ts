import { createEntry, type CreateEntryProps, type Entry } from '../entries/entry';
import { ENTITY_IDS, type Entity } from '../reference/reference-data';

export const ENTITIES: Record<keyof typeof ENTITY_IDS, Entity> = {
  companyBr: {
    id: ENTITY_IDS.companyBr,
    name: 'Empresa BR',
    group: 'companies',
    country: 'BR',
    currency: 'BRL',
    color: '#1E3A5F',
  },
  companyPt: {
    id: ENTITY_IDS.companyPt,
    name: 'Empresa PT',
    group: 'companies',
    country: 'PT',
    currency: 'EUR',
    color: '#145A63',
  },
  personalBr: {
    id: ENTITY_IDS.personalBr,
    name: 'Pessoal BR',
    group: 'personal',
    country: 'BR',
    currency: 'BRL',
    color: '#8C4A2F',
  },
  personalPt: {
    id: ENTITY_IDS.personalPt,
    name: 'Pessoal PT',
    group: 'personal',
    country: 'PT',
    currency: 'EUR',
    color: '#A56B1C',
  },
  propertiesBr: {
    id: ENTITY_IDS.propertiesBr,
    name: 'Imóveis BR',
    group: 'properties',
    country: 'BR',
    currency: 'BRL',
    color: '#5C4A73',
  },
};

let sequence = 0;

/** Lançamento de teste com valores por omissão; valores em unidades (não cêntimos). */
export function makeEntry(
  overrides: Partial<Omit<CreateEntryProps, 'amountCents'>> & { amount?: number | null } = {},
): Entry {
  sequence += 1;
  const { amount = 100, ...rest } = overrides;
  return createEntry({
    id: `e${sequence}`,
    entity: ENTITIES.companyBr,
    costCenterId: 'geral',
    categoryId: 'servicos',
    kind: 'expense',
    description: `Lançamento ${sequence}`,
    dueDate: '2026-10-01',
    amountCents: amount === null ? null : Math.round(amount * 100),
    ...rest,
  });
}
