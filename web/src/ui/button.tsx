import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';
import { Icon } from './icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-700 shadow-sm',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
};

interface StyleProps {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly icon?: string;
  readonly className?: string;
  readonly children?: ReactNode;
}

const classes = ({ variant = 'secondary', size = 'md', className }: StyleProps) =>
  cn(
    'inline-flex shrink-0 items-center justify-center rounded-xl font-medium whitespace-nowrap transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

export function Button({
  variant,
  size,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variant, size, className })} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

export function ButtonLink({ href, ...props }: StyleProps & { readonly href: string }) {
  return (
    <Link href={href} className={classes(props)}>
      {props.icon && <Icon name={props.icon} />}
      {props.children}
    </Link>
  );
}
