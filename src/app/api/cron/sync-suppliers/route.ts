import { NextRequest, NextResponse } from 'next/server';
import { syncAllSuppliers } from '@/lib/jobs/syncService';

/**
 * GET /api/cron/sync-suppliers
 * Vercel Cron Job endpoint for syncing suppliers
 * 
 * Security: Protected by CRON_SECRET environment variable
 * 
 * Vercel cron.json example:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/sync-suppliers",
 *       "schedule": "* /15 * * * *"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('🔄 Cron endpoint triggered');

    const result = await syncAllSuppliers();

    return NextResponse.json(
      {
        success: true,
        message: 'Sync completed',
        ...result,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/sync-suppliers
 * Alternative endpoint for manual triggering
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

