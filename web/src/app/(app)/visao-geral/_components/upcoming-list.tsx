import type { Entry } from '@/domain/entries/entry';
import { signedCents } from '@/domain/entries/entry-lifecycle';
import { isOverdue } from '@/domain/entries/entry-schedule';
import type { Entity } from '@/domain/reference/reference-data';
import type { UpcomingCashflow } from '@/domain/reports/overview';
import type { IsoDate } from '@/domain/shared/iso-date';
import { money } from '@/domain/shared/money';
import { Badge } from '@/ui/badge';
import { Card } from '@/ui/card';
import { cn } from '@/ui/cn';
import { EmptyState } from '@/ui/empty-state';
import { formatMoney, formatShortDate } from '@/ui/format';
import { MoneyText } from '@/ui/money-text';

interface UpcomingListProps {
  readonly upcoming: UpcomingCashflow;
  readonly entities: readonly Entity[];
  readonly today: IsoDate;
}

function UpcomingRow({ entry, entity, today }: { entry: Entry; entity?: Entity; today: IsoDate }) {
  const overdue = isOverdue(entry, today);
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="h-8 w-1 shrink-0 rounded-full" style={{ backgroundColor: entity?.color }} />
      <div className="min-w-0 flex-1">
        <p className="text-fg truncate text-sm font-medium">{entry.description}</p>
        <p className="text-fg-muted text-xs">{entity?.name}</p>
      </div>
      <div className="text-right text-sm">
        <MoneyText value={entry.amount && money(signedCents(entry), entry.currency)} signed />
        <p className={cn('text-xs', overdue ? 'text-negative font-semibold' : 'text-fg-muted')}>
          {formatShortDate(entry.dueDate)}
          {overdue && ' · em atraso'}
        </p>
      </div>
    </li>
  );
}

/** Agenda: pendentes em atraso e os que vencem nos próximos 30 dias. */
export function UpcomingList({ upcoming, entities, today }: UpcomingListProps) {
  const { entries, incoming, outgoing, overdueCount } = upcoming;
  return (
    <Card
      title="Próximos 30 dias"
      icon="calendar-days"
      subtitle="Pendentes por vencimento, incluindo atrasos"
      actions={
        entries.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {overdueCount > 0 && <Badge tone="danger">{`${overdueCount} em atraso`}</Badge>}
            <Badge tone="success">{`entra ${formatMoney(incoming)}`}</Badge>
            <Badge tone="danger">{`sai ${formatMoney(outgoing)}`}</Badge>
          </div>
        )
      }
    >
      {entries.length === 0 ? (
        <EmptyState icon="mug-hot" title="Agenda livre">
          Nada a pagar nem a receber nos próximos 30 dias.
        </EmptyState>
      ) : (
        <ul className="divide-line-soft divide-y">
          {entries.map((e) => (
            <UpcomingRow
              key={e.id}
              entry={e}
              entity={entities.find((x) => x.id === e.entityId)}
              today={today}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
