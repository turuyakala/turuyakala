import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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
  terms: z.string().optional(),
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
    const session = await getServerSession(authOptions);
    
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
    const session = await getServerSession(authOptions);
    
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
        terms: data.terms || null,
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
    const session = await getServerSession(authOptions);
    
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
