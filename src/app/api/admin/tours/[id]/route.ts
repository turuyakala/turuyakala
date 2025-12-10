import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const tourSchema = z.object({
  category: z.enum(['tour', 'bus', 'flight', 'cruise']),
  title: z.string().min(5, 'Başlık en az 5 karakter olmalıdır'),
  from: z.string().min(2),
  to: z.string().min(2),
  startAt: z.string(),
  seatsTotal: z.number().min(1),
  seatsLeft: z.number().min(0),
  price: z.number().min(0), // Will be converted to priceMinor (cents/kuruş)
  currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  supplierId: z.string().optional().or(z.literal('')), // Optional supplier integration
  vendorOfferId: z.string().optional().or(z.literal('')), // Vendor's unique offer ID
  transport: z.string().optional(),
  contact: z.object({
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
  }).optional(),
  image: z.string().optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  terms: z.string().optional(),
  description: z.string().optional(),
  program: z.array(z.string()).optional(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
  importantInfo: z.array(z.string()).optional(),
  departureLocation: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  roomRules: z.array(z.string()).optional(),
  petFriendly: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  flightInfo: z.object({
    airline: z.string().optional(),
    flightNumber: z.string().optional(),
    departureAirport: z.string().optional(),
    arrivalAirport: z.string().optional(),
    departureTime: z.string().optional(),
    arrivalTime: z.string().optional(),
  }).optional(),
  isSurprise: z.boolean().default(false),
  requiresVisa: z.boolean().optional(),
  requiresPassport: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'expired', 'sold_out']).default('active'),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get single tour
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;
    
    const tour = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!tour) {
      return NextResponse.json({ error: 'Tur bulunamadı' }, { status: 404 });
    }

    // Parse contact JSON and convert priceMinor to price
    const parsedTour = {
      ...tour,
      contact: tour.contact ? JSON.parse(tour.contact as string) : null,
      price: tour.priceMinor / 100, // Convert minor units to major
      description: tour.description || null,
      images: tour.images || null,
      program: tour.program || null,
      included: tour.included || null,
      excluded: tour.excluded || null,
      importantInfo: tour.importantInfo || null,
      departureLocation: tour.departureLocation || null,
      checkInTime: tour.checkInTime || null,
      checkOutTime: tour.checkOutTime || null,
      roomRules: tour.roomRules || null,
      petFriendly: tour.petFriendly || false,
      languages: tour.languages || null,
      paymentMethods: tour.paymentMethods || null,
      flightInfo: tour.flightInfo || null,
    };

    return NextResponse.json(parsedTour, { status: 200 });
  } catch (error) {
    console.error('Tour fetch error:', error);
    return NextResponse.json({ error: 'Tur yüklenemedi' }, { status: 500 });
  }
}

// PATCH - Update tour
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const validation = tourSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Convert price to priceMinor (cents/kuruş)
    const priceMinor = Math.round(data.price * 100);

    // Update tour
    const tour = await prisma.inventoryItem.update({
      where: { id },
      data: {
        supplierId: data.supplierId || null,
        vendorOfferId: data.vendorOfferId || null,
        category: data.category,
        title: data.title,
        from: data.from,
        to: data.to,
        startAt: new Date(data.startAt),
        seatsTotal: data.seatsTotal,
        seatsLeft: data.seatsLeft,
        priceMinor: priceMinor,
        currency: data.currency,
        transport: data.transport || null,
        contact: data.contact ? JSON.stringify(data.contact) : null,
        image: data.image || null,
        images: data.images ? JSON.stringify(data.images) : null,
        terms: data.terms || null,
        description: data.description || null,
        program: data.program ? JSON.stringify(data.program) : null,
        included: data.included ? JSON.stringify(data.included) : null,
        excluded: data.excluded ? JSON.stringify(data.excluded) : null,
        importantInfo: data.importantInfo ? JSON.stringify(data.importantInfo) : null,
        departureLocation: data.departureLocation ? JSON.stringify(data.departureLocation) : null,
        checkInTime: data.checkInTime || null,
        checkOutTime: data.checkOutTime || null,
        roomRules: data.roomRules ? JSON.stringify(data.roomRules) : null,
        petFriendly: data.petFriendly || false,
        languages: data.languages ? JSON.stringify(data.languages) : null,
        paymentMethods: data.paymentMethods ? JSON.stringify(data.paymentMethods) : null,
        flightInfo: data.flightInfo ? JSON.stringify(data.flightInfo) : null,
        isSurprise: data.isSurprise || false,
        requiresVisa: data.requiresVisa || false,
        requiresPassport: data.requiresPassport || false,
        status: data.status || 'active',
      },
    });

    return NextResponse.json(
      { message: 'Tur güncellendi', tour },
      { status: 200 }
    );
  } catch (error) {
    console.error('Tour update error:', error);
    return NextResponse.json({ error: 'Tur güncellenirken hata oluştu' }, { status: 500 });
  }
}

// DELETE - Delete tour
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;

    await prisma.inventoryItem.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Tur silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Tour delete error:', error);
    return NextResponse.json({ error: 'Tur silinirken hata oluştu' }, { status: 500 });
  }
}
