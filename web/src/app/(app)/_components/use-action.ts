'use client';

import { useTransition } from 'react';
import { useToast } from '@/ui/toast';
import type { ActionResult } from '../_lib/action-result';

/** Corre uma server action com estado "a gravar" e toast do resultado. */
export function useAction() {
  const notify = useToast();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>, onSuccess?: () => void) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        notify('success', result.message);
        onSuccess?.();
      } else {
        notify('error', result.error);
      }
    });

  return { pending, run };
}
