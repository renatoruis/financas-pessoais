import { describe, expect, it } from 'vitest';
import {
  belongsToEntity,
  currencyOfCountry,
  isOperationalCategory,
  ofEntity,
  SYSTEM_CATEGORIES,
} from './reference-data';
import { slugify } from './slug';

describe('reference-data', () => {
  it('deriva a moeda do país', () => {
    expect(currencyOfCountry('PT')).toBe('EUR');
    expect(currencyOfCountry('BR')).toBe('BRL');
  });

  it('centros e categorias só servem a própria entidade', () => {
    const center = { id: 'geral', name: 'Geral', entityId: 'a' };
    expect(belongsToEntity(center, 'a')).toBe(true);
    expect(belongsToEntity(center, 'b')).toBe(false);
  });

  it('filtra os itens de uma entidade', () => {
    const items = [
      { id: 'geral', name: 'Geral', entityId: 'a' },
      { id: 'geral', name: 'Geral', entityId: 'b' },
    ];
    expect(ofEntity(items, 'b')).toEqual([items[1]]);
  });

  it('IVA, aportes e retiradas não são operacionais', () => {
    expect(isOperationalCategory(SYSTEM_CATEGORIES.vat)).toBe(false);
    expect(isOperationalCategory(SYSTEM_CATEGORIES.contribution)).toBe(false);
    expect(isOperationalCategory('servicos')).toBe(true);
  });

  it('slugify remove acentos e espaços', () => {
    expect(slugify('Imóveis')).toBe('imoveis');
    expect(slugify('Bella Cidade')).toBe('bella-cidade');
    expect(slugify('  Software e cloud ')).toBe('software-e-cloud');
    expect(slugify('Pró-labore')).toBe('pro-labore');
  });
});
