import type { ReactNode } from 'react';
import { cn } from './cn';

interface StatProps {
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly hint?: ReactNode;
  readonly size?: 'md' | 'lg';
  readonly className?: string;
}

export function Stat({ label, value, hint, size = 'md', className }: StatProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-fg-muted text-xs font-medium tracking-wide uppercase">{label}</p>
      <p
        className={cn(
          'text-fg mt-1 truncate font-semibold',
          size === 'lg' ? 'text-2xl tracking-tight xl:text-3xl' : 'text-base',
        )}
      >
        {value}
      </p>
      {hint && <p className="text-fg-muted mt-0.5 text-xs">{hint}</p>}
    </div>
  );
}
