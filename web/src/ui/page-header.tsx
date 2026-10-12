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
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        {icon && (
          <span className="bg-surface text-fg-muted ring-fg/5 grid size-10 shrink-0 place-items-center rounded-2xl text-lg shadow-sm ring-1 sm:size-12 sm:text-xl">
            <Icon name={icon} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-fg text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <p className="text-fg-muted mt-0.5 text-sm">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
          {actions}
        </div>
      )}
    </header>
  );
}
