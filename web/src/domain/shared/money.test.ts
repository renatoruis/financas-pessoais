import { describe, expect, it } from 'vitest';
import {
  add,
  CurrencyMismatchError,
  fromDecimal,
  max,
  min,
  money,
  multiply,
  share,
  subtract,
  sum,
  toDecimal,
} from './money';

describe('Money', () => {
  it('converte decimais em cêntimos sem erros de vírgula flutuante', () => {
    expect(fromDecimal(89.52, 'EUR').cents).toBe(8952);
    expect(toDecimal(money(35825, 'BRL'))).toBe(358.25);
  });

  it('soma e subtrai na mesma moeda', () => {
    const a = money(1000, 'BRL');
    const b = money(250, 'BRL');
    expect(add(a, b).cents).toBe(1250);
    expect(subtract(a, b).cents).toBe(750);
    expect(sum([a, b, b], 'BRL').cents).toBe(1500);
  });

  it('nunca soma BRL com EUR', () => {
    expect(() => add(money(1, 'BRL'), money(1, 'EUR'))).toThrow(CurrencyMismatchError);
    expect(() => sum([money(1, 'EUR')], 'BRL')).toThrow(CurrencyMismatchError);
  });

  it('rejeita cêntimos não inteiros', () => {
    expect(() => money(1.5, 'EUR')).toThrow();
  });

  it('multiplica arredondando ao cêntimo', () => {
    expect(multiply(money(520000, 'EUR'), 0.23).cents).toBe(119600);
    expect(multiply(money(546000, 'EUR'), 0.23).cents).toBe(125580);
  });

  it('calcula parte proporcional e trata divisor zero', () => {
    const total = money(87000, 'BRL');
    expect(share(total, money(1060, 'BRL'), money(1600, 'BRL')).cents).toBe(57638);
    expect(share(total, money(1, 'BRL'), money(0, 'BRL')).cents).toBe(0);
  });

  it('min e max', () => {
    expect(min(money(1, 'EUR'), money(2, 'EUR')).cents).toBe(1);
    expect(max(money(1, 'EUR'), money(2, 'EUR')).cents).toBe(2);
  });
});
