import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  type AnyPgColumn,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { ENTRY_KINDS, ENTRY_SOURCES, ENTRY_STATUSES } from '@/domain/entries/entry';
import { COUNTRIES, ENTITY_GROUPS } from '@/domain/reference/reference-data';
import { CURRENCIES } from '@/domain/shared/currency';

export const entityGroupEnum = pgEnum('entity_group', ENTITY_GROUPS);
export const countryEnum = pgEnum('country', COUNTRIES);
export const currencyEnum = pgEnum('currency', CURRENCIES);
export const entryKindEnum = pgEnum('entry_kind', ENTRY_KINDS);
export const entryStatusEnum = pgEnum('entry_status', ENTRY_STATUSES);
export const entrySourceEnum = pgEnum('entry_source', ENTRY_SOURCES);

const cents = (name: string) => bigint(name, { mode: 'number' });
const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const entities = pgTable('entities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  group: entityGroupEnum('group').notNull(),
  country: countryEnum('country').notNull(),
  currency: currencyEnum('currency').notNull(),
  color: text('color').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

/** Centros e categorias são de uma entidade: chave (entity_id, id). */
export const costCenters = pgTable(
  'cost_centers',
  {
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id),
    id: text('id').notNull(),
    name: text('name').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.entityId, t.id] })],
);

export const categories = pgTable(
  'categories',
  {
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id),
    id: text('id').notNull(),
    name: text('name').notNull(),
  },
  (t) => [primaryKey({ columns: [t.entityId, t.id] })],
);

type ScopedRefs = {
  entityId: AnyPgColumn;
  costCenterId: AnyPgColumn;
  categoryId: AnyPgColumn;
};

/** Nomes explícitos: os gerados passam dos 63 caracteres que o Postgres aceita. */
const scopedReferences = (table: string, t: ScopedRefs) => [
  foreignKey({
    name: `${table}_cost_center_fk`,
    columns: [t.entityId, t.costCenterId],
    foreignColumns: [costCenters.entityId, costCenters.id],
  }),
  foreignKey({
    name: `${table}_category_fk`,
    columns: [t.entityId, t.categoryId],
    foreignColumns: [categories.entityId, categories.id],
  }),
];

export const recurringTemplates = pgTable(
  'recurring_templates',
  {
    id: uuid('id').primaryKey(),
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id),
    costCenterId: text('cost_center_id').notNull(),
    categoryId: text('category_id').notNull(),
    kind: entryKindEnum('kind').notNull(),
    description: text('description').notNull(),
    dayOfMonth: smallint('day_of_month'),
    expectedCents: cents('expected_cents'),
    months: smallint('months').array(),
    manual: boolean('manual').notNull().default(false),
    active: boolean('active').notNull().default(true),
    ...timestamps,
  },
  (t) => scopedReferences('recurring_templates', t),
);

export const entries = pgTable(
  'entries',
  {
    id: uuid('id').primaryKey(),
    entityId: text('entity_id')
      .notNull()
      .references(() => entities.id),
    currency: currencyEnum('currency').notNull(),
    costCenterId: text('cost_center_id').notNull(),
    categoryId: text('category_id').notNull(),
    kind: entryKindEnum('kind').notNull(),
    description: text('description').notNull(),
    dueDate: date('due_date', { mode: 'string' }).notNull(),
    /** `YYYY-MM` do vencimento, mantido pelo repositório (filtros e unicidade dos recorrentes). */
    period: text('period').notNull(),
    amountCents: cents('amount_cents'),
    expectedCents: cents('expected_cents'),
    status: entryStatusEnum('status').notNull(),
    settledOn: date('settled_on', { mode: 'string' }),
    notes: text('notes').notNull().default(''),
    linkGroup: uuid('link_group'),
    source: entrySourceEnum('source').notNull(),
    recurringId: uuid('recurring_id').references(() => recurringTemplates.id, {
      onDelete: 'set null',
    }),
    ...timestamps,
  },
  (t) => [
    ...scopedReferences('entries', t),
    index('entries_entity_period_idx').on(t.entityId, t.period),
    index('entries_status_idx').on(t.status),
    index('entries_link_group_idx').on(t.linkGroup),
    uniqueIndex('entries_recurring_period_uq').on(t.recurringId, t.period),
  ],
);

export const settings = pgTable(
  'settings',
  {
    id: integer('id').primaryKey().default(1),
    propertyInitialCashCents: cents('property_initial_cash_cents').notNull().default(0),
    companyPtInitialCashCents: cents('company_pt_initial_cash_cents').notNull().default(0),
    dailyRateCents: cents('daily_rate_cents').notNull(),
    vatRate: numeric('vat_rate', { precision: 5, scale: 4, mode: 'number' }).notNull(),
  },
  (t) => [check('settings_single_row', sql`${t.id} = 1`)],
);
