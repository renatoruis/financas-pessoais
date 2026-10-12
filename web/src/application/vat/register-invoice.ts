import {
  ENTITY_IDS,
  SYSTEM_CATEGORIES,
  SYSTEM_COST_CENTERS,
} from '@/domain/reference/reference-data';
import type { IsoDate } from '@/domain/shared/iso-date';
import { buildInvoiceEntries } from '@/domain/vat/invoice';
import type { EntryRepository } from '../ports/entry-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import type { SettingsRepository } from '../ports/settings-repository';
import type { IdGenerator } from '../ports/system';
import {
  assertEntryReferences,
  loadReference,
  requireCostCenter,
} from '../shared/reference-lookup';

export interface RegisterInvoiceInput {
  readonly invoiceDate: IsoDate;
  readonly days: number;
  readonly dueDate?: IsoDate | null;
  /** Cliente (centro da Empresa PT); por omissão Reach IT. */
  readonly costCenterId?: string;
}

interface Deps {
  readonly entries: EntryRepository;
  readonly reference: ReferenceRepository;
  readonly settings: SettingsRepository;
  readonly ids: IdGenerator;
}

/** Fatura da Empresa PT: base (dias × taxa diária) + IVA, pendentes e ligados. */
export class RegisterInvoice {
  constructor(private readonly deps: Deps) {}

  async execute(input: RegisterInvoiceInput): Promise<void> {
    const ref = await loadReference(this.deps.reference);
    const costCenterId = input.costCenterId ?? SYSTEM_COST_CENTERS.reachIt;
    const entity = assertEntryReferences(ref, {
      entityId: ENTITY_IDS.companyPt,
      costCenterId,
      categoryId: SYSTEM_CATEGORIES.services,
    });
    const settings = await this.deps.settings.get();
    const { ids } = this.deps;
    const pair = buildInvoiceEntries({
      entity,
      costCenterId,
      clientName: requireCostCenter(ref, entity.id, costCenterId).name,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate ?? null,
      days: input.days,
      dailyRateCents: settings.dailyRate.cents,
      vatRate: settings.vatRate,
      ids: [ids.next(), ids.next()],
      linkGroup: ids.next(),
    });
    await this.deps.entries.saveMany(pair);
  }
}
