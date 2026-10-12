import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ZodError } from 'zod';
import { hasValidSession, SESSION_COOKIE } from '@/app/_auth/session';
import { isDomainError } from '@/domain/shared/domain-error';

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

const SESSION_EXPIRED = 'Sessão expirada. Entra outra vez.';

function errorMessage(error: unknown): string {
  if (isDomainError(error)) return error.message;
  if (error instanceof ZodError) return error.issues[0]?.message ?? 'Dados inválidos.';
  console.error(error);
  return 'Algo correu mal. Tenta outra vez.';
}

/**
 * Executa uma mutação de server action: erros de regra/validação voltam como mensagem
 * e, em caso de sucesso, todas as páginas são revalidadas.
 * A sessão é verificada aqui porque uma server action pode ser invocada a partir de `/login`,
 * que o middleware deixa passar.
 */
export async function runAction(
  work: () => Promise<string | void>,
  successMessage: string,
): Promise<ActionResult> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await hasValidSession(token, Date.now()))) return { ok: false, error: SESSION_EXPIRED };
  try {
    const message = await work();
    revalidatePath('/', 'layout');
    return { ok: true, message: message || successMessage };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
