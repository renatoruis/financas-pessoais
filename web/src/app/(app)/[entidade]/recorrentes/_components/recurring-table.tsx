import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { RecurringTemplate } from '@/domain/recurring/recurring-template';
import type { Entity } from '@/domain/reference/reference-data';
import { money } from '@/domain/shared/money';
import { Card } from '@/ui/card';
import { cn } from '@/ui/cn';
import { MoneyText } from '@/ui/money-text';
import { Table, Td, Th } from '@/ui/table';
import { GROUP_ICON, KIND_LABEL, nameMap } from '../../../_lib/labels';
import { RecurringRowActions } from './recurring-buttons';
import { RecurringList, ScheduleBadges } from './recurring-list';

interface RecurringTableProps {
  readonly entity: Entity;
  readonly templates: readonly RecurringTemplate[];
  readonly reference: ReferenceData;
}

function TemplatesTable({ entity, templates, reference }: RecurringTableProps) {
  const centers = nameMap(reference.costCenters);
  const categories = nameMap(reference.categories);
  return (
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
          <tr key={t.id} className={cn('hover:bg-surface-muted/60', !t.active && 'opacity-50')}>
            <Td>
              <p className="text-fg font-medium">{t.description}</p>
              <p className="text-fg-muted text-xs">{KIND_LABEL[t.kind]}</p>
            </Td>
            <Td className="text-fg-muted whitespace-nowrap">
              {centers.get(t.costCenterId)} · {categories.get(t.categoryId)}
            </Td>
            <Td className="tabular text-fg-muted">{t.dayOfMonth ?? 1}</Td>
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
  );
}

export function RecurringTable({ entity, templates, reference }: RecurringTableProps) {
  return (
    <Card
      title={entity.name}
      subtitle={`${templates.length} modelos`}
      icon={GROUP_ICON[entity.group]}
      accent={entity.color}
    >
      <div className="hidden xl:block">
        <TemplatesTable entity={entity} templates={templates} reference={reference} />
      </div>
      <div className="xl:hidden">
        <RecurringList templates={templates} reference={reference} currency={entity.currency} />
      </div>
    </Card>
  );
}
