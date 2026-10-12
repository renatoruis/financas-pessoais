'use client';

import { useState } from 'react';
import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { Entry } from '@/domain/entries/entry';
import type { IsoDate } from '@/domain/shared/iso-date';
import { Button } from '@/ui/button';
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

export function EntryActions({ entry, reference, today, compact }: EntryActionsProps) {
  const [dialog, setDialog] = useState<'settle' | 'edit' | null>(null);
  const { pending, run } = useAction();
  const close = () => setDialog(null);
  const pendingEntry = entry.status === 'pending';
  const confirmDelete = () =>
    window.confirm(`Apagar "${entry.description}"? Não dá para desfazer.`) &&
    run(() => deleteEntryAction(entry.id));

  return (
    <div className="flex items-center justify-end gap-1">
      {pendingEntry && (
        <Button size="sm" variant="success" icon="check" onClick={() => setDialog('settle')}>
          {compact ? undefined : 'Liquidar'}
        </Button>
      )}
      {!compact && (
        <>
          <Button
            size="sm"
            variant="ghost"
            icon="pen"
            title="Editar"
            onClick={() => setDialog('edit')}
          />
          {pendingEntry ? (
            <Button
              size="sm"
              variant="ghost"
              icon="ban"
              title="Cancelar"
              disabled={pending}
              onClick={() => run(() => cancelEntryAction(entry.id))}
            />
          ) : (
            <Button
              size="sm"
              variant="ghost"
              icon="rotate-left"
              title="Voltar a pendente"
              disabled={pending}
              onClick={() => run(() => reopenEntryAction(entry.id))}
            />
          )}
          <Button
            size="sm"
            variant="ghost"
            icon="trash"
            title="Apagar"
            disabled={pending}
            onClick={confirmDelete}
          />
        </>
      )}
      <SettleModal entry={entry} open={dialog === 'settle'} onClose={close} />
      <Drawer open={dialog === 'edit'} onClose={close} title="Editar lançamento">
        <EntryForm reference={reference} today={today} entry={entry} onDone={close} />
      </Drawer>
    </div>
  );
}
