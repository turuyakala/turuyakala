/**
 * Price Helper Tests
 * Test cases for price formatting utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  formatPrice,
  formatPriceWithDecimals,
  formatPriceCompact,
  formatPriceRange,
  getCurrencySymbol,
  minorToMajor,
} from '../price';

describe('Price Helpers', () => {
  describe('minorToMajor', () => {
    it('should convert kuruş to TRY', () => {
      expect(minorToMajor(280000)).toBe(2800);
      expect(minorToMajor(5000)).toBe(50);
      expect(minorToMajor(100)).toBe(1);
    });

    it('should handle zero', () => {
      expect(minorToMajor(0)).toBe(0);
    });

    it('should handle large numbers', () => {
      expect(minorToMajor(50000000)).toBe(500000); // 500k TRY
    });
  });

  describe('formatPrice', () => {
    it('should format TRY with proper separators', () => {
      expect(formatPrice(280000, 'TRY')).toBe('2.800 ₺');
      expect(formatPrice(5000, 'TRY')).toBe('50 ₺');
      expect(formatPrice(120000, 'TRY')).toBe('1.200 ₺');
      expect(formatPrice(1500000, 'TRY')).toBe('15.000 ₺');
    });

    it('should format USD with proper separators', () => {
      expect(formatPrice(150000, 'USD')).toBe('$1,500');
      expect(formatPrice(5000, 'USD')).toBe('$50');
    });

    it('should format EUR with proper separators', () => {
      expect(formatPrice(200000, 'EUR')).toBe('2.000 €');
      expect(formatPrice(5000, 'EUR')).toBe('50 €');
    });

    it('should default to TRY', () => {
      expect(formatPrice(100000)).toBe('1.000 ₺');
    });

    it('should handle zero', () => {
      expect(formatPrice(0, 'TRY')).toBe('0 ₺');
    });
  });

  describe('formatPriceWithDecimals', () => {
    it('should format TRY with decimals', () => {
      expect(formatPriceWithDecimals(285000, 'TRY')).toBe('2.850,00 ₺');
      expect(formatPriceWithDecimals(5050, 'TRY')).toBe('50,50 ₺');
    });

    it('should format USD with decimals', () => {
      expect(formatPriceWithDecimals(150050, 'USD')).toBe('$1,500.50');
    });

    it('should show .00 for whole numbers', () => {
      expect(formatPriceWithDecimals(100000, 'TRY')).toBe('1.000,00 ₺');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct symbols', () => {
      expect(getCurrencySymbol('TRY')).toBe('₺');
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('should default to TRY', () => {
      expect(getCurrencySymbol()).toBe('₺');
    });
  });

  describe('formatPriceCompact', () => {
    it('should format large numbers compactly', () => {
      expect(formatPriceCompact(500000000, 'TRY')).toContain('M'); // 5M ₺
      expect(formatPriceCompact(250000000, 'TRY')).toContain('M'); // 2,5M ₺
    });

    it('should not compact small numbers', () => {
      expect(formatPriceCompact(50000, 'TRY')).toBe('500 ₺');
    });
  });

  describe('formatPriceRange', () => {
    it('should format price range', () => {
      expect(formatPriceRange(100000, 200000, 'TRY')).toBe('1.000 - 2.000 ₺');
      expect(formatPriceRange(5000, 10000, 'TRY')).toBe('50 - 100 ₺');
    });

    it('should handle different currencies', () => {
      expect(formatPriceRange(100000, 200000, 'USD')).toBe('$1,000 - 2,000');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle tour prices', () => {
      // Kapadokya Balon Turu: 2800 TRY
      const tourPrice = 280000; // kuruş
      expect(formatPrice(tourPrice, 'TRY')).toBe('2.800 ₺');
    });

    it('should handle flight prices', () => {
      // İstanbul-Antalya: 450 TRY
      const flightPrice = 45000; // kuruş
      expect(formatPrice(flightPrice, 'TRY')).toBe('450 ₺');
    });

    it('should handle bus prices', () => {
      // İstanbul-Ankara: 350 TRY
      const busPrice = 35000; // kuruş
      expect(formatPrice(busPrice, 'TRY')).toBe('350 ₺');
    });

    it('should handle multi-person reservations', () => {
      const singlePrice = 280000; // 2800 TRY
      const guests = 3;
      const totalMinor = (singlePrice / 100) * guests * 100; // 840000 kuruş
      expect(formatPrice(totalMinor, 'TRY')).toBe('8.400 ₺');
    });
  });
});

