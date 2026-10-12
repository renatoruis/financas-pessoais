import type { Entry } from '@/domain/entries/entry';
import type { Entity } from '@/domain/reference/reference-data';
import { summarizeEntity, type EntitySummary } from '@/domain/reports/entity-summary';
import {
  currencyKpis,
  ROLLING_MONTHS,
  rollingSeries,
  topExpenseCategories,
  upcomingCashflow,
  type CategoryShare,
  type CurrencyKpis,
  type RollingPoint,
  type UpcomingCashflow,
} from '@/domain/reports/overview';
import { CURRENCIES, type Currency } from '@/domain/shared/currency';
import { addMonths, periodOf, type IsoDate, type YearMonth } from '@/domain/shared/iso-date';
import type { EntryRepository } from '../ports/entry-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import type { Clock } from '../ports/system';
import { loadReference, type ReferenceData } from '../shared/reference-lookup';

export interface NamedCategoryShare extends CategoryShare {
  readonly name: string;
}

/** Tudo o que se soma numa moeda: as entidades do Brasil (R$) ou de Portugal (€). */
export interface CurrencyOverview {
  readonly currency: Currency;
  readonly entities: readonly Entity[];
  readonly kpis: CurrencyKpis;
  readonly series: readonly RollingPoint[];
  readonly categories: readonly NamedCategoryShare[];
  readonly upcoming: UpcomingCashflow;
}

export interface Overview {
  readonly period: YearMonth;
  readonly today: IsoDate;
  readonly regions: readonly CurrencyOverview[];
}

interface Deps {
  readonly entries: EntryRepository;
  readonly reference: ReferenceRepository;
  readonly clock: Clock;
}

interface Context {
  readonly period: YearMonth;
  readonly today: IsoDate;
  readonly reference: ReferenceData;
  readonly entries: readonly Entry[];
  readonly pending: readonly Entry[];
}

const ownOf = (list: readonly Entry[], entity: Entity) =>
  list.filter((e) => e.entityId === entity.id);

function summaryAt(ctx: Context, entity: Entity, period: YearMonth): EntitySummary {
  return summarizeEntity({
    entity,
    periodEntries: ownOf(ctx.entries, entity).filter((e) => periodOf(e.dueDate) === period),
    pendingEntries: ownOf(ctx.pending, entity),
    today: ctx.today,
  });
}

function regionOf(ctx: Context, currency: Currency): CurrencyOverview {
  const entities = ctx.reference.entities.filter((e) => e.currency === currency);
  const previous = addMonths(ctx.period, -1);
  const names = new Map(ctx.reference.categories.map((c) => [c.id, c.name]));
  return {
    currency,
    entities,
    kpis: currencyKpis(
      entities.map((e) => summaryAt(ctx, e, ctx.period)),
      entities.map((e) => summaryAt(ctx, e, previous)),
      currency,
    ),
    series: rollingSeries(
      ctx.entries,
      ctx.period,
      entities.map((e) => e.id),
      currency,
    ),
    categories: topExpenseCategories(ctx.entries, currency).map((c) => ({
      ...c,
      name: names.get(c.categoryId) ?? c.categoryId,
    })),
    upcoming: upcomingCashflow(ctx.pending, ctx.today, currency),
  };
}

/** Visão integrada de todas as entidades, uma região por moeda (sem conversão). */
export class GetOverview {
  constructor(private readonly deps: Deps) {}

  async execute(period: YearMonth): Promise<Overview> {
    const today = this.deps.clock.today();
    const [reference, entries, pending] = await Promise.all([
      loadReference(this.deps.reference),
      this.deps.entries.list({
        periodFrom: addMonths(period, 1 - ROLLING_MONTHS),
        periodTo: period,
      }),
      this.deps.entries.list({ statuses: ['pending'] }),
    ]);
    const ctx: Context = { period, today, reference, entries, pending };
    const regions = CURRENCIES.map((currency) => regionOf(ctx, currency)).filter(
      (r) => r.entities.length > 0,
    );
    return { period, today, regions };
  }
}
