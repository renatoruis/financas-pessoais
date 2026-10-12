'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Entity } from '@/domain/reference/reference-data';
import { cn } from '@/ui/cn';
import { Icon } from '@/ui/icon';
import { Modal } from '@/ui/modal';
import type { Theme } from '@/ui/theme';
import { ThemeToggle } from '@/ui/theme-toggle';
import { logoutAction } from '../../_auth/actions';
import { entityHref } from '../_lib/entity-modules';
import { GROUP_ICON } from '../_lib/labels';
import { AppMark } from './app-mark';

export type MobileSheet = 'entities' | 'more';

interface MobileMenuProps {
  readonly sheet: MobileSheet | null;
  readonly onClose: () => void;
  readonly entities: readonly Entity[];
  readonly theme: Theme;
}

function EntityLinks({ entities, onClose }: Pick<MobileMenuProps, 'entities' | 'onClose'>) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {entities.map((entity) => {
        const href = entityHref(entity.id);
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={entity.id}>
            <Link
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 font-medium',
                active ? 'bg-surface-strong text-fg' : 'text-fg-muted active:bg-surface-muted',
              )}
            >
              <span className="size-3 rounded-full" style={{ backgroundColor: entity.color }} />
              <span className="flex-1">{entity.name}</span>
              <span className="text-fg-subtle text-xs">{entity.currency}</span>
              <Icon name={GROUP_ICON[entity.group]} className="text-fg-subtle text-sm" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Sheets da barra do telemóvel: escolher a entidade, ou tema e sair. */
export function MobileMenu({ sheet, onClose, entities, theme }: MobileMenuProps) {
  return (
    <Modal
      open={sheet !== null}
      onClose={onClose}
      title={sheet === 'entities' ? 'Entidades' : 'Mais'}
    >
      {sheet === 'entities' ? (
        <EntityLinks entities={entities} onClose={onClose} />
      ) : (
        <div className="space-y-5">
          <AppMark />
          <div className="space-y-2">
            <p className="text-fg-muted text-xs font-medium">Tema</p>
            <ThemeToggle initial={theme} />
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-negative bg-negative-soft flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium"
            >
              <Icon name="right-from-bracket" />
              Sair
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
}
