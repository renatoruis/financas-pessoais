import { buildPropertyMovement, type MovementType } from '@/domain/properties/property-movement';
import { ENTITY_IDS } from '@/domain/reference/reference-data';
import type { IsoDate } from '@/domain/shared/iso-date';
import type { EntryRepository } from '../ports/entry-repository';
import type { ReferenceRepository } from '../ports/reference-repository';
import type { Clock, IdGenerator } from '../ports/system';
import { loadReference, requireEntity } from '../shared/reference-lookup';

export interface RegisterPropertyMovementInput {
  readonly type: MovementType;
  readonly amountCents: number;
  /** Por omissão, hoje. */
  readonly date?: IsoDate;
  readonly note?: string;
}

interface Deps {
  readonly entries: EntryRepository;
  readonly reference: ReferenceRepository;
  readonly ids: IdGenerator;
  readonly clock: Clock;
}

/** Aporte ou retirada na caixa dos imóveis (só o lado dos imóveis). */
export class RegisterPropertyMovement {
  constructor(private readonly deps: Deps) {}

  async execute(input: RegisterPropertyMovementInput): Promise<void> {
    const ref = await loadReference(this.deps.reference);
    const entry = buildPropertyMovement({
      type: input.type,
      amountCents: input.amountCents,
      date: input.date ?? this.deps.clock.today(),
      note: input.note ?? '',
      properties: requireEntity(ref, ENTITY_IDS.propertiesBr),
      id: this.deps.ids.next(),
    });
    await this.deps.entries.saveMany([entry]);
  }
}
