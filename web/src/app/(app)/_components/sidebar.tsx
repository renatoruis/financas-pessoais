'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Entity } from '@/domain/reference/reference-data';
import { cn } from '@/ui/cn';
import { Icon } from '@/ui/icon';
import type { Theme } from '@/ui/theme';
import { ThemeToggle } from '@/ui/theme-toggle';
import { logoutAction } from '../../_auth/actions';
import { entityHref, modulesOf } from '../_lib/entity-modules';
import { AppMark } from './app-mark';

interface NavLinkProps {
  readonly href: string;
  readonly active: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}

function NavLink({ href, active, className, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-surface text-fg ring-fg/5 shadow-sm ring-1'
          : 'text-fg-muted hover:bg-surface/60 hover:text-fg',
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Entidade com os seus sub-menus visíveis só quando está aberta. */
function EntityNav({ entity, pathname }: { readonly entity: Entity; readonly pathname: string }) {
  const base = entityHref(entity.id);
  const open = pathname === base || pathname.startsWith(`${base}/`);
  return (
    <div className="space-y-0.5">
      <NavLink href={base} active={pathname === base}>
        <span className="size-2.5 rounded-full" style={{ backgroundColor: entity.color }} />
        <span className={cn(open && 'text-fg font-semibold')}>{entity.name}</span>
      </NavLink>
      {open && (
        <div className="border-line ml-4 space-y-0.5 border-l pl-2">
          {modulesOf(entity.id)
            .filter((m) => m.slug)
            .map((m) => {
              const href = entityHref(entity.id, m.slug);
              return (
                <NavLink key={m.slug} href={href} active={pathname === href} className="py-1.5">
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

interface SidebarProps {
  readonly entities: readonly Entity[];
  readonly theme: Theme;
}

/** Navegação do desktop; no telemóvel é a barra de baixo (`MobileNav`). */
export function Sidebar({ entities, theme }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="border-line/70 sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r md:flex">
      <AppMark className="px-5 py-6" />
      <nav className="flex-1 space-y-1 px-3 pb-6">
        <NavLink href="/" active={pathname === '/'}>
          <Icon name="gauge-high" className="w-4 text-center" />
          Painel
        </NavLink>
        <NavLink href="/visao-geral" active={pathname === '/visao-geral'}>
          <Icon name="chart-pie" className="w-4 text-center" />
          Visão geral
        </NavLink>
        <p className="text-fg-subtle mt-4 mb-1 px-3 text-xs font-medium tracking-wide uppercase">
          Entidades
        </p>
        {entities.map((entity) => (
          <EntityNav key={entity.id} entity={entity} pathname={pathname} />
        ))}
      </nav>
      <div className="space-y-2 px-3 pb-6">
        <ThemeToggle initial={theme} />
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-fg-muted hover:bg-surface/60 hover:text-fg flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
          >
            <Icon name="right-from-bracket" className="w-4 text-center" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
