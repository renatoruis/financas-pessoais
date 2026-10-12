'use client';

import { useState } from 'react';
import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { IsoDate } from '@/domain/shared/iso-date';
import { Button } from '@/ui/button';
import { Drawer } from '@/ui/modal';
import { EntryForm } from './entry-form';

interface NewEntryButtonProps {
  readonly reference: ReferenceData;
  readonly today: IsoDate;
  readonly label?: string;
}

export function NewEntryButton({ reference, today, label }: NewEntryButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" icon="plus" onClick={() => setOpen(true)}>
        {label ?? 'Novo lançamento'}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Novo lançamento">
        <EntryForm reference={reference} today={today} onDone={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
