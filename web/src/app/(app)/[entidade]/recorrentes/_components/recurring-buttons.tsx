'use client';

import { useState } from 'react';
import type { ReferenceData } from '@/application/shared/reference-lookup';
import type { RecurringTemplate } from '@/domain/recurring/recurring-template';
import type { YearMonth } from '@/domain/shared/iso-date';
import { Button } from '@/ui/button';
import { Drawer } from '@/ui/modal';
import { useAction } from '../../../_components/use-action';
import { deleteRecurringAction, generateRecurringAction } from '../actions';
import { RecurringForm } from './recurring-form';

export function NewRecurringButton({ reference }: { readonly reference: ReferenceData }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" icon="plus" onClick={() => setOpen(true)}>
        Novo recorrente
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Novo recorrente">
        <RecurringForm reference={reference} onDone={() => setOpen(false)} />
      </Drawer>
    </>
  );
}

interface RowActionsProps {
  readonly reference: ReferenceData;
  readonly template: RecurringTemplate;
}

export function RecurringRowActions({ reference, template }: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const { pending, run } = useAction();
  const remove = () =>
    window.confirm(`Apagar o recorrente "${template.description}"? Os lançamentos ficam.`) &&
    run(() => deleteRecurringAction(template.id));
  return (
    <div className="flex justify-end gap-1">
      <Button size="sm" variant="ghost" icon="pen" title="Editar" onClick={() => setOpen(true)} />
      <Button
        size="sm"
        variant="ghost"
        icon="trash"
        title="Apagar"
        disabled={pending}
        onClick={remove}
      />
      <Drawer open={open} onClose={() => setOpen(false)} title="Editar recorrente">
        <RecurringForm reference={reference} template={template} onDone={() => setOpen(false)} />
      </Drawer>
    </div>
  );
}

export function GenerateButton({
  entityId,
  period,
  count,
}: {
  readonly entityId: string;
  readonly period: YearMonth;
  readonly count: number;
}) {
  const { pending, run } = useAction();
  return (
    <Button
      variant="primary"
      icon="wand-magic-sparkles"
      disabled={pending || count === 0}
      onClick={() => run(() => generateRecurringAction(entityId, period))}
    >
      {pending ? 'A gerar…' : `Gerar ${count} lançamento${count === 1 ? '' : 's'}`}
    </Button>
  );
}
