import { ENTITY_IDS } from '@/domain/reference/reference-data';

export interface EntityModule {
  /** Segmento da rota em `/[entidade]/…`; vazio = Resumo. */
  readonly slug: string;
  readonly label: string;
  readonly icon: string;
}

const COMMON: readonly EntityModule[] = [
  { slug: '', label: 'Resumo', icon: 'gauge' },
  { slug: 'lancamentos', label: 'Lançamentos', icon: 'list-check' },
  { slug: 'recorrentes', label: 'Recorrentes', icon: 'repeat' },
  { slug: 'historico', label: 'Histórico', icon: 'chart-line' },
];

/** Módulos que só existem numa entidade. */
const SPECIFIC: Readonly<Record<string, readonly EntityModule[]>> = {
  [ENTITY_IDS.companyPt]: [{ slug: 'iva', label: 'IVA e faturas', icon: 'landmark' }],
  [ENTITY_IDS.propertiesBr]: [{ slug: 'cobertura', label: 'Cobertura e caixa', icon: 'building' }],
};

const SETTINGS: EntityModule = { slug: 'cadastros', label: 'Cadastros', icon: 'sliders' };

export const modulesOf = (entityId: string): readonly EntityModule[] => [
  ...COMMON,
  ...(SPECIFIC[entityId] ?? []),
  SETTINGS,
];

export const hasModule = (entityId: string, slug: string): boolean =>
  modulesOf(entityId).some((m) => m.slug === slug);

export const entityHref = (entityId: string, slug = ''): string =>
  slug ? `/${entityId}/${slug}` : `/${entityId}`;
