import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusCode = searchParams.get('statusCode');
    const actor = searchParams.get('actor');
    const timeRange = searchParams.get('timeRange') || '24h';

    // Calculate time range
    const timeRanges: Record<string, number> = {
      '1h': 1,
      '24h': 24,
      '7d': 7 * 24,
      '30d': 30 * 24,
    };

    const hours = timeRanges[timeRange] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Build where clause
    const where: any = {
      createdAt: {
        gte: since,
      },
    };

    // Status code filter
    if (statusCode === '4xx') {
      where.statusCode = { gte: 400, lt: 500 };
    } else if (statusCode === '5xx') {
      where.statusCode = { gte: 500 };
    } else if (statusCode) {
      where.statusCode = parseInt(statusCode);
    } else {
      // Default: only errors (4xx and 5xx)
      where.statusCode = { gte: 400 };
    }

    // Actor filter
    if (actor && actor !== 'all') {
      where.actor = actor;
    }

    const errors = await prisma.auditLog.findMany({
      where,
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to 100 most recent
    });

    return NextResponse.json({ errors }, { status: 200 });
  } catch (error) {
    console.error('Errors fetch error:', error);
    return NextResponse.json({ error: 'Hatalar yüklenemedi' }, { status: 500 });
  }
}

