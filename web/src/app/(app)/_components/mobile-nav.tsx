'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { IsoDate } from '@/domain/shared/iso-date';
import { cn } from '@/ui/cn';
import { Icon } from '@/ui/icon';
import type { Theme } from '@/ui/theme';
import { MobileMenu, type MobileSheet } from './mobile-menu';
import { NewEntryButton } from './new-entry-button';

const ITEM =
  'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors';

function NavItem(props: { href: string; icon: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={props.href}
      className={cn(ITEM, props.active ? 'text-fg' : 'text-fg-subtle')}
      aria-current={props.active ? 'page' : undefined}
    >
      <Icon name={props.icon} className="text-lg" />
      {props.children}
    </Link>
  );
}

interface MobileNavProps {
  readonly reference: ReferenceData;
  readonly today: IsoDate;
  readonly theme: Theme;
}

/** Barra de navegação fixa em baixo, só no telemóvel. */
export function MobileNav({ reference, today, theme }: MobileNavProps) {
  const pathname = usePathname();
  const [sheet, setSheet] = useState<MobileSheet | null>(null);
  const inEntity = pathname !== '/' && pathname !== '/visao-geral';
  return (
    <>
      <nav className="bg-surface/90 border-line fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-end px-2">
          <NavItem href="/" icon="gauge-high" active={pathname === '/'}>
            Painel
          </NavItem>
          <NavItem href="/visao-geral" icon="chart-pie" active={pathname === '/visao-geral'}>
            Visão geral
          </NavItem>
          <div className="flex flex-1 justify-center pb-2">
            <NewEntryButton reference={reference} today={today} variant="fab" />
          </div>
          <button
            type="button"
            onClick={() => setSheet('entities')}
            className={cn(ITEM, inEntity ? 'text-fg' : 'text-fg-subtle')}
          >
            <Icon name="building" className="text-lg" />
            Entidades
          </button>
          <button
            type="button"
            onClick={() => setSheet('more')}
            className={cn(ITEM, 'text-fg-subtle')}
          >
            <Icon name="ellipsis" className="text-lg" />
            Mais
          </button>
        </div>
      </nav>
      <MobileMenu
        sheet={sheet}
        onClose={() => setSheet(null)}
        entities={reference.entities}
        theme={theme}
      />
    </>
  );
}
