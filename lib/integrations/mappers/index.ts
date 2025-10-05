/**
 * Supplier Integration - Mappers
 * Entry point for mapper functionality
 */

export { mapToOffer, mapToOfferBatch } from './mapToOffer';

export {
  normalizePrice,
  extractPrice,
  normalizeDate,
  normalizeCurrency,
  normalizeCategory,
  normalizeSeats,
  validateRequiredString,
  normalizeVendorOfferId,
} from './normalizers';

export {
  MapperError,
  MappingValidationError,
  PriceConversionError,
  DateConversionError,
  RequiredFieldError,
} from './errors';

export type {
  SupportedCurrency,
  OfferCategory,
  SupplierOfferInput,
  NormalizedOffer,
  ValidationError,
  MapperResult,
} from './types';

