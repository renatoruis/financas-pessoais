import Link from 'next/link';
import { cn } from './cn';

interface SegmentedLink {
  readonly href: string;
  readonly label: string;
  readonly active: boolean;
}

/** Como `Segmented`, mas cada opção é um link (ex.: abas que mudam a query string). */
export function SegmentedLinks({ links }: { readonly links: readonly SegmentedLink[] }) {
  return (
    <nav className="no-scrollbar bg-surface-strong inline-flex max-w-full overflow-x-auto rounded-xl p-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={l.active ? 'page' : undefined}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition',
            l.active ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
