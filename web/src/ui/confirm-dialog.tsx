'use client';

import type { ReactNode } from 'react';
import { Button } from './button';
import { Icon } from './icon';
import { Modal } from './modal';

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly children: ReactNode;
  readonly confirmLabel: string;
  readonly pending?: boolean;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

/** Confirmação de uma ação destrutiva (ex.: apagar). */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  pending,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Voltar
          </Button>
          <Button variant="danger" icon="trash" disabled={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
          <Icon name="triangle-exclamation" />
        </span>
        <div className="text-sm text-slate-600">{children}</div>
      </div>
    </Modal>
  );
}
