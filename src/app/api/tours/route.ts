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

    // Add price filter (convert to priceMinor: cents/kuruş)
    if (minPrice || maxPrice) {
      where.priceMinor = {};
      if (minPrice) where.priceMinor.gte = Math.round(parseFloat(minPrice) * 100);
      if (maxPrice) where.priceMinor.lte = Math.round(parseFloat(maxPrice) * 100);
    }

    // Determine sort order
    let orderBy: any = { startAt: 'asc' };
    
    switch (sort) {
      case 'departure-desc':
        orderBy = { startAt: 'desc' };
        break;
      case 'price-asc':
        orderBy = { priceMinor: 'asc' };
        break;
      case 'price-desc':
        orderBy = { priceMinor: 'desc' };
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
        priceMinor: true,
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

    // Parse contact JSON and convert priceMinor to price
    const parsedTours = tours.map(tour => {
      const { priceMinor, ...rest } = tour;
      return {
        ...rest,
        price: priceMinor / 100, // Convert minor units to major
        contact: tour.contact ? JSON.parse(tour.contact) : null,
      };
    });

    return NextResponse.json({ tours: parsedTours }, { status: 200 });
  } catch (error) {
    console.error('Tours fetch error:', error);
    return NextResponse.json({ error: 'Turlar yüklenemedi' }, { status: 500 });
  }
}

