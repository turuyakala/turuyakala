import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/profile/orders
 * Get user's orders with review status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get user's orders (only paid ones, only tours)
    const orders = await prisma.order.findMany({
      where: {
        userId,
        paymentStatus: 'paid',
        inventoryItem: {
          category: 'tour', // Only tours can be reviewed
        },
      },
      include: {
        inventoryItem: {
          select: {
            id: true,
            title: true,
            from: true,
            to: true,
            startAt: true,
            image: true,
            category: true,
          },
        },
        reviews: {
          where: {
            userId,
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            isApproved: true,
            isPublished: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Siparişler yüklenemedi' }, { status: 500 });
  }
}

