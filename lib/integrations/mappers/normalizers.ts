/**
 * Supplier Integration - Normalizers
 * Helper functions for normalizing data formats
 */

import { SupportedCurrency, OfferCategory } from './types';
import { 
  PriceConversionError, 
  DateConversionError, 
  RequiredFieldError 
} from './errors';

/**
 * Convert price to minor units (kuruş, cents)
 * @param value - Price value (can be in major or minor units)
 * @param currency - Currency code
 * @returns Price in minor units (integer)
 */
export function normalizePrice(
  value: number | string | undefined,
  currency: string = 'TRY'
): number {
  if (value === undefined || value === null || value === '') {
    throw new PriceConversionError(value);
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue < 0) {
    throw new PriceConversionError(value);
  }

  // If value is already in minor units (likely if > 100), return as is
  // Otherwise, convert from major units to minor units
  // This heuristic assumes prices under 100 are in major units
  if (numValue >= 100) {
    return Math.round(numValue);
  }

  // Convert major units to minor units (multiply by 100)
  return Math.round(numValue * 100);
}

/**
 * Extract price from input object (supports multiple field names)
 * @param input - Supplier input data
 * @returns Price value
 */
export function extractPrice(input: any): number | string {
  const priceFields = ['priceMinor', 'price', 'amount', 'cost'];
  
  for (const field of priceFields) {
    if (input[field] !== undefined && input[field] !== null && input[field] !== '') {
      return input[field];
    }
  }
  
  throw new RequiredFieldError('price (or priceMinor, amount, cost)');
}

/**
 * Normalize date to ISO string
 * @param value - Date value (string, Date, or timestamp)
 * @returns Date object
 */
export function normalizeDate(value: string | Date | number | undefined): Date {
  if (!value) {
    throw new DateConversionError(value);
  }

  try {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new DateConversionError(value);
    }

    return date;
  } catch (error) {
    throw new DateConversionError(value);
  }
}

/**
 * Normalize currency code
 * @param value - Currency string
 * @returns Validated currency code
 */
export function normalizeCurrency(value?: string): SupportedCurrency {
  const currency = (value || 'TRY').toUpperCase() as SupportedCurrency;
  
  const supportedCurrencies: SupportedCurrency[] = ['TRY', 'EUR', 'USD'];
  
  if (!supportedCurrencies.includes(currency)) {
    // Default to TRY if unsupported currency
    console.warn(`Unsupported currency '${value}', defaulting to TRY`);
    return 'TRY';
  }
  
  return currency;
}

/**
 * Normalize category
 * @param value - Category string
 * @returns Validated category
 */
export function normalizeCategory(value: string): OfferCategory {
  const category = value.toLowerCase() as OfferCategory;
  
  const validCategories: OfferCategory[] = ['tour', 'bus', 'flight', 'cruise'];
  
  if (!validCategories.includes(category)) {
    throw new RequiredFieldError(`category (received: ${value})`);
  }
  
  return category;
}

/**
 * Normalize seat count
 * @param value - Seat count value
 * @returns Integer seat count
 */
export function normalizeSeats(value: number | string | undefined, fieldName: string): number {
  if (value === undefined || value === null || value === '') {
    throw new RequiredFieldError(fieldName);
  }

  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(numValue) || numValue < 0) {
    throw new RequiredFieldError(`${fieldName} (must be a positive number)`);
  }

  return Math.floor(numValue);
}

/**
 * Validate required string field
 * @param value - Field value
 * @param fieldName - Field name for error message
 * @returns Trimmed string value
 */
export function validateRequiredString(value: any, fieldName: string): string {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new RequiredFieldError(fieldName);
  }
  
  return value.trim();
}

/**
 * Normalize vendor offer ID to string
 * @param value - Vendor offer ID
 * @returns String representation
 */
export function normalizeVendorOfferId(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') {
    throw new RequiredFieldError('vendorOfferId');
  }
  
  return String(value).trim();
}

