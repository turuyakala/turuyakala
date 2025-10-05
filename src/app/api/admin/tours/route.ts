import { NextRequest, NextResponse } from 'next/server';
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

// GET - List all tours with search and sort
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'startAt';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Note: SQLite doesn't support case-insensitive search, so we fetch all and filter in memory
    const where = {};

    let tours = await prisma.inventoryItem.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        seller: {
          select: {
            companyName: true,
          },
        },
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    // Filter by search in memory (SQLite doesn't support case-insensitive contains)
    if (search) {
      const searchLower = search.toLowerCase();
      tours = tours.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.from.toLowerCase().includes(searchLower) ||
        t.to.toLowerCase().includes(searchLower)
      );
    }

    // Convert priceMinor to price for display
    const toursWithPrice = tours.map(tour => ({
      ...tour,
      price: tour.priceMinor / 100, // Convert minor units to major
    }));

    return NextResponse.json({ tours: toursWithPrice }, { status: 200 });
  } catch (error) {
    console.error('Tours fetch error:', error);
    return NextResponse.json({ error: 'Turlar yüklenemedi' }, { status: 500 });
  }
}

// POST - Create new tour
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

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

    // Get or create admin seller profile
    let sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!sellerProfile) {
      sellerProfile = await prisma.sellerProfile.create({
        data: {
          userId: (session.user as any).id,
          companyName: 'Admin',
          verified: true,
        },
      });
    }

    // Convert price to priceMinor (cents/kuruş)
    const priceMinor = Math.round(data.price * 100);

    // Create tour
    const tour = await prisma.inventoryItem.create({
      data: {
        sellerId: sellerProfile.id,
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
      { message: 'Tur başarıyla eklendi', tour },
      { status: 201 }
    );
  } catch (error) {
    console.error('Tour creation error:', error);
    return NextResponse.json(
      { error: 'Tur eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

