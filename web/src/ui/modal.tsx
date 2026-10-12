'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from './cn';
import { Icon } from './icon';

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  /** `drawer` abre à direita a toda a altura (no telemóvel sobe de baixo, como os outros). */
  readonly variant?: 'center' | 'drawer';
}

/** Fecha com Escape e impede o fundo de rolar enquanto está aberto. */
function useModalBehaviour(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

const PANEL = {
  center: 'sm:m-auto sm:max-w-md sm:rounded-2xl',
  drawer: 'sm:ml-auto sm:h-full sm:max-h-full sm:max-w-lg sm:rounded-none sm:rounded-l-2xl',
};

export function Modal({ open, onClose, title, children, footer, variant = 'center' }: ModalProps) {
  useModalBehaviour(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch" role="dialog" aria-modal>
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={cn(
          'bg-surface relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl shadow-2xl',
          PANEL[variant],
        )}
      >
        <span className="bg-line mx-auto mt-2 h-1 w-10 shrink-0 rounded-full sm:hidden" />
        <header className="border-line-soft flex items-center justify-between border-b px-5 py-3 sm:px-6 sm:py-4">
          <h2 className="text-fg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-fg-muted hover:bg-surface-strong grid size-10 place-items-center rounded-lg sm:size-8"
            aria-label="Fechar"
          >
            <Icon name="xmark" />
          </button>
        </header>
        <div
          className={cn(
            'flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6',
            !footer && 'pb-[max(1.25rem,env(safe-area-inset-bottom))]',
          )}
        >
          {children}
        </div>
        {footer && (
          <footer className="border-line-soft flex justify-end gap-2 border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/** Painel lateral para formulários longos. */
export function Drawer(props: Omit<ModalProps, 'variant'>) {
  return <Modal {...props} variant="drawer" />;
}
