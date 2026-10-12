import { cn } from './cn';
import { Icon } from './icon';

interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly icon?: string;
}

interface SegmentedProps<T extends string> {
  readonly options: readonly SegmentedOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly size?: 'sm' | 'md';
}

const SIZES = {
  sm: 'gap-1.5 px-1.5 py-1 text-xs',
  md: 'gap-2 px-3 py-1.5 text-sm',
};

/** Escolha entre poucas opções (ex.: Receita / Despesa). Usar dentro de componentes cliente. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedProps<T>) {
  return (
    <div className="bg-surface-strong inline-flex w-full rounded-xl p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'flex flex-1 items-center justify-center rounded-lg font-medium transition',
            SIZES[size],
            value === o.value ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg',
          )}
        >
          {o.icon && <Icon name={o.icon} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
