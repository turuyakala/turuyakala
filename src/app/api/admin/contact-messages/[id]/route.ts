import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * PUT /api/admin/contact-messages/[id]
 * Update contact message status or add admin reply
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminReply } = body;

    const adminUserId = (session.user as any).id;

    // Check if message exists
    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 });
    }

    // Update message
    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminReply && { 
          adminReply,
          repliedAt: new Date(),
          repliedBy: adminUserId,
        }),
      },
    });

    return NextResponse.json({ 
      message: 'Mesaj güncellendi',
      contactMessage: updatedMessage,
    }, { status: 200 });

  } catch (error) {
    console.error('Contact message update error:', error);
    return NextResponse.json({ error: 'Mesaj güncellenemedi' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/contact-messages/[id]
 * Delete contact message
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if message exists
    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 });
    }

    // Delete message
    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: 'Mesaj silindi',
    }, { status: 200 });

  } catch (error) {
    console.error('Contact message delete error:', error);
    return NextResponse.json({ error: 'Mesaj silinemedi' }, { status: 500 });
  }
}
