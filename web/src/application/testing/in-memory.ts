import type { Entry } from '@/domain/entries/entry';
import { byDueDate } from '@/domain/entries/entry-schedule';
import type { RecurringTemplate } from '@/domain/recurring/recurring-template';
import type { Category, CostCenter, Entity } from '@/domain/reference/reference-data';
import { periodOf, type IsoDate } from '@/domain/shared/iso-date';
import { DEFAULT_SETTINGS, type Settings } from '@/domain/settings/settings';
import { ENTITIES } from '@/domain/testing/fixtures';
import type { EntryFilter, EntryRepository } from '../ports/entry-repository';
import type { RecurringRepository } from '../ports/recurring-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import type { SettingsRepository } from '../ports/settings-repository';
import type { Clock, IdGenerator } from '../ports/system';

function matches(e: Entry, f: EntryFilter): boolean {
  const period = periodOf(e.dueDate);
  const text = f.search?.toLowerCase();
  return (
    (!f.entityIds || f.entityIds.includes(e.entityId)) &&
    (!f.period || period === f.period) &&
    (!f.periodFrom || period >= f.periodFrom) &&
    (!f.periodTo || period <= f.periodTo) &&
    (!f.statuses || f.statuses.includes(e.status)) &&
    (!f.costCenterId || e.costCenterId === f.costCenterId) &&
    (!f.categoryId || e.categoryId === f.categoryId) &&
    (!f.linkGroup || e.linkGroup === f.linkGroup) &&
    (!text || `${e.description} ${e.notes}`.toLowerCase().includes(text))
  );
}

export class InMemoryEntryRepository implements EntryRepository {
  readonly rows = new Map<string, Entry>();
  async findById(id: string) {
    return this.rows.get(id) ?? null;
  }
  async list(filter: EntryFilter) {
    return [...this.rows.values()].filter((e) => matches(e, filter)).sort(byDueDate);
  }
  async saveMany(entries: readonly Entry[]) {
    entries.forEach((e) => this.rows.set(e.id, e));
  }
  async delete(id: string) {
    this.rows.delete(id);
  }
}

export class InMemoryRecurringRepository implements RecurringRepository {
  readonly rows = new Map<string, RecurringTemplate>();
  async list() {
    return [...this.rows.values()];
  }
  async findById(id: string) {
    return this.rows.get(id) ?? null;
  }
  async save(t: RecurringTemplate) {
    this.rows.set(t.id, t);
  }
  async delete(id: string) {
    this.rows.delete(id);
  }
}

const scoped = (id: string, entityId: string) => ({ id, name: id, entityId });
const ENTITY_LIST = Object.values(ENTITIES);

export class InMemoryReferenceRepository implements ReferenceRepository {
  entities: Entity[] = ENTITY_LIST;
  centers: CostCenter[] = [
    ...ENTITY_LIST.map((e) => scoped('geral', e.id)),
    scoped('eureciclo', ENTITIES.companyBr.id),
    scoped('reach-it', ENTITIES.companyPt.id),
    scoped('rossi', ENTITIES.propertiesBr.id),
    scoped('bella-cidade', ENTITIES.propertiesBr.id),
    scoped('vitapolis', ENTITIES.propertiesBr.id),
    scoped('caixa', ENTITIES.propertiesBr.id),
  ];
  categories: Category[] = [
    ...ENTITY_LIST.flatMap((e) => ['servicos', 'impostos'].map((id) => scoped(id, e.id))),
    scoped('iva', ENTITIES.companyPt.id),
    ...['aporte', 'retirada'].map((id) => scoped(id, ENTITIES.propertiesBr.id)),
    scoped('imoveis', ENTITIES.personalBr.id),
  ];
  async listEntities() {
    return this.entities;
  }
  async listCostCenters() {
    return this.centers;
  }
  async listCategories() {
    return this.categories;
  }
  async saveCostCenter(c: CostCenter) {
    this.centers.push(c);
  }
  async saveCategory(c: Category) {
    this.categories.push(c);
  }
}

export class InMemorySettingsRepository implements SettingsRepository {
  value: Settings = DEFAULT_SETTINGS;
  async get() {
    return this.value;
  }
  async save(s: Settings) {
    this.value = s;
  }
}

export class FixedClock implements Clock {
  constructor(public date: IsoDate = '2026-10-12') {}
  today() {
    return this.date;
  }
}

export class SequentialIds implements IdGenerator {
  private n = 0;
  next() {
    this.n += 1;
    return `id-${this.n}`;
  }
}

export function makeDeps() {
  return {
    entries: new InMemoryEntryRepository(),
    recurring: new InMemoryRecurringRepository(),
    reference: new InMemoryReferenceRepository(),
    settings: new InMemorySettingsRepository(),
    clock: new FixedClock(),
    ids: new SequentialIds(),
  };
}
