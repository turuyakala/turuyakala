import { prisma } from '@/lib/prisma';

/**
 * Cleanup Service
 * Runs hourly to mark expired and sold out offers
 */

export async function cleanupExpiredOffers(): Promise<{
  expired: number;
  soldOut: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    console.log('🧹 Starting cleanup: Expired & Sold Out offers...');

    const now = new Date();

    // Mark offers with startAt < now as EXPIRED
    const expiredResult = await prisma.offer.updateMany({
      where: {
        startAt: {
          lt: now,
        },
        status: {
          in: ['new', 'imported', 'active'],
        },
      },
      data: {
        status: 'expired',
      },
    });

    console.log(`⏰ Marked ${expiredResult.count} offers as EXPIRED (startAt < now)`);

    // Mark offers with availableSeats <= 0 as SOLD_OUT
    const soldOutResult = await prisma.offer.updateMany({
      where: {
        availableSeats: {
          lte: 0,
        },
        status: {
          in: ['new', 'imported', 'active'],
        },
      },
      data: {
        status: 'sold_out',
      },
    });

    console.log(`🎟️ Marked ${soldOutResult.count} offers as SOLD_OUT (availableSeats <= 0)`);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'cleanup_completed',
        entity: 'offer',
        statusCode: 200,
        metadata: JSON.stringify({
          expired: expiredResult.count,
          soldOut: soldOutResult.count,
          duration: Math.floor((Date.now() - startTime) / 1000),
        }),
      },
    });

    console.log(`✅ Cleanup completed: ${expiredResult.count} expired, ${soldOutResult.count} sold out`);

    return {
      expired: expiredResult.count,
      soldOut: soldOutResult.count,
    };

  } catch (error) {
    console.error('❌ Cleanup error:', error);

    // Log error
    await prisma.auditLog.create({
      data: {
        action: 'cleanup_failed',
        entity: 'offer',
        statusCode: 500,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: JSON.stringify({
          duration: Math.floor((Date.now() - startTime) / 1000),
        }),
      },
    });

    return {
      expired: 0,
      soldOut: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

