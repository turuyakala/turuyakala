import { NextResponse } from 'next/server';
import { getRecentErrorCount, getRecentErrorsByAction } from '@/lib/audit/auditLogger';
import { auth } from '@/lib/auth';

/**
 * GET /api/admin/dashboard/error-flag
 * Get error flag for dashboard (last 24h errors)
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Get error count for last 24 hours
    const errorCount = await getRecentErrorCount(24);

    // Get errors by action
    const errorsByAction = await getRecentErrorsByAction(24);

    // Determine severity
    let severity: 'none' | 'warning' | 'critical' = 'none';
    if (errorCount > 50) {
      severity = 'critical';
    } else if (errorCount > 10) {
      severity = 'warning';
    }

    return NextResponse.json({
      errorCount,
      severity,
      errorsByAction: errorsByAction.slice(0, 5), // Top 5
    }, { status: 200 });

  } catch (error) {
    console.error('Error flag fetch error:', error);
    return NextResponse.json({ error: 'Veri yüklenemedi' }, { status: 500 });
  }
}

