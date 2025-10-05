/**
 * Supplier Integration - Main Mapper
 * Maps supplier data to normalized Offer format
 */

import { 
  SupplierOfferInput, 
  NormalizedOffer, 
  ValidationError 
} from './types';
import { 
  MappingValidationError 
} from './errors';
import {
  normalizePrice,
  extractPrice,
  normalizeDate,
  normalizeCurrency,
  normalizeCategory,
  normalizeSeats,
  validateRequiredString,
  normalizeVendorOfferId,
} from './normalizers';

/**
 * Map supplier input data to normalized Offer format
 * 
 * @param input - Raw data from supplier API
 * @param supplierId - Supplier ID from database
 * @returns Normalized offer ready for database insertion
 * @throws {MappingValidationError} When validation fails
 * @throws {PriceConversionError} When price conversion fails
 * @throws {DateConversionError} When date conversion fails
 * @throws {RequiredFieldError} When required field is missing
 * 
 * @example
 * ```typescript
 * const supplierData = {
 *   vendorOfferId: "ABC123",
 *   category: "tour",
 *   title: "Istanbul City Tour",
 *   from: "Sultanahmet",
 *   to: "Taksim",
 *   startAt: "2025-10-15T09:00:00Z",
 *   seatsTotal: 20,
 *   seatsLeft: 5,
 *   price: 150.00, // Will be converted to 15000 (minor units)
 *   currency: "TRY"
 * };
 * 
 * const normalized = mapToOffer(supplierData, "supplier-id-123");
 * // Result: { supplierId: "supplier-id-123", priceMinor: 15000, ... }
 * ```
 */
export function mapToOffer(
  input: SupplierOfferInput,
  supplierId: string
): NormalizedOffer {
  const errors: ValidationError[] = [];

  // Validate supplierId
  if (!supplierId || typeof supplierId !== 'string' || supplierId.trim() === '') {
    errors.push({
      field: 'supplierId',
      message: 'Supplier ID is required',
      received: supplierId,
    });
  }

  // Collect all validation errors before throwing
  try {
    // Required fields validation
    const vendorOfferId = normalizeVendorOfferId(input.vendorOfferId);
    const category = normalizeCategory(input.category);
    const title = validateRequiredString(input.title, 'title');
    const from = validateRequiredString(input.from, 'from');
    const to = validateRequiredString(input.to, 'to');
    const startAt = normalizeDate(input.startAt);
    const seatsTotal = normalizeSeats(input.seatsTotal, 'seatsTotal');
    const seatsLeft = normalizeSeats(input.seatsLeft, 'seatsLeft');
    
    // Price normalization
    const priceValue = extractPrice(input);
    const currency = normalizeCurrency(input.currency);
    const priceMinor = normalizePrice(priceValue, currency);
    
    // Validate seats logic
    if (seatsLeft > seatsTotal) {
      errors.push({
        field: 'seatsLeft',
        message: 'Seats left cannot exceed total seats',
        received: { seatsLeft, seatsTotal },
      });
    }

    // If there are validation errors, throw
    if (errors.length > 0) {
      throw new MappingValidationError(errors);
    }

    // Optional fields
    const image = input.image && typeof input.image === 'string' 
      ? input.image.trim() 
      : undefined;
    const terms = input.terms && typeof input.terms === 'string'
      ? input.terms.trim()
      : undefined;
    const transport = input.transport && typeof input.transport === 'string'
      ? input.transport.trim()
      : undefined;

    // Optional flags
    const isSurprise = typeof input.isSurprise === 'boolean' 
      ? input.isSurprise 
      : undefined;
    const requiresVisa = typeof input.requiresVisa === 'boolean'
      ? input.requiresVisa
      : undefined;
    const requiresPassport = typeof input.requiresPassport === 'boolean'
      ? input.requiresPassport
      : undefined;

    // Build normalized offer
    const normalizedOffer: NormalizedOffer = {
      supplierId: supplierId.trim(),
      vendorOfferId,
      category,
      title,
      from,
      to,
      startAt,
      seatsTotal,
      seatsLeft,
      priceMinor,
      currency,
      image,
      terms,
      transport,
      isSurprise,
      requiresVisa,
      requiresPassport,
      rawJson: JSON.stringify(input),
      status: 'new',
      importedToInventory: false,
    };

    return normalizedOffer;

  } catch (error) {
    // If it's already a MappingValidationError, re-throw
    if (error instanceof MappingValidationError) {
      throw error;
    }

    // Wrap other errors in validation error
    if (error instanceof Error) {
      errors.push({
        field: 'unknown',
        message: error.message,
        received: input,
      });
    }

    throw new MappingValidationError(errors);
  }
}

/**
 * Map multiple supplier offers to normalized format
 * Returns both successful mappings and errors
 * 
 * @param inputs - Array of supplier data
 * @param supplierId - Supplier ID
 * @returns Object with successful offers and errors
 */
export function mapToOfferBatch(
  inputs: SupplierOfferInput[],
  supplierId: string
): {
  successful: NormalizedOffer[];
  failed: Array<{ input: SupplierOfferInput; error: string }>;
} {
  const successful: NormalizedOffer[] = [];
  const failed: Array<{ input: SupplierOfferInput; error: string }> = [];

  for (const input of inputs) {
    try {
      const normalized = mapToOffer(input, supplierId);
      successful.push(normalized);
    } catch (error) {
      failed.push({
        input,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { successful, failed };
}

