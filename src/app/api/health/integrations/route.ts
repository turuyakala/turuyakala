import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/health/integrations
 * Get integration health status for all suppliers
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Get all active suppliers
    const suppliers = await prisma.supplier.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        integrationMode: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const now = new Date();
    const integrationHealth = [];

    for (const supplier of suppliers) {
      // Get last successful pull (sync_completed)
      const lastSuccessfulPull = await prisma.auditLog.findFirst({
        where: {
          supplierId: supplier.id,
          action: 'sync_completed',
          statusCode: 200,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
      });

      // Get last webhook (webhook_received)
      const lastWebhook = await prisma.auditLog.findFirst({
        where: {
          supplierId: supplier.id,
          action: 'webhook_received',
          statusCode: 200,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
      });

      // Calculate next cron time (if pull enabled)
      let nextCronTime = null;
      const isPullEnabled = supplier.integrationMode === 'pull';
      if (isPullEnabled) {
        // Simple calculation: assume every 15 minutes (can be enhanced with cron parser)
        const lastPullTime = lastSuccessfulPull?.createdAt || new Date(0);
        const minutesSinceLastPull = Math.floor((now.getTime() - lastPullTime.getTime()) / 60000);
        const cronInterval = 15; // minutes (from schedule)
        const minutesUntilNext = cronInterval - (minutesSinceLastPull % cronInterval);
        nextCronTime = new Date(now.getTime() + minutesUntilNext * 60000);
      }

      // Determine health status
      let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      let healthMessage = 'Normal';

      // Check if last pull was more than 1 hour ago (for pull-enabled suppliers)
      if (isPullEnabled) {
        const hoursSinceLastPull = lastSuccessfulPull
          ? (now.getTime() - lastSuccessfulPull.createdAt.getTime()) / (60 * 60 * 1000)
          : 999;

        if (hoursSinceLastPull > 2) {
          healthStatus = 'critical';
          healthMessage = `Son pull ${Math.floor(hoursSinceLastPull)} saat önce`;
        } else if (hoursSinceLastPull > 1) {
          healthStatus = 'warning';
          healthMessage = `Son pull ${Math.floor(hoursSinceLastPull)} saat önce`;
        }
      }

      // Check webhook health (for push-enabled suppliers)
      if (supplier.integrationMode === 'push') {
        const hoursSinceLastWebhook = lastWebhook
          ? (now.getTime() - lastWebhook.createdAt.getTime()) / (60 * 60 * 1000)
          : 999;

        if (hoursSinceLastWebhook > 24) {
          healthStatus = 'warning';
          healthMessage = `Son webhook ${Math.floor(hoursSinceLastWebhook)} saat önce`;
        }
      }

      integrationHealth.push({
        supplier: {
          id: supplier.id,
          name: supplier.name,
          integrationMode: supplier.integrationMode,
        },
        lastSuccessfulPull: lastSuccessfulPull?.createdAt || null,
        lastWebhook: lastWebhook?.createdAt || null,
        nextCronTime,
        healthStatus,
        healthMessage,
        pullEnabled: isPullEnabled,
      });
    }

    return NextResponse.json({
      integrationHealth,
      timestamp: now.toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('Integration health check error:', error);
    return NextResponse.json({
      error: 'Health check başarısız',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

