import type { CSSProperties, ReactNode } from 'react';
import { cn } from './cn';
import { Icon } from './icon';

interface CardProps {
  readonly title?: ReactNode;
  readonly subtitle?: ReactNode;
  readonly icon?: string;
  /** Cor de destaque (barra e ícone). */
  readonly accent?: string;
  readonly actions?: ReactNode;
  readonly className?: string;
  readonly children?: ReactNode;
}

export function Card({ title, subtitle, icon, accent, actions, className, children }: CardProps) {
  const style = accent ? ({ '--accent': accent } as CSSProperties) : undefined;
  return (
    <section
      style={style}
      className={cn(
        'bg-surface ring-fg/5 relative overflow-hidden rounded-2xl p-5 shadow-sm ring-1',
        className,
      )}
    >
      {accent && <span className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" />}
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="bg-surface-strong text-accent grid size-9 place-items-center rounded-xl">
                <Icon name={icon} />
              </span>
            )}
            <div>
              <h2 className="text-fg font-semibold">{title}</h2>
              {subtitle && <p className="text-fg-muted text-sm">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
