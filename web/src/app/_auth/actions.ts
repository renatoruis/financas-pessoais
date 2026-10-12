'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  createSessionToken,
  passwordMatches,
  readAuthConfig,
  safeNextPath,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from './session';

export interface LoginState {
  readonly error?: string;
}

/** Atraso nas tentativas falhadas para travar adivinhação da senha. */
const FAILED_LOGIN_DELAY_MS = 1000;

const loginSchema = z.object({
  password: z.string(),
  next: z.string().optional(),
});

export async function loginAction(_previous: LoginState, form: FormData): Promise<LoginState> {
  const auth = readAuthConfig();
  if (!auth) return { error: 'Autenticação não configurada (AUTH_PASSWORD e AUTH_SECRET).' };
  const input = loginSchema.parse({
    password: form.get('password') ?? '',
    next: form.get('next') ?? undefined,
  });
  if (!(await passwordMatches(input.password, auth))) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return { error: 'Senha incorreta.' };
  }
  const secure = (await headers()).get('x-forwarded-proto') === 'https';
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(auth.secret, Date.now()), {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  redirect(safeNextPath(input.next));
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login');
}
