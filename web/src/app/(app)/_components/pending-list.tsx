import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { Entry } from '@/domain/entries/entry';
import { signedCents } from '@/domain/entries/entry-lifecycle';
import { byDueDate, isDueSoon, isOverdue } from '@/domain/entries/entry-schedule';
import type { IsoDate } from '@/domain/shared/iso-date';
import { money } from '@/domain/shared/money';
import { Badge } from '@/ui/badge';
import { Card } from '@/ui/card';
import { cn } from '@/ui/cn';
import { EmptyState } from '@/ui/empty-state';
import { formatShortDate } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';
import { EntryActions } from './entry-actions';

interface PendingListProps {
  readonly entries: readonly Entry[];
  readonly reference: ReferenceData;
  readonly today: IsoDate;
}

function PendingRow({
  entry,
  reference,
  today,
}: Omit<PendingListProps, 'entries'> & { entry: Entry }) {
  const entity = reference.entities.find((e) => e.id === entry.entityId);
  const overdue = isOverdue(entry, today);
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: entity?.color }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{entry.description}</p>
        <p className="text-xs text-slate-500">{entity?.name}</p>
      </div>
      <div className="text-right">
        <MoneyText value={entry.amount && money(signedCents(entry), entry.currency)} signed />
        <p className={cn('text-xs', overdue ? 'font-semibold text-rose-600' : 'text-slate-500')}>
          {formatShortDate(entry.dueDate)}
          {overdue && ' · em atraso'}
        </p>
      </div>
      <EntryActions entry={entry} reference={reference} today={today} compact />
    </li>
  );
}

export function PendingList({ entries, reference, today }: PendingListProps) {
  const sorted = [...entries].sort(byDueDate);
  const overdue = sorted.filter((e) => isOverdue(e, today)).length;
  const soon = sorted.filter((e) => isDueSoon(e, today)).length;
  return (
    <Card
      title="Pendentes"
      icon="hourglass-half"
      subtitle="Do mês e em atraso, por vencimento"
      actions={
        <div className="flex gap-1.5">
          {overdue > 0 && <Badge tone="danger">{`${overdue} em atraso`}</Badge>}
          {soon > 0 && <Badge tone="warning">{`${soon} esta semana`}</Badge>}
        </div>
      }
    >
      {sorted.length === 0 ? (
        <EmptyState icon="mug-hot" title="Nada pendente">
          Tudo pago e recebido neste mês.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sorted.map((e) => (
            <PendingRow key={e.id} entry={e} reference={reference} today={today} />
          ))}
        </ul>
      )}
    </Card>
  );
}
