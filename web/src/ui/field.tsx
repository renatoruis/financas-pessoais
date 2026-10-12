import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn';

const CONTROL =
  'w-full rounded-xl border-0 bg-surface px-3 py-2 text-base text-fg sm:text-sm shadow-sm ring-1 ring-line ' +
  'placeholder:text-fg-subtle focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-surface-muted';

interface FieldProps {
  readonly label: string;
  readonly hint?: ReactNode;
  readonly error?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

export function Field({ label, hint, error, className, children }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="text-fg-muted mb-1 block text-xs font-medium">{label}</span>
      {children}
      {error ? (
        <span className="text-negative mt-1 block text-xs">{error}</span>
      ) : (
        hint && <span className="text-fg-muted mt-1 block text-xs">{hint}</span>
      )}
    </label>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, 'h-10', className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, 'h-10 pr-8', className)} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, 'min-h-20', className)} {...rest} />;
}
