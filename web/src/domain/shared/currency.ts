export const CURRENCIES = ['BRL', 'EUR'] as const;

export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOL: Record<Currency, string> = { BRL: 'R$', EUR: '€' };
