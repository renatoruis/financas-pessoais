import { describe, expect, it } from 'vitest';
import { DomainError, isDomainError } from './domain-error';

describe('isDomainError', () => {
  it('reconhece pela marca, mesmo vindo de outra cópia da classe', () => {
    const foreign = Object.assign(new Error('x'), { name: 'DomainError', code: 'not-found' });
    expect(isDomainError(new DomainError('c', 'm'))).toBe(true);
    expect(isDomainError(foreign)).toBe(true);
    expect(isDomainError(new Error('x'))).toBe(false);
    expect(isDomainError('DomainError')).toBe(false);
  });
});
