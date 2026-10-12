'use client';

import { useState } from 'react';
import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { Entry } from '@/domain/entries/entry';
import type { IsoDate } from '@/domain/shared/iso-date';
import { Button } from '@/ui/button';
import { ConfirmDialog } from '@/ui/confirm-dialog';
import { Drawer } from '@/ui/modal';
import { cancelEntryAction, deleteEntryAction, reopenEntryAction } from '../actions';
import { EntryForm } from './entry-form';
import { SettleModal } from './settle-modal';
import { useAction } from './use-action';

interface EntryActionsProps {
  readonly entry: Entry;
  readonly reference: ReferenceData;
  readonly today: IsoDate;
  /** Só o botão Liquidar (listas compactas do painel). */
  readonly compact?: boolean;
}

type Dialog = 'settle' | 'edit' | 'duplicate' | 'delete';

export function EntryActions({ entry, reference, today, compact }: EntryActionsProps) {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const { pending, run } = useAction();
  const close = () => setDialog(null);
  const pendingEntry = entry.status === 'pending';
  const ghost = (icon: string, title: string, onClick: () => void) => (
    <Button
      size="sm"
      variant="ghost"
      icon={icon}
      title={title}
      disabled={pending}
      onClick={onClick}
    />
  );

  return (
    <div className="flex items-center justify-end gap-1">
      {pendingEntry && (
        <Button size="sm" variant="success" icon="check" onClick={() => setDialog('settle')}>
          {compact ? undefined : 'Liquidar'}
        </Button>
      )}
      {!compact && (
        <>
          {ghost('pen', 'Editar', () => setDialog('edit'))}
          {ghost('copy', 'Duplicar', () => setDialog('duplicate'))}
          {pendingEntry
            ? ghost('ban', 'Cancelar', () => run(() => cancelEntryAction(entry.id)))
            : ghost('rotate-left', 'Voltar a pendente', () =>
                run(() => reopenEntryAction(entry.id)),
              )}
          {ghost('trash', 'Apagar', () => setDialog('delete'))}
        </>
      )}
      <SettleModal entry={entry} today={today} open={dialog === 'settle'} onClose={close} />
      <Drawer open={dialog === 'edit'} onClose={close} title="Editar lançamento">
        <EntryForm reference={reference} today={today} entry={entry} onDone={close} />
      </Drawer>
      <Drawer open={dialog === 'duplicate'} onClose={close} title="Novo lançamento (cópia)">
        <EntryForm reference={reference} today={today} template={entry} onDone={close} />
      </Drawer>
      <ConfirmDialog
        open={dialog === 'delete'}
        title="Apagar lançamento"
        confirmLabel="Apagar"
        pending={pending}
        onClose={close}
        onConfirm={() => run(() => deleteEntryAction(entry.id), close)}
      >
        <p>
          Apagar <strong>{entry.description}</strong>? Não dá para desfazer.
        </p>
      </ConfirmDialog>
    </div>
  );
}
