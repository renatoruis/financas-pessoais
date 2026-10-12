import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  dateInPeriod,
  daysInMonth,
  isIsoDate,
  isYearMonth,
  monthOf,
  periodOf,
  periodsOfYear,
  yearOf,
} from './iso-date';

describe('iso-date', () => {
  it('valida datas reais', () => {
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('26-02-01')).toBe(false);
    expect(isYearMonth('2026-10')).toBe(true);
    expect(isYearMonth('2026-13')).toBe(false);
  });

  it('extrai mês, ano e período', () => {
    expect(periodOf('2026-10-21')).toBe('2026-10');
    expect(yearOf('2026-10')).toBe(2026);
    expect(monthOf('2026-10-21')).toBe(10);
  });

  it('limita o dia ao fim do mês', () => {
    expect(daysInMonth('2028-02')).toBe(29);
    expect(dateInPeriod('2026-02', 31)).toBe('2026-02-28');
    expect(dateInPeriod('2026-11', 0)).toBe('2026-11-01');
  });

  it('soma meses e dias atravessando anos', () => {
    expect(addMonths('2026-11', 2)).toBe('2027-01');
    expect(addMonths('2027-01', -2)).toBe('2026-11');
    expect(addDays('2026-12-28', 7)).toBe('2027-01-04');
  });

  it('lista os 12 meses do ano', () => {
    expect(periodsOfYear(2026)).toHaveLength(12);
    expect(periodsOfYear(2026)[11]).toBe('2026-12');
  });
});
