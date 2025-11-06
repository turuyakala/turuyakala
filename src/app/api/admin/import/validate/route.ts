import { NextRequest, NextResponse } from 'next/server';
import { parseCSV, validateRow, ColumnMapping } from '@/lib/import/csvImportService';
import { auth } from '@/lib/auth';

/**
 * POST /api/admin/import/validate
 * Validate CSV data with column mapping
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await request.json();
    const { fileContent, mapping, supplierId } = body;

    if (!fileContent || !mapping || !supplierId) {
      return NextResponse.json({
        error: 'Eksik parametreler',
      }, { status: 400 });
    }

    // Parse CSV
    const parsed = parseCSV(fileContent);

    if (parsed.errors.length > 0) {
      return NextResponse.json({
        error: 'CSV parse hatası',
        details: parsed.errors,
      }, { status: 400 });
    }

    // Validate all rows
    const allErrors = [];
    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i];
      const rowNumber = i + 2; // +2 for 1-indexed + header
      const errors = validateRow(row, mapping, rowNumber);
      allErrors.push(...errors);
    }

    const validRows = parsed.data.length - allErrors.length;

    return NextResponse.json({
      success: true,
      totalRows: parsed.data.length,
      validRows,
      invalidRows: allErrors.length,
      errors: allErrors,
      // Send preview of errors (first 10)
      errorPreview: allErrors.slice(0, 10),
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({
      error: 'Validasyon başarısız',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

