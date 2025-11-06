import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/import/csvImportService';
import { auth } from '@/lib/auth';

/**
 * POST /api/admin/import/parse
 * Parse CSV file and return columns + preview
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    const parsed = parseCSV(fileContent);

    if (parsed.errors.length > 0) {
      return NextResponse.json({
        error: 'CSV parse hatası',
        details: parsed.errors,
      }, { status: 400 });
    }

    // Get columns
    const columns = parsed.meta.fields || [];

    // Get preview (first 5 rows)
    const preview = parsed.data.slice(0, 5);

    return NextResponse.json({
      success: true,
      columns,
      preview,
      totalRows: parsed.data.length,
      fileContent, // Send back for later import
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({
      error: 'Parse işlemi başarısız',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

