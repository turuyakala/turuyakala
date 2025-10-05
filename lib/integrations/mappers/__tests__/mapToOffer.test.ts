/**
 * Supplier Integration - Mapper Tests
 * Test cases for mapToOffer functionality
 */

import { describe, it, expect } from '@jest/globals';
import { 
  mapToOffer, 
  mapToOfferBatch,
  MappingValidationError,
  RequiredFieldError,
  PriceConversionError,
  DateConversionError,
} from '../index';
import type { SupplierOfferInput } from '../types';

describe('mapToOffer', () => {
  const validInput: SupplierOfferInput = {
    vendorOfferId: 'TEST-001',
    category: 'tour',
    title: 'Kapadokya Balon Turu',
    from: 'İstanbul',
    to: 'Kapadokya',
    startAt: '2025-10-15T06:00:00Z',
    seatsTotal: 20,
    seatsLeft: 5,
    price: 2800,
    currency: 'TRY',
    image: '/images/test.jpg',
    terms: 'İptal koşulları',
    transport: 'Uçak ile',
  };

  const supplierId = 'supplier-test-123';

  describe('Success Cases', () => {
    it('should map valid input correctly', () => {
      const result = mapToOffer(validInput, supplierId);

      expect(result.supplierId).toBe(supplierId);
      expect(result.vendorOfferId).toBe('TEST-001');
      expect(result.category).toBe('tour');
      expect(result.title).toBe('Kapadokya Balon Turu');
      expect(result.from).toBe('İstanbul');
      expect(result.to).toBe('Kapadokya');
      expect(result.startAt).toBeInstanceOf(Date);
      expect(result.seatsTotal).toBe(20);
      expect(result.seatsLeft).toBe(5);
      expect(result.priceMinor).toBe(280000); // 2800 * 100
      expect(result.currency).toBe('TRY');
      expect(result.status).toBe('new');
      expect(result.importedToInventory).toBe(false);
    });

    it('should convert price from major to minor units', () => {
      const input = { ...validInput, price: 150.50 };
      const result = mapToOffer(input, supplierId);
      
      expect(result.priceMinor).toBe(15050); // 150.50 * 100
    });

    it('should accept priceMinor directly', () => {
      const input = { ...validInput, price: undefined, priceMinor: 280000 };
      const result = mapToOffer(input, supplierId);
      
      expect(result.priceMinor).toBe(280000);
    });

    it('should accept alternative price field names', () => {
      const input1 = { ...validInput, price: undefined, amount: 2800 };
      const input2 = { ...validInput, price: undefined, cost: 2800 };
      
      expect(mapToOffer(input1, supplierId).priceMinor).toBe(280000);
      expect(mapToOffer(input2, supplierId).priceMinor).toBe(280000);
    });

    it('should handle numeric vendorOfferId', () => {
      const input = { ...validInput, vendorOfferId: 12345 };
      const result = mapToOffer(input, supplierId);
      
      expect(result.vendorOfferId).toBe('12345');
    });

    it('should handle Date object for startAt', () => {
      const date = new Date('2025-10-15T06:00:00Z');
      const input = { ...validInput, startAt: date };
      const result = mapToOffer(input, supplierId);
      
      expect(result.startAt).toEqual(date);
    });

    it('should handle timestamp for startAt', () => {
      const timestamp = 1728972000000;
      const input = { ...validInput, startAt: timestamp };
      const result = mapToOffer(input, supplierId);
      
      expect(result.startAt).toBeInstanceOf(Date);
    });

    it('should handle string seat numbers', () => {
      const input = { 
        ...validInput, 
        seatsTotal: '20' as any, 
        seatsLeft: '5' as any 
      };
      const result = mapToOffer(input, supplierId);
      
      expect(result.seatsTotal).toBe(20);
      expect(result.seatsLeft).toBe(5);
    });

    it('should normalize category to lowercase', () => {
      const input = { ...validInput, category: 'TOUR' };
      const result = mapToOffer(input, supplierId);
      
      expect(result.category).toBe('tour');
    });

    it('should default currency to TRY if not provided', () => {
      const input = { ...validInput, currency: undefined };
      const result = mapToOffer(input, supplierId);
      
      expect(result.currency).toBe('TRY');
    });

    it('should trim string fields', () => {
      const input = { 
        ...validInput, 
        title: '  Kapadokya Balon Turu  ',
        from: '  İstanbul  ',
        to: '  Kapadokya  ',
      };
      const result = mapToOffer(input, supplierId);
      
      expect(result.title).toBe('Kapadokya Balon Turu');
      expect(result.from).toBe('İstanbul');
      expect(result.to).toBe('Kapadokya');
    });

    it('should store rawJson', () => {
      const result = mapToOffer(validInput, supplierId);
      
      expect(result.rawJson).toBeTruthy();
      expect(JSON.parse(result.rawJson)).toMatchObject(validInput);
    });

    it('should handle optional fields as undefined', () => {
      const input = {
        ...validInput,
        image: undefined,
        terms: undefined,
        transport: undefined,
      };
      const result = mapToOffer(input, supplierId);
      
      expect(result.image).toBeUndefined();
      expect(result.terms).toBeUndefined();
      expect(result.transport).toBeUndefined();
    });
  });

  describe('Validation Errors', () => {
    it('should throw if supplierId is missing', () => {
      expect(() => mapToOffer(validInput, '')).toThrow(MappingValidationError);
      expect(() => mapToOffer(validInput, null as any)).toThrow(MappingValidationError);
      expect(() => mapToOffer(validInput, undefined as any)).toThrow(MappingValidationError);
    });

    it('should throw if vendorOfferId is missing', () => {
      const input = { ...validInput, vendorOfferId: undefined as any };
      expect(() => mapToOffer(input, supplierId)).toThrow(RequiredFieldError);
    });

    it('should throw if category is invalid', () => {
      const input = { ...validInput, category: 'invalid' };
      expect(() => mapToOffer(input, supplierId)).toThrow(RequiredFieldError);
    });

    it('should throw if title is missing', () => {
      const input = { ...validInput, title: '' };
      expect(() => mapToOffer(input, supplierId)).toThrow(RequiredFieldError);
    });

    it('should throw if from is missing', () => {
      const input = { ...validInput, from: '' };
      expect(() => mapToOffer(input, supplierId)).toThrow(RequiredFieldError);
    });

    it('should throw if to is missing', () => {
      const input = { ...validInput, to: '' };
      expect(() => mapToOffer(input, supplierId)).toThrow(RequiredFieldError);
    });

    it('should throw if startAt is invalid', () => {
      const input = { ...validInput, startAt: 'invalid-date' };
      expect(() => mapToOffer(input, supplierId)).toThrow(DateConversionError);
    });

    it('should throw if seatsTotal is invalid', () => {
      const input = { ...validInput, seatsTotal: -1 };
      expect(() => mapToOffer(input, supplierId)).toThrow(RequiredFieldError);
    });

    it('should throw if seatsLeft is invalid', () => {
      const input = { ...validInput, seatsLeft: 'invalid' as any };
      expect(() => mapToOffer(input, supplierId)).toThrow(RequiredFieldError);
    });

    it('should throw if seatsLeft > seatsTotal', () => {
      const input = { ...validInput, seatsTotal: 5, seatsLeft: 10 };
      expect(() => mapToOffer(input, supplierId)).toThrow(MappingValidationError);
    });

    it('should throw if price is missing', () => {
      const input = { 
        ...validInput, 
        price: undefined,
        priceMinor: undefined,
        amount: undefined,
        cost: undefined,
      };
      expect(() => mapToOffer(input, supplierId)).toThrow(RequiredFieldError);
    });

    it('should throw if price is invalid', () => {
      const input = { ...validInput, price: 'invalid' as any };
      expect(() => mapToOffer(input, supplierId)).toThrow(PriceConversionError);
    });

    it('should throw if price is negative', () => {
      const input = { ...validInput, price: -100 };
      expect(() => mapToOffer(input, supplierId)).toThrow(PriceConversionError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all categories', () => {
      const categories = ['tour', 'bus', 'flight', 'cruise'];
      
      categories.forEach(category => {
        const input = { ...validInput, category };
        const result = mapToOffer(input, supplierId);
        expect(result.category).toBe(category);
      });
    });

    it('should handle all supported currencies', () => {
      const currencies = ['TRY', 'EUR', 'USD'];
      
      currencies.forEach(currency => {
        const input = { ...validInput, currency };
        const result = mapToOffer(input, supplierId);
        expect(result.currency).toBe(currency);
      });
    });

    it('should handle price at boundary (100)', () => {
      const input = { ...validInput, price: 100 };
      const result = mapToOffer(input, supplierId);
      
      // 100 is assumed to be already in minor units
      expect(result.priceMinor).toBe(100);
    });

    it('should handle zero seats left', () => {
      const input = { ...validInput, seatsLeft: 0 };
      const result = mapToOffer(input, supplierId);
      
      expect(result.seatsLeft).toBe(0);
    });

    it('should handle extra unknown fields', () => {
      const input = { 
        ...validInput, 
        extraField1: 'value1',
        extraField2: 123,
        extraField3: { nested: 'object' },
      };
      
      const result = mapToOffer(input, supplierId);
      
      // Should not throw, extra fields stored in rawJson
      expect(JSON.parse(result.rawJson)).toHaveProperty('extraField1');
    });
  });
});

describe('mapToOfferBatch', () => {
  const supplierId = 'supplier-test-123';

  const validInput1: SupplierOfferInput = {
    vendorOfferId: 'TEST-001',
    category: 'tour',
    title: 'Tour 1',
    from: 'A',
    to: 'B',
    startAt: '2025-10-15T06:00:00Z',
    seatsTotal: 20,
    seatsLeft: 5,
    price: 100,
  };

  const validInput2: SupplierOfferInput = {
    vendorOfferId: 'TEST-002',
    category: 'bus',
    title: 'Bus 1',
    from: 'C',
    to: 'D',
    startAt: '2025-10-16T08:00:00Z',
    seatsTotal: 40,
    seatsLeft: 10,
    price: 50,
  };

  const invalidInput: SupplierOfferInput = {
    vendorOfferId: 'TEST-003',
    category: 'invalid',
    title: '',
    from: 'E',
    to: 'F',
    startAt: 'invalid-date',
    seatsTotal: -1,
    seatsLeft: 5,
    price: 'invalid' as any,
  };

  it('should process all valid inputs', () => {
    const result = mapToOfferBatch([validInput1, validInput2], supplierId);
    
    expect(result.successful.length).toBe(2);
    expect(result.failed.length).toBe(0);
    expect(result.successful[0].vendorOfferId).toBe('TEST-001');
    expect(result.successful[1].vendorOfferId).toBe('TEST-002');
  });

  it('should separate valid and invalid inputs', () => {
    const result = mapToOfferBatch(
      [validInput1, invalidInput, validInput2],
      supplierId
    );
    
    expect(result.successful.length).toBe(2);
    expect(result.failed.length).toBe(1);
    expect(result.failed[0].input.vendorOfferId).toBe('TEST-003');
    expect(result.failed[0].error).toBeTruthy();
  });

  it('should handle empty input array', () => {
    const result = mapToOfferBatch([], supplierId);
    
    expect(result.successful.length).toBe(0);
    expect(result.failed.length).toBe(0);
  });

  it('should handle all invalid inputs', () => {
    const result = mapToOfferBatch([invalidInput], supplierId);
    
    expect(result.successful.length).toBe(0);
    expect(result.failed.length).toBe(1);
  });
});

