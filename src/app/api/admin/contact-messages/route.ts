import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/admin/contact-messages
 * Get all contact messages for admin
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause = status ? { status } : {};

    const messages = await prisma.contactMessage.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Contact messages fetch error:', error);
    return NextResponse.json({ error: 'Mesajlar yüklenemedi' }, { status: 500 });
  }
}
