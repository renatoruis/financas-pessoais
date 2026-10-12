'use client';

import { useState } from 'react';
import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { IsoDate } from '@/domain/shared/iso-date';
import { Button } from '@/ui/button';
import { Icon } from '@/ui/icon';
import { Drawer } from '@/ui/modal';
import { EntryForm } from './entry-form';

interface NewEntryButtonProps {
  readonly reference: ReferenceData;
  readonly today: IsoDate;
  readonly label?: string;
  /** `fab`: botão redondo da barra de navegação do telemóvel. */
  readonly variant?: 'button' | 'fab';
}

export function NewEntryButton({
  reference,
  today,
  label,
  variant = 'button',
}: NewEntryButtonProps) {
  const [open, setOpen] = useState(false);
  const title = label ?? 'Novo lançamento';
  return (
    <>
      {variant === 'fab' ? (
        <button
          type="button"
          aria-label={title}
          onClick={() => setOpen(true)}
          className="bg-primary text-on-primary ring-canvas -mt-7 grid size-14 place-items-center rounded-full text-lg shadow-lg ring-4 transition active:scale-95"
        >
          <Icon name="plus" />
        </button>
      ) : (
        <Button variant="primary" icon="plus" onClick={() => setOpen(true)}>
          {title}
        </Button>
      )}
      <Drawer open={open} onClose={() => setOpen(false)} title="Novo lançamento">
        <EntryForm reference={reference} today={today} onDone={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
