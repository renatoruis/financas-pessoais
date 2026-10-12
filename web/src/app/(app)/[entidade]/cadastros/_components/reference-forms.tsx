'use client';

import { useState } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/field';
import type { ActionResult } from '../../../_lib/action-result';
import { useAction } from '../../../_components/use-action';
import { createCategoryAction, createCostCenterAction } from '../actions';

const CREATE = {
  category: { placeholder: 'Nova categoria', action: createCategoryAction },
  costCenter: { placeholder: 'Novo centro', action: createCostCenterAction },
} satisfies Record<
  string,
  { placeholder: string; action: (entityId: string, name: string) => Promise<ActionResult> }
>;

interface NewReferenceFormProps {
  readonly kind: keyof typeof CREATE;
  readonly entityId: string;
}

/** Cria uma categoria ou um centro na entidade. */
export function NewReferenceForm({ kind, entityId }: NewReferenceFormProps) {
  const [name, setName] = useState('');
  const { pending, run } = useAction();
  const { placeholder, action } = CREATE[kind];
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () => action(entityId, name),
          () => setName(''),
        );
      }}
    >
      <Input placeholder={placeholder} value={name} onChange={(e) => setName(e.target.value)} />
      <Button type="submit" icon="plus" disabled={pending || !name.trim()}>
        Criar
      </Button>
    </form>
  );
}
