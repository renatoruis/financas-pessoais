import { describe, expect, it } from 'vitest';
import { optionalMoneyInput, parseDecimalInput, requiredMoneyInput } from './input-schemas';

describe('parseDecimalInput', () => {
  it('aceita formatos PT/BR e ponto decimal', () => {
    expect(parseDecimalInput('1.234,56')).toBe(123456);
    expect(parseDecimalInput('89,52')).toBe(8952);
    expect(parseDecimalInput('1234.5')).toBe(123450);
    expect(parseDecimalInput('R$ 200')).toBe(20000);
    expect(parseDecimalInput('')).toBeNull();
    expect(parseDecimalInput('abc')).toBeNaN();
  });

  it('schemas de valor', () => {
    expect(optionalMoneyInput.parse('')).toBeNull();
    expect(optionalMoneyInput.parse('10')).toBe(1000);
    expect(() => optionalMoneyInput.parse('x')).toThrow();
    expect(() => requiredMoneyInput.parse('')).toThrow();
    expect(() => requiredMoneyInput.parse('0')).toThrow();
    expect(requiredMoneyInput.parse('5,5')).toBe(550);
  });
});
