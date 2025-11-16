import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/payment/status?orderId=xxx
 * Ödeme durumunu sorgular
 * 
 * Bu endpoint hem kullanıcılar hem de banka sistemi tarafından kullanılabilir
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transactionId');

    if (!orderId && !transactionId) {
      return NextResponse.json(
        { error: 'Sipariş ID veya Transaction ID gereklidir' },
        { status: 400 }
      );
    }

    // Find order
    const where: any = {};
    if (orderId) {
      where.id = orderId;
    } else if (transactionId) {
      where.transactionId = transactionId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        inventoryItem: {
          select: {
            title: true,
            from: true,
            to: true,
            startAt: true,
            currency: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    // Check authorization (if user is logged in, they can only see their own orders)
    if (session?.user && order.userId && order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu siparişe erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // TODO: Optionally verify with bank API for latest status
    // Örnek yapı (banka API'sine göre değişecek):
    // if (order.transactionId) {
    //   const bankResponse = await fetch(BANK_API_URL + `/payment/status/${order.transactionId}`, {
    //     headers: {
    //       'Authorization': `Bearer ${BANK_API_KEY}`,
    //     },
    //   });
    //   const bankData = await bankResponse.json();
    //   
    //   // Update order if status changed
    //   if (bankData.status !== order.paymentStatus) {
    //     await prisma.order.update({
    //       where: { id: order.id },
    //       data: { paymentStatus: bankData.status },
    //     });
    //   }
    // }

    return NextResponse.json({
      orderId: order.id,
      transactionId: order.transactionId,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      amount: order.totalPrice,
      currency: order.inventoryItem.currency || 'TRY',
      seats: order.seats,
      pnrCode: order.pnrCode,
      inventoryItemId: order.inventoryItemId, // Tur kartlarını güncellemek için
      tour: {
        title: order.inventoryItem.title,
        from: order.inventoryItem.from,
        to: order.inventoryItem.to,
        startAt: order.inventoryItem.startAt,
      },
      customer: {
        name: order.fullName,
        email: order.email,
        phone: order.phone,
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }, { status: 200 });

  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Ödeme durumu sorgulanırken bir hata oluştu' },
      { status: 500 }
    );
  }
}



