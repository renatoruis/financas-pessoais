import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from './cn';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('-mx-5 overflow-x-auto', className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'border-b border-slate-100 px-5 py-2 text-left text-xs font-medium tracking-wide whitespace-nowrap text-slate-500 uppercase',
        className,
      )}
      {...rest}
    />
  );
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('border-b border-slate-50 px-5 py-3 align-middle', className)} {...rest} />
  );
}
