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
  /** `drawer` abre à direita a toda a altura. */
  readonly variant?: 'center' | 'drawer';
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, children, footer, variant = 'center' }: ModalProps) {
  useEscape(open, onClose);
  if (!open) return null;
  const drawer = variant === 'drawer';
  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal>
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative flex max-h-full flex-col bg-white shadow-2xl',
          drawer
            ? 'ml-auto h-full w-full max-w-lg rounded-l-2xl'
            : 'm-auto w-full max-w-md rounded-2xl',
        )}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <Icon name="xmark" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
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
