import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredOffers } from '@/lib/jobs/cleanupService';

/**
 * GET /api/cron/cleanup
 * Cron Job endpoint for cleaning up expired/sold out offers
 * 
 * Security: Protected by CRON_SECRET environment variable
 * 
 * Can be triggered by AWS EventBridge or similar cloud cron services
 * Schedule: hourly
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

    console.log('🔄 Cleanup cron endpoint triggered');

    const result = await cleanupExpiredOffers();

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          ...result,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cleanup completed',
        ...result,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Cleanup cron error:', error);
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
 * POST /api/cron/cleanup
 * Alternative endpoint for manual triggering
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

