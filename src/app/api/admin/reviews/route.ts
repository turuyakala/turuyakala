import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/admin/reviews
 * Get all reviews for admin moderation
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            pnrCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error('Admin reviews fetch error:', error);
    return NextResponse.json({ error: 'Yorumlar yüklenemedi' }, { status: 500 });
  }
}

