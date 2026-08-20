import { CurrencySymbol } from '../types';

// Exchange rates relative to 1 USD ($)
// Base references (approximate realistic cross-rates):
// 1 USD = 500 KZT (₸)
// 1 USD = 90 RUB (₽)
// 1 USD = 0.92 EUR (€)
// 1 USD = 1.00 USD ($)

export interface ExchangeRateInfo {
  code: string;
  symbol: CurrencySymbol;
  name: string;
  flag: string;
  rateToUSD: number; // How many units of this currency per 1 USD
}

export const CURRENCY_INFO: Record<CurrencySymbol, ExchangeRateInfo> = {
  '₸': {
    code: 'KZT',
    symbol: '₸',
    name: 'Казахстанский тенге',
    flag: '🇰🇿',
    rateToUSD: 500,
  },
  '₽': {
    code: 'RUB',
    symbol: '₽',
    name: 'Российский рубль',
    flag: '🇷🇺',
    rateToUSD: 90,
  },
  '$': {
    code: 'USD',
    symbol: '$',
    name: 'Доллар США',
    flag: '🇺🇸',
    rateToUSD: 1.0,
  },
  '€': {
    code: 'EUR',
    symbol: '€',
    name: 'Евро',
    flag: '🇪🇺',
    rateToUSD: 0.92,
  },
};

/**
 * Converts an amount from source currency to target currency.
 */
export function convertAmount(
  amount: number,
  from: CurrencySymbol,
  to: CurrencySymbol
): number {
  if (from === to || !amount) return amount;
  const fromRate = CURRENCY_INFO[from]?.rateToUSD || 1;
  const toRate = CURRENCY_INFO[to]?.rateToUSD || 1;

  // Convert to USD first, then to target currency
  const inUSD = amount / fromRate;
  const converted = inUSD * toRate;

  // Round smartly: if >= 10, round to integer or 1 decimal; if < 10, 2 decimals
  if (converted >= 100) {
    return Math.round(converted);
  } else if (converted >= 10) {
    return Math.round(converted * 10) / 10;
  } else {
    return Math.round(converted * 100) / 100;
  }
}

/**
 * Gets cross-rate ratio: how much 1 unit of `from` is worth in `to`.
 * e.g. 1 ₽ = 5.56 ₸, 1 ₸ = 0.18 ₽, 1 $ = 500 ₸
 */
export function getExchangeRateRatio(from: CurrencySymbol, to: CurrencySymbol): number {
  if (from === to) return 1;
  const fromRate = CURRENCY_INFO[from]?.rateToUSD || 1;
  const toRate = CURRENCY_INFO[to]?.rateToUSD || 1;
  return toRate / fromRate;
}

/**
 * Returns formatted rate text, e.g. "1 ₽ ≈ 5.56 ₸" or "1 $ ≈ 500 ₸"
 */
export function formatExchangeRateDisplay(from: CurrencySymbol, to: CurrencySymbol): string {
  if (from === to) return `1 ${from} = 1 ${to}`;
  const ratio = getExchangeRateRatio(from, to);
  const formatted = ratio >= 10 ? ratio.toFixed(2) : ratio.toFixed(4);
  return `1 ${from} ≈ ${formatted} ${to}`;
}
