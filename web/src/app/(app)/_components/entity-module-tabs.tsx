'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/ui/cn';
import { Icon } from '@/ui/icon';
import { entityHref, modulesOf } from '../_lib/entity-modules';

/** Sub-menus da entidade em ecrãs pequenos (no desktop estão na barra lateral). */
export function EntityModuleTabs({ entityId }: { readonly entityId: string }) {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:hidden">
      {modulesOf(entityId).map((m) => {
        const href = entityHref(entityId, m.slug);
        const active = pathname === href;
        return (
          <Link
            key={m.slug}
            href={href}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium',
              active
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                : 'text-slate-500 hover:bg-white/60',
            )}
          >
            <Icon name={m.icon} className="text-xs" />
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}
