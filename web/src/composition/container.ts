import { CancelEntry } from '@/application/entries/cancel-entry';
import { CreateEntry } from '@/application/entries/create-entry';
import { DeleteEntry } from '@/application/entries/delete-entry';
import { ListEntries } from '@/application/entries/list-entries';
import { ReopenEntry } from '@/application/entries/reopen-entry';
import { SettleEntry } from '@/application/entries/settle-entry';
import { UpdateEntry } from '@/application/entries/update-entry';
import { GetPropertyOverview } from '@/application/properties/get-property-overview';
import { GetPropertyYear } from '@/application/properties/get-property-year';
import { RegisterPropertyMovement } from '@/application/properties/register-property-movement';
import { DeleteRecurring } from '@/application/recurring/delete-recurring';
import { GenerateRecurring } from '@/application/recurring/generate-recurring';
import { ListRecurring } from '@/application/recurring/list-recurring';
import { PreviewRecurring } from '@/application/recurring/preview-recurring';
import { SaveRecurring } from '@/application/recurring/save-recurring';
import { CreateCategory } from '@/application/reference/create-category';
import { CreateCostCenter } from '@/application/reference/create-cost-center';
import { GetReferenceData } from '@/application/reference/get-reference-data';
import { GetDashboard } from '@/application/reports/get-dashboard';
import { GetHistory } from '@/application/reports/get-history';
import { GetOverview } from '@/application/reports/get-overview';
import { GetSettings } from '@/application/settings/get-settings';
import { UpdateSettings } from '@/application/settings/update-settings';
import { GetVatOverview } from '@/application/vat/get-vat-overview';
import { RegisterInvoice } from '@/application/vat/register-invoice';
import { readEnv } from '@/infrastructure/config/env';
import { createDb } from '@/infrastructure/db/client';
import { DrizzleEntryRepository } from '@/infrastructure/repositories/drizzle-entry-repository';
import { DrizzleRecurringRepository } from '@/infrastructure/repositories/drizzle-recurring-repository';
import { DrizzleReferenceRepository } from '@/infrastructure/repositories/drizzle-reference-repository';
import { DrizzleSettingsRepository } from '@/infrastructure/repositories/drizzle-settings-repository';
import { SystemClock, UuidGenerator } from '@/infrastructure/system/system-clock';

function buildDeps() {
  const env = readEnv();
  const db = createDb(env.DATABASE_URL);
  return {
    entries: new DrizzleEntryRepository(db),
    recurring: new DrizzleRecurringRepository(db),
    reference: new DrizzleReferenceRepository(db),
    settings: new DrizzleSettingsRepository(db),
    clock: new SystemClock(env.APP_TIMEZONE),
    ids: new UuidGenerator(),
  };
}

function buildContainer() {
  const deps = buildDeps();
  return {
    clock: deps.clock,
    listEntries: new ListEntries(deps),
    createEntry: new CreateEntry(deps),
    updateEntry: new UpdateEntry(deps),
    settleEntry: new SettleEntry(deps),
    cancelEntry: new CancelEntry(deps),
    reopenEntry: new ReopenEntry(deps),
    deleteEntry: new DeleteEntry(deps),
    listRecurring: new ListRecurring(deps),
    saveRecurring: new SaveRecurring(deps),
    deleteRecurring: new DeleteRecurring(deps),
    previewRecurring: new PreviewRecurring(deps),
    generateRecurring: new GenerateRecurring(deps),
    getPropertyOverview: new GetPropertyOverview(deps),
    getPropertyYear: new GetPropertyYear(deps),
    registerPropertyMovement: new RegisterPropertyMovement(deps),
    registerInvoice: new RegisterInvoice(deps),
    getVatOverview: new GetVatOverview(deps),
    getDashboard: new GetDashboard(deps),
    getHistory: new GetHistory(deps),
    getOverview: new GetOverview(deps),
    getReferenceData: new GetReferenceData(deps),
    createCategory: new CreateCategory(deps),
    createCostCenter: new CreateCostCenter(deps),
    getSettings: new GetSettings(deps),
    updateSettings: new UpdateSettings(deps),
  };
}

export type Container = ReturnType<typeof buildContainer>;

/** Uma instância por processo (sobrevive ao hot reload em desenvolvimento). */
const holder = globalThis as typeof globalThis & { __financasContainer?: Container };

export function getContainer(): Container {
  holder.__financasContainer ??= buildContainer();
  return holder.__financasContainer;
}
