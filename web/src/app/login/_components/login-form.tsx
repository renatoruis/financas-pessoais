'use client';

import { useActionState } from 'react';
import { Button } from '@/ui/button';
import { Field, Input } from '@/ui/field';
import { loginAction, type LoginState } from '../../_auth/actions';

const INITIAL: LoginState = {};

export function LoginForm({ next }: { readonly next?: string }) {
  const [state, action, pending] = useActionState(loginAction, INITIAL);
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Senha" error={state.error}>
        <Input type="password" name="password" autoComplete="current-password" autoFocus required />
      </Field>
      <Button
        type="submit"
        variant="primary"
        icon="right-to-bracket"
        disabled={pending}
        className="w-full"
      >
        {pending ? 'A entrar…' : 'Entrar'}
      </Button>
    </form>
  );
}
