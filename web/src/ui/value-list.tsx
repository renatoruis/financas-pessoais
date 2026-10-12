import type { ReactNode } from 'react';
import { cn } from './cn';

/** Lista "rótulo … valor" com divisórias. */
export function ValueList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn('divide-y divide-slate-100 text-sm', className)}>{children}</dl>;
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
      <dt className={strong ? 'font-medium text-slate-800' : 'text-slate-500'}>{label}</dt>
      <dd className={cn('text-slate-900', strong ? 'font-semibold' : 'font-medium')}>{children}</dd>
    </div>
  );
}
