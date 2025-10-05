/**
 * Supplier Integration - Mapper Errors
 * Custom error classes for mapping operations
 */

import { ValidationError } from './types';

/**
 * Base error for mapping operations
 */
export class MapperError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MapperError';
  }
}

/**
 * Validation error thrown when required fields are missing or invalid
 */
export class MappingValidationError extends MapperError {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const errorMessages = errors
      .map((e) => `${e.field}: ${e.message}`)
      .join('; ');
    super(`Mapping validation failed: ${errorMessages}`);
    this.name = 'MappingValidationError';
    this.errors = errors;
  }
}

/**
 * Error thrown when price conversion fails
 */
export class PriceConversionError extends MapperError {
  constructor(value: any, field: string = 'price') {
    super(`Failed to convert price from field '${field}': ${value}`);
    this.name = 'PriceConversionError';
  }
}

/**
 * Error thrown when date conversion fails
 */
export class DateConversionError extends MapperError {
  constructor(value: any, field: string = 'startAt') {
    super(`Failed to convert date from field '${field}': ${value}`);
    this.name = 'DateConversionError';
  }
}

/**
 * Error thrown when required field is missing
 */
export class RequiredFieldError extends MapperError {
  constructor(field: string) {
    super(`Required field missing: ${field}`);
    this.name = 'RequiredFieldError';
  }
}

