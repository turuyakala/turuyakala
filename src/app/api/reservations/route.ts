import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const reservationSchema = z.object({
  tourId: z.string().min(1, 'Tur ID gereklidir'),
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  guests: z.number().min(1).max(20, 'Maksimum 20 kişi rezervasyon yapabilirsiniz'),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  userId: z.string().nullable().optional(),
});

/**
 * POST /api/reservations
 * Create a new reservation/order
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    
    // Validate input
    const validation = reservationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Fetch tour (try InventoryItem first, then Offer)
    let tour = await prisma.inventoryItem.findUnique({
      where: { id: data.tourId },
    });

    let inventoryItemId = data.tourId;
    let isFromOffer = false;

    if (!tour) {
      // Try Offer table
      const offer = await prisma.offer.findUnique({
        where: { id: data.tourId },
      });

      if (!offer) {
        return NextResponse.json({ error: 'Tur bulunamadı' }, { status: 404 });
      }

      // If Offer has inventoryItemId, use that
      if (offer.inventoryItemId) {
        tour = await prisma.inventoryItem.findUnique({
          where: { id: offer.inventoryItemId },
        });
        inventoryItemId = offer.inventoryItemId;
      } else {
        // Use Offer data directly (convert to InventoryItem format)
        tour = {
          ...offer,
          priceMinor: offer.priceMinor,
          price: offer.priceMinor / 100,
        } as any;
        isFromOffer = true;
      }
    }

    if (!tour) {
      return NextResponse.json({ error: 'Tur bulunamadı' }, { status: 404 });
    }

    // Check if enough seats available
    if (data.guests > tour.seatsLeft) {
      return NextResponse.json(
        { error: `Sadece ${tour.seatsLeft} koltuk kaldı` },
        { status: 400 }
      );
    }

    // Check if tour requires passport
    if ((tour.requiresPassport || tour.requiresVisa) && !data.passportNumber) {
      return NextResponse.json(
        { error: 'Bu tur için pasaport numarası gereklidir' },
        { status: 400 }
      );
    }

    // Calculate total price
    const priceMinor = tour.priceMinor || (tour.price ? tour.price * 100 : 0);
    const totalPriceMinor = priceMinor * data.guests;

    // Generate PNR code
    const pnrCode = `PNR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // If tour is from Offer and not imported, we need to create InventoryItem first
    if (isFromOffer && !tour.inventoryItemId) {
      // Get admin seller profile
      const adminUser = await prisma.user.findFirst({
        where: { role: 'admin' },
      });

      if (!adminUser) {
        return NextResponse.json({ error: 'Admin kullanıcı bulunamadı' }, { status: 500 });
      }

      let sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: adminUser.id },
      });

      if (!sellerProfile) {
        sellerProfile = await prisma.sellerProfile.create({
          data: {
            userId: adminUser.id,
            companyName: 'Admin',
            verified: true,
          },
        });
      }

      // Create InventoryItem from Offer
      const newInventoryItem = await prisma.inventoryItem.create({
        data: {
          sellerId: sellerProfile.id,
          supplierId: (tour as any).supplierId || null,
          vendorOfferId: (tour as any).vendorOfferId || null,
          category: tour.category,
          title: tour.title,
          from: tour.from,
          to: tour.to,
          startAt: tour.startAt,
          seatsTotal: tour.seatsTotal,
          seatsLeft: tour.seatsLeft,
          priceMinor: priceMinor,
          currency: tour.currency,
          transport: tour.transport || null,
          image: tour.image || null,
          terms: tour.terms || null,
          isSurprise: tour.isSurprise || false,
          requiresVisa: tour.requiresVisa || false,
          requiresPassport: tour.requiresPassport || false,
          status: 'active',
        },
      });

      inventoryItemId = newInventoryItem.id;

      // Update Offer with inventoryItemId
      await prisma.offer.update({
        where: { id: data.tourId },
        data: {
          inventoryItemId: newInventoryItem.id,
          importedToInventory: true,
        },
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: data.userId || null,
        inventoryItemId: inventoryItemId,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        seats: data.guests,
        totalPrice: totalPriceMinor,
        paymentStatus: 'pending', // Will be updated when payment is completed
        pnrCode: pnrCode,
        passportNumber: data.passportNumber || null,
        passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : null,
      },
    });

    // Update seats left
    await prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: {
        seatsLeft: {
          decrement: data.guests,
        },
      },
    });

    // If user is not logged in, create account for them
    let user = null;
    if (!data.userId && data.email) {
      // Check if user exists
      user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        // Create user account (without password, they can set it later)
        user = await prisma.user.create({
          data: {
            email: data.email,
            name: data.fullName,
            role: 'user',
          },
        });

        // Update order with userId
        await prisma.order.update({
          where: { id: order.id },
          data: {
            userId: user.id,
          },
        });
      }
    }

    return NextResponse.json({
      message: 'Rezervasyon başarıyla oluşturuldu',
      order: {
        ...order,
        pnrCode,
      },
      user: user ? { id: user.id, email: user.email } : null,
    }, { status: 201 });

  } catch (error) {
    console.error('Reservation creation error:', error);
    return NextResponse.json(
      { error: 'Rezervasyon oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}

