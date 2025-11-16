import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import crypto from 'crypto';
import { initBankPayment } from '@/lib/payment/bankIntegration';

const paymentInitSchema = z.object({
  orderId: z.string().min(1, 'Sipariş ID gereklidir'),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'bank_transfer'], {
    errorMap: () => ({ message: 'Geçerli bir ödeme yöntemi seçiniz' }),
  }),
  returnUrl: z.string().url().optional(), // Ödeme sonrası dönülecek URL
});

/**
 * POST /api/payment/init
 * Ödeme işlemini başlatır ve banka ödeme sistemine yönlendirme bilgilerini döner
 * 
 * Bu endpoint banka ödeme entegrasyonu için hazırlanmıştır.
 * Banka API'sine göre gerekli parametreler eklenebilir.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    // Validate input
    const validation = paymentInitSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { orderId, paymentMethod, returnUrl } = validation.data;

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        inventoryItem: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Bu sipariş zaten ödenmiştir' },
        { status: 400 }
      );
    }

    // Check if order belongs to user (if logged in)
    if (session?.user && order.userId && order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu siparişe erişim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Generate payment reference ID (unique identifier for this payment attempt)
    const paymentReferenceId = `PAY-${Date.now()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // Update order with payment method and reference
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod,
        transactionId: paymentReferenceId, // Temporary transaction ID, will be updated by bank callback
      },
    });

    // Prepare payment data for bank integration
    // Bu kısım banka API'sine göre özelleştirilecek
    const paymentData = {
      paymentReferenceId,
      orderId: order.id,
      amount: order.totalPrice, // in minor units (cents/kuruş)
      currency: order.inventoryItem.currency || 'TRY',
      customer: {
        name: order.fullName,
        email: order.email,
        phone: order.phone,
      },
      order: {
        title: order.inventoryItem.title,
        description: `${order.inventoryItem.from} → ${order.inventoryItem.to}`,
        seats: order.seats,
      },
      returnUrl: returnUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/callback?orderId=${orderId}`,
      cancelUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/cancel?orderId=${orderId}`,
    };

    // Call bank integration function
    const bankResponse = await initBankPayment(paymentData);

    if (!bankResponse.success) {
      return NextResponse.json(
        { error: bankResponse.error || 'Ödeme başlatılamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentReferenceId,
      orderId: order.id,
      amount: order.totalPrice,
      currency: order.inventoryItem.currency || 'TRY',
      paymentMethod,
      paymentUrl: bankResponse.paymentUrl,
      paymentForm: bankResponse.paymentForm,
      transactionId: bankResponse.transactionId,
    }, { status: 200 });

  } catch (error) {
    console.error('Payment init error:', error);
    return NextResponse.json(
      { error: 'Ödeme işlemi başlatılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

