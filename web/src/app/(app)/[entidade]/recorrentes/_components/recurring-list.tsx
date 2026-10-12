import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { RecurringTemplate } from '@/domain/recurring/recurring-template';
import type { Currency } from '@/domain/shared/currency';
import { money } from '@/domain/shared/money';
import { Badge } from '@/ui/badge';
import { cn } from '@/ui/cn';
import { formatMonthList } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';
import { KIND_LABEL, nameMap } from '../../../_lib/labels';
import { RecurringRowActions } from './recurring-buttons';

export function ScheduleBadges({ template }: { readonly template: RecurringTemplate }) {
  return (
    <div className="flex flex-wrap gap-1">
      {template.manual && <Badge tone="info">Manual</Badge>}
      {!template.active && <Badge>Inativo</Badge>}
      {template.months?.length ? (
        <Badge tone="warning">{formatMonthList(template.months)}</Badge>
      ) : (
        !template.manual && <Badge tone="success">Todos os meses</Badge>
      )}
    </div>
  );
}

interface RecurringListProps {
  readonly templates: readonly RecurringTemplate[];
  readonly reference: ReferenceData;
  readonly currency: Currency;
}

/** Modelos em lista, para ecrãs onde a tabela não cabe. */
export function RecurringList({ templates, reference, currency }: RecurringListProps) {
  const centers = nameMap(reference.costCenters);
  const categories = nameMap(reference.categories);
  return (
    <ul className="divide-line-soft -my-3 divide-y">
      {templates.map((t) => (
        <li key={t.id} className={cn('py-3', !t.active && 'opacity-50')}>
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-fg truncate font-medium">{t.description}</p>
              <p className="text-fg-muted truncate text-xs">
                {`${KIND_LABEL[t.kind]} · dia ${t.dayOfMonth ?? 1} · ${centers.get(t.costCenterId) ?? ''} · ${categories.get(t.categoryId) ?? ''}`}
              </p>
            </div>
            <MoneyText
              value={t.expectedCents === null ? null : money(t.expectedCents, currency)}
              className="shrink-0 font-medium"
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <ScheduleBadges template={t} />
            <div className="ml-auto">
              <RecurringRowActions reference={reference} template={t} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
