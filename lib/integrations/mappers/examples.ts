/**
 * Supplier Integration - Usage Examples
 * Real-world usage examples for the mapper system
 */

import { mapToOffer, mapToOfferBatch } from './mapToOffer';
import type { SupplierOfferInput } from './types';

// ============================================================================
// Example 1: Simple Tour Mapping
// ============================================================================

export function exampleSimpleTourMapping() {
  const supplierData: SupplierOfferInput = {
    vendorOfferId: 'TOUR-2024-001',
    category: 'tour',
    title: 'Kapadokya Balon Turu',
    from: 'İstanbul',
    to: 'Kapadokya',
    startAt: '2025-10-15T06:00:00Z',
    seatsTotal: 20,
    seatsLeft: 5,
    price: 2800,        // TRY (will be converted to 280000 kuruş)
    currency: 'TRY',
    image: '/images/kapadokya.jpg',
    terms: 'İptal koşulları: Kalkıştan 12 saat önce iptal edilirse %100 iade.',
    transport: 'Uçak ile',
  };

  const supplierId = 'supplier-abc-123';

  const normalizedOffer = mapToOffer(supplierData, supplierId);
  
  console.log('Normalized Offer:', normalizedOffer);
  // Output: priceMinor: 280000, startAt: Date object, etc.

  return normalizedOffer;
}

// ============================================================================
// Example 2: Flight Mapping with Alternative Price Field
// ============================================================================

export function exampleFlightMapping() {
  // Some suppliers use 'amount' instead of 'price'
  const supplierData: SupplierOfferInput = {
    vendorOfferId: 'FLT-IST-AYT-2024-10-15',
    category: 'flight',
    title: 'İstanbul → Antalya Uçuşu',
    from: 'İstanbul (IST)',
    to: 'Antalya (AYT)',
    startAt: '2025-10-15T14:30:00Z',
    seatsTotal: 180,
    seatsLeft: 15,
    amount: 450.00,     // Using 'amount' instead of 'price'
    currency: 'TRY',
  };

  const normalizedOffer = mapToOffer(supplierData, 'turkish-airlines-api');
  
  console.log('Flight Offer:', normalizedOffer);
  // priceMinor will be 45000 (450 * 100)

  return normalizedOffer;
}

// ============================================================================
// Example 3: Bus Mapping with Already-Minor-Units Price
// ============================================================================

export function exampleBusMapping() {
  // Some suppliers already send prices in minor units (kuruş)
  const supplierData: SupplierOfferInput = {
    vendorOfferId: '12345',
    category: 'bus',
    title: 'İstanbul - Ankara Otobüs Bileti',
    from: 'İstanbul',
    to: 'Ankara',
    startAt: new Date('2025-10-16T08:00:00Z'),  // Date object
    seatsTotal: 45,
    seatsLeft: '8',     // String will be converted to number
    priceMinor: 35000,  // Already in kuruş (350 TRY)
    currency: 'TRY',
  };

  const normalizedOffer = mapToOffer(supplierData, 'metro-turizm-api');
  
  console.log('Bus Offer:', normalizedOffer);
  // priceMinor will stay 35000

  return normalizedOffer;
}

// ============================================================================
// Example 4: Batch Processing Multiple Offers
// ============================================================================

export function exampleBatchProcessing() {
  const supplierOffers: SupplierOfferInput[] = [
    {
      vendorOfferId: 'TOUR-001',
      category: 'tour',
      title: 'Kapadokya Turu',
      from: 'İstanbul',
      to: 'Kapadokya',
      startAt: '2025-10-15T06:00:00Z',
      seatsTotal: 20,
      seatsLeft: 5,
      price: 2800,
    },
    {
      vendorOfferId: 'TOUR-002',
      category: 'tour',
      title: 'Pamukkale Turu',
      from: 'İstanbul',
      to: 'Pamukkale',
      startAt: '2025-10-16T07:00:00Z',
      seatsTotal: 30,
      seatsLeft: 12,
      price: 1500,
    },
    {
      // Invalid offer - missing required field
      vendorOfferId: 'TOUR-003',
      category: 'tour',
      title: '',  // Empty title will cause error
      from: 'İstanbul',
      to: 'Antalya',
      startAt: '2025-10-17T08:00:00Z',
      seatsTotal: 25,
      seatsLeft: 8,
      price: 1200,
    },
  ];

  const result = mapToOfferBatch(supplierOffers, 'supplier-xyz-789');
  
  console.log(`Successfully mapped: ${result.successful.length}`);
  console.log(`Failed to map: ${result.failed.length}`);
  
  // Process successful ones
  result.successful.forEach(offer => {
    console.log(`✅ ${offer.vendorOfferId}: ${offer.title}`);
  });
  
  // Log errors
  result.failed.forEach(({ input, error }) => {
    console.error(`❌ ${input.vendorOfferId}: ${error}`);
  });

  return result;
}

// ============================================================================
// Example 5: API Integration with Database
// ============================================================================

