/**
 * Price formatting utilities
 * Handles priceMinor (kuruş/cents) to major currency conversion
 * and locale-specific formatting with proper symbols
 */

export type Currency = 'TRY' | 'EUR' | 'USD';

/**
 * Currency symbols and formatting
 */
const CURRENCY_CONFIG: Record<Currency, {
  symbol: string;
  locale: string;
  position: 'before' | 'after';
}> = {
  TRY: {
    symbol: '₺',
    locale: 'tr-TR',
    position: 'after',
  },
  EUR: {
    symbol: '€',
    locale: 'de-DE',
    position: 'after',
  },
  USD: {
    symbol: '$',
    locale: 'en-US',
    position: 'before',
  },
};

/**
 * Convert priceMinor (kuruş/cents) to major currency units
 * @param priceMinor - Price in minor units (kuruş for TRY, cents for USD/EUR)
 * @returns Price in major units
 * 
 * @example
 * minorToMajor(280000) // 2800 (280000 kuruş = 2800 TRY)
 * minorToMajor(5000)   // 50   (5000 kuruş = 50 TRY)
 */
export function minorToMajor(priceMinor: number): number {
  return priceMinor / 100;
}

/**
 * Format price with proper currency symbol and thousand separators
 * @param priceMinor - Price in minor units (kuruş/cents)
 * @param currency - Currency code (TRY, USD, EUR)
 * @returns Formatted price string with symbol
 * 
 * @example
 * formatPrice(280000, 'TRY')  // "2.800 ₺"
 * formatPrice(5000, 'TRY')    // "50 ₺"
 * formatPrice(150000, 'USD')  // "$1,500"
 * formatPrice(200000, 'EUR')  // "2.000 €"
 */
export function formatPrice(
  priceMinor: number,
  currency: Currency = 'TRY'
): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.TRY;
  const majorAmount = minorToMajor(priceMinor);

  // Format number with proper locale
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(majorAmount);

  // Position symbol before or after based on currency
  if (config.position === 'before') {
    return `${config.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${config.symbol}`;
  }
}

/**
 * Format price with decimal places (for precise amounts)
 * @param priceMinor - Price in minor units
 * @param currency - Currency code
 * @returns Formatted price with decimals
 * 
 * @example
 * formatPriceWithDecimals(285000, 'TRY')  // "2.850,00 ₺"
 * formatPriceWithDecimals(5050, 'TRY')    // "50,50 ₺"
 */
export function formatPriceWithDecimals(
  priceMinor: number,
  currency: Currency = 'TRY'
): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.TRY;
  const majorAmount = minorToMajor(priceMinor);

  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorAmount);

  if (config.position === 'before') {
    return `${config.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${config.symbol}`;
  }
}

/**
 * Get currency symbol only
 * @param currency - Currency code
 * @returns Currency symbol
 * 
 * @example
 * getCurrencySymbol('TRY')  // "₺"
 * getCurrencySymbol('USD')  // "$"
 * getCurrencySymbol('EUR')  // "€"
 */
export function getCurrencySymbol(currency: Currency = 'TRY'): string {
  return CURRENCY_CONFIG[currency]?.symbol || '₺';
}

/**
 * Format price in compact notation (for large amounts)
 * @param priceMinor - Price in minor units
 * @param currency - Currency code
 * @returns Compact formatted price
 * 
 * @example
 * formatPriceCompact(500000000, 'TRY')  // "5M ₺"  (5 million)
 * formatPriceCompact(250000000, 'TRY')  // "2,5M ₺" (2.5 million)
 * formatPriceCompact(50000, 'TRY')      // "500 ₺"  (no compacting needed)
 */
export function formatPriceCompact(
  priceMinor: number,
  currency: Currency = 'TRY'
): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.TRY;
  const majorAmount = minorToMajor(priceMinor);

  const formattedNumber = new Intl.NumberFormat(config.locale, {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(majorAmount);

  if (config.position === 'before') {
    return `${config.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${config.symbol}`;
  }
}

/**
 * Format price range
 * @param minPriceMinor - Minimum price in minor units
 * @param maxPriceMinor - Maximum price in minor units
 * @param currency - Currency code
 * @returns Formatted price range
 * 
 * @example
 * formatPriceRange(100000, 200000, 'TRY')  // "1.000 - 2.000 ₺"
 */
export function formatPriceRange(
  minPriceMinor: number,
  maxPriceMinor: number,
  currency: Currency = 'TRY'
): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.TRY;
  const minMajor = minorToMajor(minPriceMinor);
  const maxMajor = minorToMajor(maxPriceMinor);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);

  const formatted = `${formatNumber(minMajor)} - ${formatNumber(maxMajor)}`;

  if (config.position === 'before') {
    return `${config.symbol}${formatted}`;
  } else {
    return `${formatted} ${config.symbol}`;
  }
}

