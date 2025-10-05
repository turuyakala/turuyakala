import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseCSV, importRows, generateErrorCSV, ColumnMapping } from '@/lib/import/csvImportService';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/import/execute
 * Execute import with error CSV generation
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    
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

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'csv_import_started',
        entity: 'offer',
        userId: (session.user as any).id,
        supplierId,
        metadata: JSON.stringify({
          totalRows: parsed.data.length,
          mappedColumns: Object.keys(mapping).length,
        }),
      },
    });

    // Import rows
    const result = await importRows(parsed.data, mapping, supplierId);

    // Generate error CSV if there are errors
    let errorCSV = null;
    if (result.errors.length > 0) {
      errorCSV = generateErrorCSV(result.errors);
    }

    // Create completion audit log
    await prisma.auditLog.create({
      data: {
        action: result.success ? 'csv_import_completed' : 'csv_import_completed_with_errors',
        entity: 'offer',
        userId: (session.user as any).id,
        supplierId,
        statusCode: result.success ? 200 : 206,
        metadata: JSON.stringify({
          imported: result.imported,
          failed: result.failed,
          duration: Math.floor((Date.now() - startTime) / 1000),
        }),
      },
    });

    return NextResponse.json({
      success: result.success,
      imported: result.imported,
      failed: result.failed,
      errors: result.errors,
      errorCSV, // Base64 or plain text
    });

  } catch (error) {
    console.error('Import execution error:', error);

    // Create error audit log
    await prisma.auditLog.create({
      data: {
        action: 'csv_import_failed',
        entity: 'offer',
        userId: (session.user as any)?.id,
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: JSON.stringify({
          duration: Math.floor((Date.now() - startTime) / 1000),
        }),
      },
    });

    return NextResponse.json({
      error: 'Import başarısız',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

