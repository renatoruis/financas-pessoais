import { cn } from '@/ui/cn';
import { Icon } from '@/ui/icon';

/** Logótipo e nome da app. */
export function AppMark({ className }: { readonly className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="bg-primary text-on-primary grid size-9 place-items-center rounded-xl">
        <Icon name="wallet" />
      </span>
      <div>
        <p className="text-fg text-sm font-semibold">Finanças</p>
        <p className="text-fg-muted text-xs">Pessoal e empresas</p>
      </div>
    </div>
  );
}
