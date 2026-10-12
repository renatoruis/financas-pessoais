'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Entity } from '@/domain/reference/reference-data';
import { cn } from '@/ui/cn';
import { Icon } from '@/ui/icon';
import { logoutAction } from '../../_auth/actions';
import { entityHref, modulesOf } from '../_lib/entity-modules';

interface NavLinkProps {
  readonly href: string;
  readonly active: boolean;
  readonly color?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

function NavLink({ href, active, color, className, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      style={{ color: active ? color : undefined }}
      className={cn(
        'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-white shadow-sm ring-1 ring-slate-900/5'
          : 'text-slate-500 hover:bg-white/60 hover:text-slate-800',
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Entidade com os seus sub-menus visíveis só quando está aberta (e só no desktop). */
function EntityNav({ entity, pathname }: { readonly entity: Entity; readonly pathname: string }) {
  const base = entityHref(entity.id);
  const open = pathname === base || pathname.startsWith(`${base}/`);
  return (
    <div className="shrink-0 md:space-y-0.5">
      <NavLink href={base} active={pathname === base} color={entity.color}>
        <span className="size-2.5 rounded-full" style={{ backgroundColor: entity.color }} />
        <span className={cn(open && 'font-semibold text-slate-900')}>{entity.name}</span>
      </NavLink>
      {open && (
        <div className="ml-4 hidden space-y-0.5 border-l border-slate-200 pl-2 md:block">
          {modulesOf(entity.id)
            .filter((m) => m.slug)
            .map((m) => {
              const href = entityHref(entity.id, m.slug);
              return (
                <NavLink
                  key={m.slug}
                  href={href}
                  active={pathname === href}
                  color={entity.color}
                  className="py-1.5"
                >
                  <Icon name={m.icon} className="w-4 text-center text-xs" />
                  {m.label}
                </NavLink>
              );
            })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ entities }: { readonly entities: readonly Entity[] }) {
  const pathname = usePathname();
  return (
    <aside className="bg-canvas/90 sticky top-0 z-30 border-b border-slate-200/70 backdrop-blur md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto md:border-r md:border-b-0">
      <div className="flex items-center gap-3 px-5 py-4 md:py-6">
        <span className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white">
          <Icon name="wallet" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Finanças</p>
          <p className="text-xs text-slate-500">Pessoal e empresas</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-6">
        <NavLink href="/" active={pathname === '/'} color="#0f172a">
          <Icon name="gauge-high" className="w-4 text-center" />
          Painel
        </NavLink>
        <p className="mt-4 mb-1 hidden px-3 text-xs font-medium tracking-wide text-slate-400 uppercase md:block">
          Entidades
        </p>
        {entities.map((entity) => (
          <EntityNav key={entity.id} entity={entity} pathname={pathname} />
        ))}
        <form action={logoutAction} className="shrink-0 md:mt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-800"
          >
            <Icon name="right-from-bracket" className="w-4 text-center" />
            Sair
          </button>
        </form>
      </nav>
    </aside>
  );
}
