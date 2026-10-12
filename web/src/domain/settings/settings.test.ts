import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, validateSettings } from './settings';

describe('settings', () => {
  it('aceita os valores por omissão', () => {
    expect(validateSettings(DEFAULT_SETTINGS).vatRate).toBe(0.23);
  });

  it('recusa IVA fora de [0, 1[', () => {
    expect(() => validateSettings({ ...DEFAULT_SETTINGS, vatRate: 1.2 })).toThrow('IVA');
  });
});
