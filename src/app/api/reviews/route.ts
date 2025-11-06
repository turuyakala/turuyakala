import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/reviews
 * Get published reviews for homepage
 */
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isPublished: true,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Latest 10 reviews
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ error: 'Yorumlar yüklenemedi' }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Create a new review (requires auth + completed order)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, rating, comment } = body;

    // Validate
    if (!orderId || !rating || !comment) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Puan 1-5 arasında olmalıdır' }, { status: 400 });
    }

    if (comment.length < 10) {
      return NextResponse.json({ error: 'Yorum en az 10 karakter olmalıdır' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        paymentStatus: 'paid', // Only paid orders can be reviewed
      },
      include: {
        inventoryItem: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı veya ödeme tamamlanmadı' }, { status: 404 });
    }

    // Check if the order is for a tour (not flight, bus, or cruise)
    if (order.inventoryItem.category !== 'tour') {
      return NextResponse.json({ error: 'Sadece turlar için yorum yapabilirsiniz' }, { status: 400 });
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_orderId: {
          userId,
          orderId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Bu sipariş için zaten yorum yaptınız' }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        orderId,
        rating,
        comment,
        tourName: order.inventoryItem.title,
        isApproved: false,
        isPublished: false,
      },
    });

    return NextResponse.json({
      review,
      message: 'Yorumunuz alındı. Onay sonrası yayınlanacaktır.',
    }, { status: 201 });

  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json({ error: 'Yorum oluşturulamadı' }, { status: 500 });
  }
}

