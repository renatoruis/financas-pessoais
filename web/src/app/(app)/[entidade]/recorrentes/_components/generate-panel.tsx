import type { PlannedEntry } from '@/domain/recurring/recurring-plan';
import type { Entity } from '@/domain/reference/reference-data';
import type { YearMonth } from '@/domain/shared/iso-date';
import { money } from '@/domain/shared/money';
import { Card } from '@/ui/card';
import { EmptyState } from '@/ui/empty-state';
import { formatPeriod, formatShortDate } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';
import { GenerateButton } from './recurring-buttons';

interface GeneratePanelProps {
  readonly entity: Entity;
  readonly period: YearMonth;
  readonly plan: readonly PlannedEntry[];
}

/** Pré-visualização do que "Gerar mês" vai criar nesta entidade, com o botão para confirmar. */
export function GeneratePanel({ entity, period, plan }: GeneratePanelProps) {
  return (
    <Card
      title={`Gerar ${formatPeriod(period)}`}
      subtitle="Cria os pendentes que ainda faltam neste mês, sem duplicar"
      icon="wand-magic-sparkles"
      actions={<GenerateButton entityId={entity.id} period={period} count={plan.length} />}
    >
      {plan.length === 0 ? (
        <EmptyState icon="circle-check" title="Tudo lançado">
          Todos os recorrentes deste mês já têm lançamento.
        </EmptyState>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {plan.map(({ template, dueDate }) => (
            <li
              key={template.id}
              className="bg-surface-muted flex items-center gap-3 rounded-xl px-3 py-2 text-sm"
            >
              <span className="h-6 w-1 rounded-full" style={{ backgroundColor: entity.color }} />
              <div className="min-w-0 flex-1">
                <p className="text-fg truncate font-medium">{template.description}</p>
                <p className="text-fg-muted text-xs">{formatShortDate(dueDate)}</p>
              </div>
              <MoneyText
                value={
                  template.expectedCents === null
                    ? null
                    : money(template.expectedCents, entity.currency)
                }
                className="text-fg-muted"
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
