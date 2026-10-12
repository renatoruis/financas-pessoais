'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from './cn';
import { Icon } from './icon';

type ToastKind = 'success' | 'error';

interface ToastItem {
  readonly id: number;
  readonly kind: ToastKind;
  readonly message: string;
}

type Notify = (kind: ToastKind, message: string) => void;

const ToastContext = createContext<Notify>(() => undefined);
const TOAST_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const notify = useCallback<Notify>((kind, message) => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { id, kind, message }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), TOAST_MS);
  }, []);
  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="fixed right-4 bottom-4 z-[60] flex w-80 flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'flex items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-lg ring-1',
              t.kind === 'success'
                ? 'bg-white text-slate-800 ring-emerald-200'
                : 'bg-rose-50 text-rose-800 ring-rose-200',
            )}
          >
            <Icon
              name={t.kind === 'success' ? 'circle-check' : 'circle-exclamation'}
              className={cn('mt-0.5', t.kind === 'success' ? 'text-emerald-600' : 'text-rose-600')}
            />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): Notify => useContext(ToastContext);
