import type { ReactNode } from 'react';
import { cn } from './cn';

/** Lista "rótulo … valor" com divisórias. */
export function ValueList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn('divide-line-soft divide-y text-sm', className)}>{children}</dl>;
}

interface ValueRowProps {
  readonly label: ReactNode;
  readonly children: ReactNode;
  /** Linha de total: texto mais forte. */
  readonly strong?: boolean;
}

export function ValueRow({ label, children, strong }: ValueRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className={strong ? 'text-fg font-medium' : 'text-fg-muted'}>{label}</dt>
      <dd className={cn('text-fg', strong ? 'font-semibold' : 'font-medium')}>{children}</dd>
    </div>
  );
}
