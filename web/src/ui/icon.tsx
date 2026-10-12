import { cn } from './cn';

/** Ícone Font Awesome Free (estilo solid). `name` sem prefixo: "wallet", "house". */
export function Icon({ name, className }: { name: string; className?: string }) {
  return <i aria-hidden className={cn('fa-solid', `fa-${name}`, className)} />;
}
