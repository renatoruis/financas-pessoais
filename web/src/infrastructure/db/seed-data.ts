import {
  ENTITY_IDS,
  type Category,
  type CostCenter,
  type Entity,
} from '@/domain/reference/reference-data';
import { slugify } from '@/domain/reference/slug';

export const BASE_ENTITIES: readonly Entity[] = [
  {
    id: ENTITY_IDS.companyBr,
    name: 'Empresa BR',
    group: 'companies',
    country: 'BR',
    currency: 'BRL',
    color: '#1E3A5F',
  },
  {
    id: ENTITY_IDS.companyPt,
    name: 'Empresa PT',
    group: 'companies',
    country: 'PT',
    currency: 'EUR',
    color: '#145A63',
  },
  {
    id: ENTITY_IDS.personalBr,
    name: 'Pessoal BR',
    group: 'personal',
    country: 'BR',
    currency: 'BRL',
    color: '#8C4A2F',
  },
  {
    id: ENTITY_IDS.personalPt,
    name: 'Pessoal PT',
    group: 'personal',
    country: 'PT',
    currency: 'EUR',
    color: '#A56B1C',
  },
  {
    id: ENTITY_IDS.propertiesBr,
    name: 'Imóveis BR',
    group: 'properties',
    country: 'BR',
    currency: 'BRL',
    color: '#5C4A73',
  },
];

type EntityId = (typeof ENTITY_IDS)[keyof typeof ENTITY_IDS];

const CENTER_NAMES: Record<EntityId, readonly string[]> = {
  [ENTITY_IDS.companyBr]: ['Geral', 'EuReciclo', 'DataStream', 'INFORM', 'Outros'],
  [ENTITY_IDS.companyPt]: ['Geral', 'Reach IT'],
  [ENTITY_IDS.personalBr]: ['Geral'],
  [ENTITY_IDS.personalPt]: ['Geral'],
  [ENTITY_IDS.propertiesBr]: ['Geral', 'Rossi', 'Bella Cidade', 'Vitapolis', 'Caixa'],
};

const HOUSEHOLD = [
  'Habitação',
  'Água',
  'Energia',
  'Internet',
  'Comunicações',
  'Transporte',
  'Alimentação',
  'Família',
  'Educação',
  'Cartão',
  'Remessa',
  'Seguros',
];

const CATEGORY_NAMES: Record<EntityId, readonly string[]> = {
  [ENTITY_IDS.companyBr]: [
    'Serviços',
    'Impostos',
    'Terceiros',
    'Contabilidade',
    'Pró-labore',
    'Banco',
    'Software e cloud',
    'Equipamento',
    'Outros',
  ],
  [ENTITY_IDS.companyPt]: [
    'Serviços',
    'IVA',
    'IRC',
    'Segurança Social',
    'Contabilidade',
    'Remessa',
    'Pró-labore',
    'Banco',
    'Software e cloud',
    'Equipamento',
    'Formação',
    'Deslocações',
    'Seguros',
    'Outros',
  ],
  [ENTITY_IDS.personalBr]: ['Pró-labore', ...HOUSEHOLD, 'Imóveis', 'Outros'],
  [ENTITY_IDS.personalPt]: ['Pró-labore', 'Aluguer', ...HOUSEHOLD, 'Outros'],
  [ENTITY_IDS.propertiesBr]: [
    'Aluguer',
    'Condomínio',
    'Prestação',
    'Manutenção',
    'Impostos',
    'Aporte',
    'Retirada',
    'Seguros',
    'Outros',
  ],
};

const scoped = (names: Record<EntityId, readonly string[]>): CostCenter[] =>
  Object.entries(names).flatMap(([entityId, list]) =>
    list.map((name) => ({ id: slugify(name), name, entityId })),
  );

export const BASE_COST_CENTERS: readonly CostCenter[] = scoped(CENTER_NAMES);
export const BASE_CATEGORIES: readonly Category[] = scoped(CATEGORY_NAMES);
