import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PUT /api/admin/reviews/[id]
 * Update review approval/publish status
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { isApproved, isPublished, rating, comment, tourName } = body;

    const updateData: any = {};
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (tourName !== undefined) updateData.tourName = tourName;

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
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
    const session = await auth();
    
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

