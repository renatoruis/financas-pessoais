import type { ReactNode } from 'react';
import { Icon } from './icon';

export function EmptyState({
  icon = 'inbox',
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-line flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center">
      <span className="bg-surface-strong text-fg-muted grid size-11 place-items-center rounded-2xl">
        <Icon name={icon} />
      </span>
      <p className="text-fg-muted mt-3 font-medium">{title}</p>
      {children && <div className="text-fg-muted mt-1 text-sm">{children}</div>}
    </div>
  );
}
