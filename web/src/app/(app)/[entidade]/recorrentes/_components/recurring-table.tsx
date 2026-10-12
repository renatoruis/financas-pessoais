import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { RecurringTemplate } from '@/domain/recurring/recurring-template';
import type { Entity } from '@/domain/reference/reference-data';
import { money } from '@/domain/shared/money';
import { Badge } from '@/ui/badge';
import { Card } from '@/ui/card';
import { cn } from '@/ui/cn';
import { formatMonthList } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';
import { Table, Td, Th } from '@/ui/table';
import { GROUP_ICON, KIND_LABEL, nameMap } from '../../../_lib/labels';
import { RecurringRowActions } from './recurring-buttons';

interface RecurringTableProps {
  readonly entity: Entity;
  readonly templates: readonly RecurringTemplate[];
  readonly reference: ReferenceData;
}

function ScheduleBadges({ template }: { readonly template: RecurringTemplate }) {
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

export function RecurringTable({ entity, templates, reference }: RecurringTableProps) {
  const centers = nameMap(reference.costCenters);
  const categories = nameMap(reference.categories);
  return (
    <Card
      title={entity.name}
      subtitle={`${templates.length} modelos`}
      icon={GROUP_ICON[entity.group]}
      accent={entity.color}
    >
      <Table>
        <thead>
          <tr>
            <Th>Descrição</Th>
            <Th>Centro · Categoria</Th>
            <Th>Dia</Th>
            <Th className="text-right">Previsto</Th>
            <Th>Quando</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.id} className={cn('hover:bg-slate-50/60', !t.active && 'opacity-50')}>
              <Td>
                <p className="font-medium text-slate-900">{t.description}</p>
                <p className="text-xs text-slate-500">{KIND_LABEL[t.kind]}</p>
              </Td>
              <Td className="whitespace-nowrap text-slate-600">
                {centers.get(t.costCenterId)} · {categories.get(t.categoryId)}
              </Td>
              <Td className="tabular text-slate-600">{t.dayOfMonth ?? 1}</Td>
              <Td className="text-right font-medium">
                <MoneyText
                  value={t.expectedCents === null ? null : money(t.expectedCents, entity.currency)}
                />
              </Td>
              <Td>
                <ScheduleBadges template={t} />
              </Td>
              <Td>
                <RecurringRowActions reference={reference} template={t} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
