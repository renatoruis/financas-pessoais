import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from './cn';

const STICKY_FIRST =
  '[&_tr>*:first-child]:sticky [&_tr>*:first-child]:left-0 [&_tr>*:first-child]:z-10 [&_tr>*:first-child]:bg-surface';

interface TableProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Fixa a primeira coluna ao rolar na horizontal (tabelas largas no telemóvel). */
  readonly stickyFirst?: boolean;
}

export function Table({ children, className, stickyFirst }: TableProps) {
  return (
    <div className={cn('-mx-5 overflow-x-auto', className)}>
      <table className={cn('w-full text-sm', stickyFirst && STICKY_FIRST)}>{children}</table>
    </div>
  );
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'border-line-soft text-fg-muted border-b px-5 py-2 text-left text-xs font-medium tracking-wide whitespace-nowrap uppercase',
        className,
      )}
      {...rest}
    />
  );
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('border-line-soft border-b px-5 py-3 align-middle', className)} {...rest} />
  );
}
