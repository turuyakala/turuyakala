import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Public endpoint for fetching tours
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'departure-asc';

    // Get current date/time for filtering tours within 72 hours
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    // Build where clause
    const where: any = {
      category: 'tour',
      startAt: {
        gte: now,
        lte: windowEnd,
      },
    };

    // Add price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Determine sort order
    let orderBy: any = { startAt: 'asc' };
    
    switch (sort) {
      case 'departure-desc':
        orderBy = { startAt: 'desc' };
        break;
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'seats-asc':
        orderBy = { seatsLeft: 'asc' };
        break;
      case 'seats-desc':
        orderBy = { seatsLeft: 'desc' };
        break;
      default:
        orderBy = { startAt: 'asc' };
    }

    // Fetch tours
    const tours = await prisma.inventoryItem.findMany({
      where,
      orderBy,
      select: {
        id: true,
        category: true,
        title: true,
        from: true,
        to: true,
        startAt: true,
        seatsTotal: true,
        seatsLeft: true,
        price: true,
        currency: true,
        supplier: true,
        contact: true,
        image: true,
        transport: true,
        isSurprise: true,
        requiresVisa: true,
        requiresPassport: true,
        createdAt: true,
      },
    });

    // Parse contact JSON
    const parsedTours = tours.map(tour => ({
      ...tour,
      contact: tour.contact ? JSON.parse(tour.contact) : null,
    }));

    return NextResponse.json({ tours: parsedTours }, { status: 200 });
  } catch (error) {
    console.error('Tours fetch error:', error);
    return NextResponse.json({ error: 'Turlar yüklenemedi' }, { status: 500 });
  }
}

