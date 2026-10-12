import { createEntry, type Entry } from '../entries/entry';
import type { Entity } from '../reference/reference-data';
import { dateInPeriod, periodOf, type IsoDate, type YearMonth } from '../shared/iso-date';
import { isDueInPeriod, type RecurringTemplate } from './recurring-template';

export interface PlannedEntry {
  readonly template: RecurringTemplate;
  readonly dueDate: IsoDate;
}

export interface RecurringPlanInput {
  readonly templates: readonly RecurringTemplate[];
  readonly period: YearMonth;
  /** Lançamentos já existentes (de qualquer mês; só os do período contam). */
  readonly existing: readonly Entry[];
}

const keyOf = (entityId: string, description: string): string => `${entityId}|${description}`;

/**
 * O que falta lançar no mês: modelos devidos que ainda não têm lançamento.
 * Duplicado = mesmo modelo, ou mesma entidade + descrição no mesmo mês (como na planilha).
 */
export function planRecurringEntries(input: RecurringPlanInput): PlannedEntry[] {
  const inPeriod = input.existing.filter((e) => periodOf(e.dueDate) === input.period);
  const byTemplate = new Set(inPeriod.map((e) => e.recurringId).filter(Boolean));
  const byKey = new Set(inPeriod.map((e) => keyOf(e.entityId, e.description)));
  return input.templates
    .filter((t) => isDueInPeriod(t, input.period))
    .filter((t) => !byTemplate.has(t.id) && !byKey.has(keyOf(t.entityId, t.description)))
    .map((template) => ({
      template,
      dueDate: dateInPeriod(input.period, template.dayOfMonth ?? 1),
    }));
}

/** Converte o plano em lançamentos pendentes; o valor começa igual ao previsto (pode ser vazio). */
export function entryFromPlan(planned: PlannedEntry, entity: Entity, id: string): Entry {
  const { template } = planned;
  return createEntry({
    id,
    entity,
    costCenterId: template.costCenterId,
    categoryId: template.categoryId,
    kind: template.kind,
    description: template.description,
    dueDate: planned.dueDate,
    amountCents: template.expectedCents,
    expectedCents: template.expectedCents,
    source: 'recurring',
    recurringId: template.id,
  });
}
