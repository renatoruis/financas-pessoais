import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { isDomainError } from '@/domain/shared/domain-error';

const HTTP = { ok: 200, badRequest: 400, notFound: 404, serverError: 500 } as const;

export interface IdContext {
  readonly params: Promise<{ id: string }>;
}

function errorResponse(error: unknown): NextResponse {
  if (isDomainError(error)) {
    const status = error.code === 'not-found' ? HTTP.notFound : HTTP.badRequest;
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: 'invalid-input', message: 'Dados inválidos.', issues: error.issues } },
      { status: HTTP.badRequest },
    );
  }
  console.error(error);
  return NextResponse.json(
    { error: { code: 'internal', message: 'Erro interno.' } },
    { status: HTTP.serverError },
  );
}

/** Leitura: devolve `{ data }` ou `{ error }` com o estado HTTP certo. */
export function query<C>(work: (request: Request, context: C) => Promise<unknown>) {
  return async (request: Request, context: C): Promise<NextResponse> => {
    try {
      return NextResponse.json(
        { data: (await work(request, context)) ?? null },
        { status: HTTP.ok },
      );
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Escrita: como `query`, mas revalida as páginas em caso de sucesso. */
export function command<C>(work: (request: Request, context: C) => Promise<unknown>) {
  const run = query(work);
  return async (request: Request, context: C): Promise<NextResponse> => {
    const response = await run(request, context);
    if (response.ok) revalidatePath('/', 'layout');
    return response;
  };
}

/** Corpo JSON; vazio vale `{}`. */
export async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  return text ? (JSON.parse(text) as unknown) : {};
}

export const searchParamsOf = (request: Request): Record<string, string> =>
  Object.fromEntries(new URL(request.url).searchParams);
