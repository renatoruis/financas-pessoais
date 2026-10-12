import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { isDomainError } from '@/domain/shared/domain-error';

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

function errorMessage(error: unknown): string {
  if (isDomainError(error)) return error.message;
  if (error instanceof ZodError) return error.issues[0]?.message ?? 'Dados inválidos.';
  console.error(error);
  return 'Algo correu mal. Tenta outra vez.';
}

/**
 * Executa uma mutação de server action: erros de regra/validação voltam como mensagem
 * e, em caso de sucesso, todas as páginas são revalidadas.
 */
export async function runAction(
  work: () => Promise<string | void>,
  successMessage: string,
): Promise<ActionResult> {
  try {
    const message = await work();
    revalidatePath('/', 'layout');
    return { ok: true, message: message || successMessage };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
