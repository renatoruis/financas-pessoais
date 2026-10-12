/** Erro de regra de negócio. `message` é mostrada ao utilizador (português). */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

/**
 * Usar em vez de `instanceof`: o Next pode carregar este módulo mais de uma vez
 * (camadas RSC e route handlers), e cada cópia tem a sua classe.
 */
export const isDomainError = (error: unknown): error is DomainError =>
  error instanceof Error && error.name === 'DomainError' && 'code' in error;
