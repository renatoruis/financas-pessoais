/**
 * Sessão de utilizador único: cookie `expiração.assinatura` (HMAC-SHA256 com `AUTH_SECRET`).
 * Só Web Crypto, para correr também no middleware (edge).
 */
export const SESSION_COOKIE = 'financas_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const MS_PER_SECOND = 1000;
const MIN_SECRET_LENGTH = 32;
const encoder = new TextEncoder();

export interface AuthConfig {
  readonly password: string;
  readonly secret: string;
}

/** `null` quando a autenticação não está configurada: tudo fica bloqueado. */
export function readAuthConfig(
  source: Record<string, string | undefined> = process.env,
): AuthConfig | null {
  const password = source.AUTH_PASSWORD;
  const secret = source.AUTH_SECRET;
  if (!password || !secret || secret.length < MIN_SECRET_LENGTH) return null;
  return { password, secret };
}

async function sign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
  return Array.from(signature, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function passwordMatches(input: string, config: AuthConfig): Promise<boolean> {
  const [given, expected] = await Promise.all([
    sign(config.secret, input),
    sign(config.secret, config.password),
  ]);
  return constantTimeEqual(given, expected);
}

export async function createSessionToken(secret: string, nowMs: number): Promise<string> {
  const expiresAt = String(nowMs + SESSION_MAX_AGE_SECONDS * MS_PER_SECOND);
  return `${expiresAt}.${await sign(secret, expiresAt)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  nowMs: number,
): Promise<boolean> {
  const [expiresAt, signature, ...rest] = (token ?? '').split('.');
  if (!expiresAt || !signature || rest.length > 0 || !(Number(expiresAt) > nowMs)) return false;
  return constantTimeEqual(signature, await sign(secret, expiresAt));
}

/** Só caminhos internos, para o `next` do login não servir de redirecionamento aberto. */
export function safeNextPath(next: string | undefined): string {
  return next?.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/';
}
