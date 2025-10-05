/**
 * Supplier Integration - Mapper Types
 * Type definitions for supplier data mapping
 */

export type SupportedCurrency = 'TRY' | 'EUR' | 'USD';
export type OfferCategory = 'tour' | 'bus' | 'flight' | 'cruise';

/**
 * Input data structure from supplier APIs (flexible)
 * Different suppliers may have different field names
 */
export type SupplierOfferInput = {
  // Required fields
  vendorOfferId: string | number;
  category: string;
  title: string;
  from: string;
  to: string;
  startAt: string | Date;
  seatsTotal: number | string;
  seatsLeft: number | string;
  
  // Price fields (various formats supported)
  price?: number | string;           // Price in major units (TRY, EUR, etc.)
  priceMinor?: number | string;      // Price in minor units (kuruş, cents)
  amount?: number | string;          // Alternative price field
  cost?: number | string;            // Alternative price field
  
  // Currency
  currency?: string;
  
  // Optional fields
  image?: string;
  terms?: string;
  transport?: string;
  
  // Flags
  isSurprise?: boolean;              // Sürpriz tur mu?
  requiresVisa?: boolean;            // Vize gerekli mi?
  requiresPassport?: boolean;        // Pasaport gerekli mi?
  
  // Any additional fields from supplier
  [key: string]: any;
};

/**
 * Normalized offer output matching Prisma Offer model
 */
export type NormalizedOffer = {
  // Supplier Integration (Required)
  supplierId: string;
  vendorOfferId: string;
  
  // Offer Details
  category: OfferCategory;
  title: string;
  from: string;
  to: string;
  startAt: Date;
  seatsTotal: number;
  seatsLeft: number;
  
  // Pricing (in minor units)
  priceMinor: number;
  currency: SupportedCurrency;
  
  // Additional Info
  image?: string;
  terms?: string;
  transport?: string;
  
  // Flags
  isSurprise?: boolean;
  requiresVisa?: boolean;
  requiresPassport?: boolean;
  
  // Raw Data
  rawJson: string;
  
  // Status
  status: 'new' | 'imported' | 'ignored' | 'expired' | 'active';
  importedToInventory: boolean;
};

/**
 * Validation error details
 */
export type ValidationError = {
  field: string;
  message: string;
  received?: any;
};

/**
 * Mapper result with error handling
 */
export type MapperResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] };

