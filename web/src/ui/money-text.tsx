import type { Money } from '@/domain/shared/money';
import { cn } from './cn';
import { formatMoney } from './format';

interface MoneyTextProps {
  readonly value: Money | null;
  /** Mostra "+" nos positivos e pinta verde/vermelho. */
  readonly signed?: boolean;
  readonly className?: string;
}

export function MoneyText({ value, signed, className }: MoneyTextProps) {
  if (!value) return <span className={cn('text-slate-400', className)}>sem valor</span>;
  const tone =
    signed && (value.cents > 0 ? 'text-emerald-700' : value.cents < 0 ? 'text-rose-700' : '');
  return (
    <span className={cn('tabular whitespace-nowrap', tone, className)}>
      {formatMoney(value, { signed })}
    </span>
  );
}
