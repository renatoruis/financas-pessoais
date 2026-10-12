import Link from 'next/link';
import { cn } from './cn';
import { Icon } from './icon';

interface MonthPickerProps {
  readonly label: string;
  readonly prevHref: string;
  readonly nextHref: string;
  /** Link para o período atual; omitido quando já é o atual. */
  readonly todayHref?: string;
  readonly unit?: 'month' | 'year';
}

const TEXT = {
  month: { prev: 'Mês anterior', next: 'Mês seguinte', today: 'Ir para o mês atual' },
  year: { prev: 'Ano anterior', next: 'Ano seguinte', today: 'Ir para o ano atual' },
} as const;

const ARROW =
  'grid size-10 shrink-0 place-items-center rounded-xl sm:size-9 text-fg-muted hover:bg-surface-strong hover:text-fg';

/** Navegação anterior / seguinte por links (mês por omissão, ou ano). */
export function MonthPicker({
  label,
  prevHref,
  nextHref,
  todayHref,
  unit = 'month',
}: MonthPickerProps) {
  const text = TEXT[unit];
  return (
    <div className="bg-surface ring-fg/5 flex items-center gap-1 rounded-2xl p-1 shadow-sm ring-1">
      <Link href={prevHref} className={ARROW} aria-label={text.prev}>
        <Icon name="chevron-left" />
      </Link>
      <span
        className={cn(
          'text-fg flex-1 px-2 text-center text-sm font-medium',
          unit === 'month' ? 'min-w-36' : 'min-w-16',
        )}
      >
        {label}
      </span>
      <Link href={nextHref} className={ARROW} aria-label={text.next}>
        <Icon name="chevron-right" />
      </Link>
      {todayHref && (
        <Link
          href={todayHref}
          className={cn(ARROW, 'w-auto px-3 text-xs font-medium')}
          title={text.today}
        >
          Hoje
        </Link>
      )}
    </div>
  );
}
