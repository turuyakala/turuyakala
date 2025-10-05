import Papa from 'papaparse';
import { prisma } from '@/lib/prisma';

export type ColumnMapping = {
  [csvColumn: string]: string; // csvColumn -> dbField
};

export type ValidationError = {
  row: number;
  field: string;
  value: any;
  error: string;
};

export type ImportResult = {
  success: boolean;
  imported: number;
  failed: number;
  errors: ValidationError[];
};

/**
 * Parse CSV file
 */
export function parseCSV(fileContent: string): Papa.ParseResult<any> {
  return Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // Keep everything as string for validation
  });
}

/**
 * Validate single row
 */
export function validateRow(row: any, mapping: ColumnMapping, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  const requiredFields = ['title', 'category', 'startLocation', 'endLocation', 'startAt', 'price', 'currency'];

  for (const dbField of requiredFields) {
    const csvColumn = Object.keys(mapping).find(key => mapping[key] === dbField);
    if (!csvColumn || !row[csvColumn] || row[csvColumn].trim() === '') {
      errors.push({
        row: rowNumber,
        field: dbField,
        value: row[csvColumn] || '',
        error: `${dbField} alanı zorunludur`,
      });
    }
  }

  // Validate category
  const categoryColumn = Object.keys(mapping).find(key => mapping[key] === 'category');
  if (categoryColumn && row[categoryColumn]) {
    const validCategories = ['tours', 'flights', 'buses', 'ships'];
    if (!validCategories.includes(row[categoryColumn].toLowerCase())) {
      errors.push({
        row: rowNumber,
        field: 'category',
        value: row[categoryColumn],
        error: `Geçersiz kategori. Olası değerler: ${validCategories.join(', ')}`,
      });
    }
  }

  // Validate price
  const priceColumn = Object.keys(mapping).find(key => mapping[key] === 'price');
  if (priceColumn && row[priceColumn]) {
    const price = parseFloat(row[priceColumn]);
    if (isNaN(price) || price <= 0) {
      errors.push({
        row: rowNumber,
        field: 'price',
        value: row[priceColumn],
        error: 'Fiyat geçerli bir pozitif sayı olmalıdır',
      });
    }
  }

  // Validate currency
  const currencyColumn = Object.keys(mapping).find(key => mapping[key] === 'currency');
  if (currencyColumn && row[currencyColumn]) {
    const validCurrencies = ['TRY', 'USD', 'EUR'];
    if (!validCurrencies.includes(row[currencyColumn].toUpperCase())) {
      errors.push({
        row: rowNumber,
        field: 'currency',
        value: row[currencyColumn],
        error: `Geçersiz para birimi. Olası değerler: ${validCurrencies.join(', ')}`,
      });
    }
  }

  // Validate dates
  const startAtColumn = Object.keys(mapping).find(key => mapping[key] === 'startAt');
  if (startAtColumn && row[startAtColumn]) {
    const date = new Date(row[startAtColumn]);
    if (isNaN(date.getTime())) {
      errors.push({
        row: rowNumber,
        field: 'startAt',
        value: row[startAtColumn],
        error: 'Geçersiz tarih formatı (ISO 8601 bekleniyor: YYYY-MM-DD veya YYYY-MM-DDTHH:mm:ss)',
      });
    }
  }

  const endAtColumn = Object.keys(mapping).find(key => mapping[key] === 'endAt');
  if (endAtColumn && row[endAtColumn]) {
    const date = new Date(row[endAtColumn]);
    if (isNaN(date.getTime())) {
      errors.push({
        row: rowNumber,
        field: 'endAt',
        value: row[endAtColumn],
        error: 'Geçersiz tarih formatı',
      });
    }
  }

  // Validate seats
  const seatsColumn = Object.keys(mapping).find(key => mapping[key] === 'availableSeats');
  if (seatsColumn && row[seatsColumn]) {
    const seats = parseInt(row[seatsColumn]);
    if (isNaN(seats) || seats < 0) {
      errors.push({
        row: rowNumber,
        field: 'availableSeats',
        value: row[seatsColumn],
        error: 'Koltuk sayısı geçerli bir pozitif tamsayı olmalıdır',
      });
    }
  }

  return errors;
}

/**
 * Map row data to Offer format
 */
export function mapRowToOffer(row: any, mapping: ColumnMapping, supplierId: string): any {
  const getMappedValue = (dbField: string) => {
    const csvColumn = Object.keys(mapping).find(key => mapping[key] === dbField);
    return csvColumn ? row[csvColumn] : undefined;
  };

  const price = parseFloat(getMappedValue('price') || '0');
  const priceMinor = Math.round(price * 100); // Convert to minor units

  return {
    vendorOfferId: getMappedValue('vendorOfferId') || `CSV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    supplierId,
    title: getMappedValue('title')?.trim(),
    description: getMappedValue('description')?.trim() || null,
    category: getMappedValue('category')?.toLowerCase(),
    startLocation: getMappedValue('startLocation')?.trim(),
    endLocation: getMappedValue('endLocation')?.trim(),
    startAt: new Date(getMappedValue('startAt')),
    endAt: getMappedValue('endAt') ? new Date(getMappedValue('endAt')) : new Date(new Date(getMappedValue('startAt')).getTime() + 8 * 60 * 60 * 1000), // +8 hours default
    priceMinor,
    currency: getMappedValue('currency')?.toUpperCase() || 'TRY',
    availableSeats: parseInt(getMappedValue('availableSeats') || '1'),
    images: getMappedValue('images') ? getMappedValue('images').split(',').map((img: string) => img.trim()) : [],
    highlights: getMappedValue('highlights') ? getMappedValue('highlights').split('|').map((h: string) => h.trim()) : [],
    included: getMappedValue('included') ? getMappedValue('included').split('|').map((i: string) => i.trim()) : [],
    excluded: getMappedValue('excluded') ? getMappedValue('excluded').split('|').map((e: string) => e.trim()) : [],
    importedToInventory: false,
    status: 'new',
  };
}

/**
 * Import rows to database
 */
export async function importRows(
  rows: any[],
  mapping: ColumnMapping,
  supplierId: string
): Promise<ImportResult> {
  const errors: ValidationError[] = [];
  let imported = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +2 because: 1-indexed + 1 for header

    // Validate
    const rowErrors = validateRow(row, mapping, rowNumber);
    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      continue;
    }

    // Map and import
    try {
      const offerData = mapRowToOffer(row, mapping, supplierId);

      await prisma.offer.upsert({
        where: {
          vendor_offer_unique: {
            vendorOfferId: offerData.vendorOfferId,
            supplierId: offerData.supplierId,
          },
        },
        create: offerData,
        update: offerData,
      });

      imported++;
    } catch (error) {
      errors.push({
        row: rowNumber,
        field: 'database',
        value: '',
        error: error instanceof Error ? error.message : 'Database error',
      });
    }
  }

  return {
    success: errors.length === 0,
    imported,
    failed: errors.length,
    errors,
  };
}

/**
 * Generate error CSV
 */
export function generateErrorCSV(errors: ValidationError[]): string {
  const headers = ['Satır', 'Alan', 'Değer', 'Hata'];
  const rows = errors.map(err => [
    err.row,
    err.field,
    err.value,
    err.error,
  ]);

  return Papa.unparse({
    fields: headers,
    data: rows,
  });
}

