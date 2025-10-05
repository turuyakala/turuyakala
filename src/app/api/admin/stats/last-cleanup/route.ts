import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Get last cleanup audit log
    const lastCleanup = await prisma.auditLog.findFirst({
      where: {
        action: 'cleanup_completed',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
        metadata: true,
      },
    });

    if (!lastCleanup) {
      return NextResponse.json({ lastCleanup: null });
    }

    let metadata = null;
    try {
      metadata = lastCleanup.metadata ? JSON.parse(lastCleanup.metadata) : null;
    } catch (error) {
      console.error('Failed to parse metadata:', error);
    }

    return NextResponse.json({
      lastCleanup: lastCleanup.createdAt,
      metadata,
    });

  } catch (error) {
    console.error('Last cleanup fetch error:', error);
    return NextResponse.json({ error: 'Veri yüklenemedi' }, { status: 500 });
  }
}

