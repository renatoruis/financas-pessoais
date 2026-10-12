import type { EntryKind, EntryStatus } from '@/domain/entries/entry';
import type { EntityGroup } from '@/domain/reference/reference-data';
import type { Tone } from '@/ui/badge';

export const KIND_LABEL: Record<EntryKind, string> = { income: 'Receita', expense: 'Despesa' };

export const STATUS_LABEL: Record<EntryStatus, string> = {
  pending: 'Pendente',
  settled: 'Liquidado',
  cancelled: 'Cancelado',
};

export const STATUS_TONE: Record<EntryStatus, Tone> = {
  pending: 'warning',
  settled: 'success',
  cancelled: 'neutral',
};

export const GROUP_LABEL: Record<EntityGroup, string> = {
  companies: 'Empresas',
  personal: 'Pessoal',
  properties: 'Imóveis',
};

export const GROUP_ICON: Record<EntityGroup, string> = {
  companies: 'briefcase',
  personal: 'user',
  properties: 'building',
};

/** Mapa id → nome para mostrar referências. */
export const nameMap = (items: readonly { id: string; name: string }[]): Map<string, string> =>
  new Map(items.map((i) => [i.id, i.name]));
