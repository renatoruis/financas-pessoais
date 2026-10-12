import type { ReactNode } from 'react';
import { Icon } from './icon';

interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: ReactNode;
  readonly icon?: string;
  readonly actions?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {icon && (
          <span className="grid size-12 place-items-center rounded-2xl bg-white text-xl text-slate-700 shadow-sm ring-1 ring-slate-900/5">
            <Icon name={icon} />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
