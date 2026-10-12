import { DomainError } from '../shared/domain-error';
import { money, type Money } from '../shared/money';

export interface Settings {
  /** Caixa dos imóveis antes do primeiro lançamento (R$). */
  readonly propertyInitialCash: Money;
  /** Caixa da Empresa PT antes do primeiro lançamento (€). */
  readonly companyPtInitialCash: Money;
  /** Taxa diária faturada (€, cêntimos). */
  readonly dailyRate: Money;
  /** Taxa de IVA (0.23 = 23%). */
  readonly vatRate: number;
}

const DEFAULT_DAILY_RATE_CENTS = 26000;
const DEFAULT_VAT_RATE = 0.23;

export const DEFAULT_SETTINGS: Settings = {
  propertyInitialCash: money(0, 'BRL'),
  companyPtInitialCash: money(0, 'EUR'),
  dailyRate: money(DEFAULT_DAILY_RATE_CENTS, 'EUR'),
  vatRate: DEFAULT_VAT_RATE,
};

export function validateSettings(settings: Settings): Settings {
  if (settings.vatRate < 0 || settings.vatRate >= 1) {
    throw new DomainError('invalid-vat', 'O IVA tem de estar entre 0% e 100%.');
  }
  if (settings.dailyRate.cents < 0) {
    throw new DomainError('invalid-amount', 'A taxa diária não pode ser negativa.');
  }
  return settings;
}
