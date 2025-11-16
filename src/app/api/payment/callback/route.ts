import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyBankSignature } from '@/lib/payment/bankIntegration';

/**
 * POST /api/payment/callback
 * Banka ödeme sisteminden gelen callback/webhook isteklerini işler
 * 
 * Bu endpoint banka ödeme entegrasyonu için hazırlanmıştır.
 * Banka API'sine göre gerekli doğrulamalar ve işlemler eklenebilir.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = request.headers;

    // Parse bank response first to get orderId for logging
    const {
      paymentReferenceId,
      orderId,
      transactionId, // Banka transaction ID
      status, // success, failed, cancelled
      amount,
      currency,
      paymentMethod,
      timestamp,
      // Banka API'sinden gelebilecek diğer alanlar
    } = body;

    // Verify bank webhook signature
    const signature = headers.get('X-Bank-Signature') || headers.get('x-bank-signature');
    const webhookSecret = process.env.BANK_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const rawBody = JSON.stringify(body);
      const isValid = verifyBankSignature(rawBody, signature, webhookSecret);
      
      if (!isValid) {
        await prisma.auditLog.create({
          data: {
            action: 'payment_callback_rejected',
            entity: 'order',
            entityId: orderId || null,
            statusCode: 401,
            error: 'Invalid signature',
          },
        });
        
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    if (!paymentReferenceId || !orderId || !status) {
      return NextResponse.json(
        { error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        inventoryItem: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    // Verify payment reference matches
    if (order.transactionId !== paymentReferenceId) {
      return NextResponse.json(
        { error: 'Geçersiz ödeme referansı' },
        { status: 400 }
      );
    }

    // Update order based on payment status
    let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' = 'pending';
    
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'paid':
        paymentStatus = 'paid';
        
        // Update order
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            transactionId: transactionId || paymentReferenceId,
            paymentMethod: paymentMethod || order.paymentMethod,
          },
        });

        // Note: Seats are already decremented when reservation was created
        // If payment fails, seats should be restored (handled in failed case)

        break;

      case 'failed':
      case 'error':
      case 'rejected':
        paymentStatus = 'failed';
        
        // Restore seats if payment failed
        await prisma.inventoryItem.update({
          where: { id: order.inventoryItemId },
          data: {
            seatsLeft: {
              increment: order.seats,
            },
          },
        });

        // Update order
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'failed',
            transactionId: transactionId || paymentReferenceId,
          },
        });

        break;

      case 'cancelled':
      case 'canceled':
        paymentStatus = 'failed';
        
        // Restore seats
        await prisma.inventoryItem.update({
          where: { id: order.inventoryItemId },
          data: {
            seatsLeft: {
              increment: order.seats,
            },
          },
        });

        // Update order
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'failed',
            transactionId: transactionId || paymentReferenceId,
          },
        });

        break;

      default:
        // Keep as pending for unknown statuses
        paymentStatus = 'pending';
    }

    // Log payment callback
    await prisma.auditLog.create({
      data: {
        action: 'payment_callback',
        entity: 'order',
        entityId: orderId,
        statusCode: 200,
        metadata: JSON.stringify({
          paymentReferenceId,
          transactionId,
          status,
          amount,
          currency,
          paymentMethod,
          timestamp,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Ödeme durumu güncellendi',
      orderId,
      paymentStatus,
    }, { status: 200 });

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { error: 'Ödeme callback işlenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/callback
 * Ödeme sonrası kullanıcı yönlendirmesi için
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');

  if (!orderId) {
    return NextResponse.redirect(
      new URL('/payment/error?message=Sipariş ID bulunamadı', request.url)
    );
  }

  // Redirect to success or error page based on status
  if (status === 'success' || status === 'completed') {
    return NextResponse.redirect(
      new URL(`/reservation/${orderId}/success`, request.url)
    );
  } else {
    return NextResponse.redirect(
      new URL(`/payment/error?orderId=${orderId}`, request.url)
    );
  }
}

