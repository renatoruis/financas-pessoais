import type { ReactNode } from 'react';
import { cn } from './cn';
import { Icon } from './icon';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-strong text-fg-muted',
  success: 'bg-positive-soft text-positive',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-negative-soft text-negative',
  info: 'bg-info-soft text-info',
};

export function Badge({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: Tone;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONES[tone],
      )}
    >
      {icon && <Icon name={icon} className="text-[0.7rem]" />}
      {children}
    </span>
  );
}
