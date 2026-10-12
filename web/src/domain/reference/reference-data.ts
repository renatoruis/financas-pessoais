import type { Currency } from '../shared/currency';

export const ENTITY_GROUPS = ['companies', 'personal', 'properties'] as const;
export type EntityGroup = (typeof ENTITY_GROUPS)[number];

export const COUNTRIES = ['BR', 'PT'] as const;
export type Country = (typeof COUNTRIES)[number];

export interface Entity {
  readonly id: string;
  readonly name: string;
  readonly group: EntityGroup;
  readonly country: Country;
  readonly currency: Currency;
  readonly color: string;
}

/** Centros e categorias pertencem a uma entidade; o `id` (slug) só é único dentro dela. */
interface EntityScoped {
  readonly id: string;
  readonly name: string;
  readonly entityId: string;
}

export type CostCenter = EntityScoped;
export type Category = EntityScoped;

export const ENTITY_IDS = {
  companyBr: 'empresa-br',
  companyPt: 'empresa-pt',
  personalBr: 'pessoal-br',
  personalPt: 'pessoal-pt',
  propertiesBr: 'imoveis-br',
} as const;

/** Centros usados pelas regras de negócio. */
export const SYSTEM_COST_CENTERS = {
  general: 'geral',
  propertyCash: 'caixa',
  reachIt: 'reach-it',
} as const;

/** Categorias usadas pelas regras de negócio. */
export const SYSTEM_CATEGORIES = {
  vat: 'iva',
  contribution: 'aporte',
  withdrawal: 'retirada',
  propertyFunding: 'imoveis',
  services: 'servicos',
} as const;

export const currencyOfCountry = (country: Country): Currency => (country === 'PT' ? 'EUR' : 'BRL');

export const belongsToEntity = (item: { readonly entityId: string }, entityId: string): boolean =>
  item.entityId === entityId;

export const ofEntity = <T extends { readonly entityId: string }>(
  items: readonly T[],
  entityId: string,
): T[] => items.filter((item) => belongsToEntity(item, entityId));

/** Categorias que movem dinheiro mas não são resultado operacional (IVA, aportes, retiradas). */
const NON_OPERATIONAL_CATEGORIES: ReadonlySet<string> = new Set([
  SYSTEM_CATEGORIES.vat,
  SYSTEM_CATEGORIES.contribution,
  SYSTEM_CATEGORIES.withdrawal,
]);

export const isOperationalCategory = (categoryId: string): boolean =>
  !NON_OPERATIONAL_CATEGORIES.has(categoryId);
