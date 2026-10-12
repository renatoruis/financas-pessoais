import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { Entry } from '@/domain/entries/entry';
import { signedCents } from '@/domain/entries/entry-lifecycle';
import { isOverdue } from '@/domain/entries/entry-schedule';
import type { IsoDate } from '@/domain/shared/iso-date';
import { money } from '@/domain/shared/money';
import { Badge } from '@/ui/badge';
import { cn } from '@/ui/cn';
import { formatShortDate } from '@/ui/format';
import { Icon } from '@/ui/icon';
import { MoneyText } from '@/ui/money-text';
import { EntryActions } from '../../../_components/entry-actions';
import { nameMap, STATUS_LABEL, STATUS_TONE } from '../../../_lib/labels';

interface EntryListProps {
  readonly entries: readonly Entry[];
  readonly reference: ReferenceData;
  readonly today: IsoDate;
}

interface EntryRowProps {
  readonly entry: Entry;
  readonly reference: ReferenceData;
  readonly today: IsoDate;
  readonly where: string;
}

function EntryRow({ entry, reference, today, where }: EntryRowProps) {
  const overdue = isOverdue(entry, today);
  const cancelled = entry.status === 'cancelled';
  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn('truncate font-medium text-slate-900', cancelled && 'line-through')}>
            {entry.description}
            {entry.linkGroup && <Icon name="link" className="ml-2 text-xs text-sky-500" />}
            {entry.recurringId && <Icon name="repeat" className="ml-2 text-xs text-slate-400" />}
          </p>
          <p className="truncate text-xs text-slate-500">{where}</p>
        </div>
        <MoneyText
          value={entry.amount && money(signedCents(entry), entry.currency)}
          signed
          className="shrink-0 font-medium"
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={cn('text-xs', overdue ? 'font-semibold text-rose-600' : 'text-slate-500')}>
          {formatShortDate(entry.dueDate)}
        </span>
        <Badge tone={overdue ? 'danger' : STATUS_TONE[entry.status]}>
          {overdue ? 'Em atraso' : STATUS_LABEL[entry.status]}
        </Badge>
        {entry.settledOn && (
          <span className="text-xs text-slate-400">{`em ${formatShortDate(entry.settledOn)}`}</span>
        )}
        <div className="ml-auto">
          <EntryActions entry={entry} reference={reference} today={today} />
        </div>
      </div>
    </li>
  );
}

/** Lançamentos em lista, para ecrãs onde a tabela não cabe. */
export function EntryList({ entries, reference, today }: EntryListProps) {
  const centers = nameMap(reference.costCenters);
  const categories = nameMap(reference.categories);
  return (
    <ul className="-my-3 divide-y divide-slate-100">
      {entries.map((e) => (
        <EntryRow
          key={e.id}
          entry={e}
          reference={reference}
          today={today}
          where={`${centers.get(e.costCenterId) ?? ''} · ${categories.get(e.categoryId) ?? ''}`}
        />
      ))}
    </ul>
  );
}
