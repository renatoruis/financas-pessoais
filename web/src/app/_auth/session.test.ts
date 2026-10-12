import { describe, expect, it } from 'vitest';
import {
  createSessionToken,
  hasValidSession,
  passwordMatches,
  readAuthConfig,
  safeNextPath,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
} from './session';

const SECRET = 'a'.repeat(32);
const NOW = 1_800_000_000_000;

describe('readAuthConfig', () => {
  it('exige senha e segredo com pelo menos 32 caracteres', () => {
    expect(readAuthConfig({ AUTH_PASSWORD: 'x', AUTH_SECRET: SECRET })).toEqual({
      password: 'x',
      secret: SECRET,
    });
    expect(readAuthConfig({ AUTH_PASSWORD: 'x', AUTH_SECRET: 'curto' })).toBeNull();
    expect(readAuthConfig({ AUTH_SECRET: SECRET })).toBeNull();
  });
});

describe('passwordMatches', () => {
  const config = { password: 'certa', secret: SECRET };

  it('aceita só a senha configurada', async () => {
    expect(await passwordMatches('certa', config)).toBe(true);
    expect(await passwordMatches('errada', config)).toBe(false);
    expect(await passwordMatches('', config)).toBe(false);
  });
});

describe('sessão', () => {
  it('aceita um token válido dentro do prazo', async () => {
    const token = await createSessionToken(SECRET, NOW);
    expect(await verifySessionToken(token, SECRET, NOW + 1)).toBe(true);
  });

  it('rejeita token expirado', async () => {
    const token = await createSessionToken(SECRET, NOW);
    const after = NOW + SESSION_MAX_AGE_SECONDS * 1000;
    expect(await verifySessionToken(token, SECRET, after)).toBe(false);
  });

  it('rejeita outro segredo, assinatura adulterada ou token em falta', async () => {
    const token = await createSessionToken(SECRET, NOW);
    const [expiresAt] = token.split('.');
    expect(await verifySessionToken(token, 'b'.repeat(32), NOW)).toBe(false);
    expect(
      await verifySessionToken(`${Number(expiresAt) + 1}.${token.split('.')[1]}`, SECRET, NOW),
    ).toBe(false);
    expect(await verifySessionToken(`${token}.x`, SECRET, NOW)).toBe(false);
    expect(await verifySessionToken(undefined, SECRET, NOW)).toBe(false);
  });
});

describe('hasValidSession', () => {
  const env = { AUTH_PASSWORD: 'x', AUTH_SECRET: SECRET };

  it('exige token válido e autenticação configurada', async () => {
    const token = await createSessionToken(SECRET, NOW);
    expect(await hasValidSession(token, NOW, env)).toBe(true);
    expect(await hasValidSession(undefined, NOW, env)).toBe(false);
    expect(await hasValidSession(token, NOW, { AUTH_SECRET: SECRET })).toBe(false);
  });
});

describe('safeNextPath', () => {
  it('só permite caminhos internos', () => {
    expect(safeNextPath('/empresa-br/lancamentos?mes=2026-10')).toBe(
      '/empresa-br/lancamentos?mes=2026-10',
    );
    expect(safeNextPath('//evil.com')).toBe('/');
    expect(safeNextPath('/\\evil.com')).toBe('/');
    expect(safeNextPath('https://evil.com')).toBe('/');
    expect(safeNextPath(undefined)).toBe('/');
  });
});
