import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { Entry } from '@/domain/entries/entry';
import { signedCents } from '@/domain/entries/entry-lifecycle';
import { isOverdue } from '@/domain/entries/entry-schedule';
import type { IsoDate } from '@/domain/shared/iso-date';
import { money } from '@/domain/shared/money';
import { Badge } from '@/ui/badge';
import { cn } from '@/ui/cn';
import { formatDate } from '@/ui/format';
import { Icon } from '@/ui/icon';
import { MoneyText } from '@/ui/money-text';
import { Table, Td, Th } from '@/ui/table';
import { EntryActions } from '../../../_components/entry-actions';
import { nameMap, STATUS_LABEL, STATUS_TONE } from '../../../_lib/labels';

interface EntryTableProps {
  readonly entries: readonly Entry[];
  readonly reference: ReferenceData;
  readonly today: IsoDate;
}

function DescriptionCell({ entry }: { readonly entry: Entry }) {
  return (
    <div className="min-w-48">
      <p
        className={cn('font-medium text-slate-900', entry.status === 'cancelled' && 'line-through')}
      >
        {entry.description}
        {entry.linkGroup && <Icon name="link" className="ml-2 text-xs text-sky-500" />}
        {entry.recurringId && <Icon name="repeat" className="ml-2 text-xs text-slate-400" />}
      </p>
      {entry.notes && <p className="max-w-xs truncate text-xs text-slate-500">{entry.notes}</p>}
    </div>
  );
}

/** Lançamentos de uma entidade (a `reference` já vem filtrada por ela). */
export function EntryTable({ entries, reference, today }: EntryTableProps) {
  const centers = nameMap(reference.costCenters);
  const categories = nameMap(reference.categories);
  return (
    <Table>
      <thead>
        <tr>
          <Th>Vencimento</Th>
          <Th>Descrição</Th>
          <Th>Centro · Categoria</Th>
          <Th className="text-right">Valor</Th>
          <Th>Estado</Th>
          <Th />
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => {
          const overdue = isOverdue(e, today);
          return (
            <tr key={e.id} className="hover:bg-slate-50/60">
              <Td className={cn('whitespace-nowrap', overdue && 'font-semibold text-rose-600')}>
                {formatDate(e.dueDate)}
              </Td>
              <Td>
                <DescriptionCell entry={e} />
              </Td>
              <Td className="whitespace-nowrap text-slate-600">
                {centers.get(e.costCenterId)} · {categories.get(e.categoryId)}
              </Td>
              <Td className="text-right font-medium">
                <MoneyText value={e.amount && money(signedCents(e), e.currency)} signed />
              </Td>
              <Td>
                <Badge tone={overdue ? 'danger' : STATUS_TONE[e.status]}>
                  {overdue ? 'Em atraso' : STATUS_LABEL[e.status]}
                </Badge>
                {e.settledOn && (
                  <p className="mt-0.5 text-xs text-slate-400">{formatDate(e.settledOn)}</p>
                )}
              </Td>
              <Td>
                <EntryActions entry={e} reference={reference} today={today} />
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
