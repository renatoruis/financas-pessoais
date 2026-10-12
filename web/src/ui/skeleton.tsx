import { cn } from './cn';

/** Bloco a pulsar no lugar de conteúdo que ainda está a carregar. */
export function Skeleton({ className }: { readonly className?: string }) {
  return (
    <div aria-hidden className={cn('bg-surface-strong animate-pulse rounded-xl', className)} />
  );
}

/** Cabeçalho de página (ícone, título, ações) enquanto carrega. */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8" aria-busy>
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="size-10 rounded-2xl sm:size-12" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <Skeleton className="h-11 w-full rounded-2xl sm:w-64" />
    </div>
  );
}

/** Cartão com linhas a carregar. */
export function CardSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div
      className={cn('bg-surface ring-fg/5 space-y-4 rounded-2xl p-5 shadow-sm ring-1', className)}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-9" />
        <Skeleton className="h-5 w-32" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
