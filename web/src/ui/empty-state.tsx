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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon name={icon} />
      </span>
      <p className="mt-3 font-medium text-slate-700">{title}</p>
      {children && <div className="mt-1 text-sm text-slate-500">{children}</div>}
    </div>
  );
}