export async function exampleAPIIntegration(
  prisma: any, // Prisma client
  supplierId: string
) {
  try {
    // 1. Fetch data from supplier API
    const supplierResponse = await fetch('https://api.supplier.com/offers');
    const supplierData = await supplierResponse.json();

    // 2. Map to normalized format
    const { successful, failed } = mapToOfferBatch(
      supplierData.offers,
      supplierId
    );

    // 3. Save successful offers to database
    if (successful.length > 0) {
      const created = await prisma.offer.createMany({
        data: successful,
        skipDuplicates: true, // Skip if vendorOfferId already exists
      });
      
      console.log(`✅ Imported ${created.count} new offers`);
    }

    // 4. Log failed mappings
    if (failed.length > 0) {
      console.error(`❌ Failed to map ${failed.length} offers:`);
      failed.forEach(({ input, error }) => {
        console.error(`  - ${input.vendorOfferId}: ${error}`);
      });
    }

    return {
      success: true,
      imported: successful.length,
      failed: failed.length,
    };

  } catch (error) {
    console.error('API integration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Example 6: Error Handling
// ============================================================================

export function exampleErrorHandling() {
  const invalidData: SupplierOfferInput = {
    vendorOfferId: 'BAD-OFFER',
    category: 'tour',
    title: 'Test Tour',
    from: 'A',
    to: 'B',
    startAt: 'invalid-date',  // This will cause DateConversionError
    seatsTotal: 20,
    seatsLeft: 5,
    price: 'not-a-number' as any,  // This will cause PriceConversionError
  };

  try {
    const result = mapToOffer(invalidData, 'test-supplier');
    console.log('Success:', result);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Mapping failed:', error.name);
      console.error('Message:', error.message);
      
      // Check if it's a MappingValidationError with multiple errors
      if ('errors' in error) {
        console.error('Validation errors:', (error as any).errors);
      }
    }
  }
}

// ============================================================================
// Example 7: Working with Different Price Formats
// ============================================================================

export function examplePriceFormats() {
  const examples = [
    // Format 1: Price in major units (will be multiplied by 100)
    { price: 150.00, expected: 15000 },
    
    // Format 2: Price already in minor units (detected, kept as-is)
    { priceMinor: 15000, expected: 15000 },
    
    // Format 3: Alternative field name
    { amount: 150.00, expected: 15000 },
    
    // Format 4: String number
    { price: '150.00', expected: 15000 },
  ];

  examples.forEach((example, index) => {
    const input: SupplierOfferInput = {
      vendorOfferId: `PRICE-TEST-${index}`,
      category: 'tour',
      title: 'Price Test',
      from: 'A',
      to: 'B',
      startAt: '2025-10-15T06:00:00Z',
      seatsTotal: 10,
      seatsLeft: 5,
      ...example,
      expected: undefined, // Remove expected from input
    };

    const result = mapToOffer(input, 'test-supplier');
    
    console.log(`Test ${index + 1}: ${result.priceMinor} === ${example.expected} ✅`);
  });
}

// ============================================================================
// Example 8: Real-World Supplier Integration Pattern
// ============================================================================

export class SupplierIntegrationService {
  constructor(
    private prisma: any,
    private supplierId: string
  ) {}

  async syncOffers() {
    try {
      // 1. Get supplier config
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: this.supplierId },
      });

      if (!supplier || !supplier.isActive) {
        throw new Error('Supplier not found or inactive');
      }

      // 2. Fetch offers from supplier API
      const supplierOffers = await this.fetchSupplierAPI(supplier);

      // 3. Map to normalized format
      const { successful, failed } = mapToOfferBatch(
        supplierOffers,
        this.supplierId
      );

      // 4. Upsert offers (update existing, create new)
      const results = await Promise.all(
        successful.map(offer =>
          this.prisma.offer.upsert({
            where: {
              vendorOfferId_supplierId: {
                vendorOfferId: offer.vendorOfferId,
                supplierId: this.supplierId,
              },
            },
            update: {
              ...offer,
              lastSyncedAt: new Date(),
            },
            create: offer,
          })
        )
      );

      // 5. Mark old offers as expired
      await this.markExpiredOffers(successful.map(o => o.vendorOfferId));

      // 6. Log results
      console.log(`✅ Synced ${results.length} offers`);
      console.log(`❌ Failed ${failed.length} offers`);

      return {
        success: true,
        synced: results.length,
        failed: failed.length,
        errors: failed,
      };

    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  private async fetchSupplierAPI(supplier: any): Promise<SupplierOfferInput[]> {
    // Implementation depends on supplier API
    // This is just a placeholder
    const response = await fetch(supplier.apiUrl, {
      headers: {
        'Authorization': `Bearer ${supplier.apiKey}`,
      },
    });
    
    const data = await response.json();
    return data.offers;
  }

  private async markExpiredOffers(activeOfferIds: string[]) {
    // Mark offers not in the active list as expired
    await this.prisma.offer.updateMany({
      where: {
        supplierId: this.supplierId,
        vendorOfferId: {
          notIn: activeOfferIds,
        },
        status: 'new',
      },
      data: {
        status: 'expired',
      },
    });
  }
}

