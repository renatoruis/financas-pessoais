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
        'relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5',
        className,
      )}
    >
      {accent && <span className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" />}
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-[var(--accent,var(--color-slate-600))]">
                <Icon name={icon} />
              </span>
            )}
            <div>
              <h2 className="font-semibold text-slate-900">{title}</h2>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
