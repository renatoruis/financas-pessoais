import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';
import { Icon } from './icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary/85 shadow-sm',
  secondary: 'bg-surface text-fg-muted ring-1 ring-line hover:bg-surface-muted',
  ghost: 'text-fg-muted hover:bg-surface-strong',
  danger: 'bg-negative-soft text-negative hover:bg-negative/15',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm',
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-3 text-sm gap-1.5 sm:h-8',
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
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
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
