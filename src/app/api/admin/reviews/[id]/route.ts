import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PUT /api/admin/reviews/[id]
 * Update review approval/publish status
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { isApproved, isPublished } = body;

    const review = await prisma.review.update({
      where: { id },
      data: {
        isApproved: isApproved !== undefined ? isApproved : undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined,
      },
    });

    return NextResponse.json({ review }, { status: 200 });
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json({ error: 'Yorum güncellenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Delete a review
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Yorum silindi' }, { status: 200 });
  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json({ error: 'Yorum silinemedi' }, { status: 500 });
  }
}

