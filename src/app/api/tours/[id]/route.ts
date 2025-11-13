import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Public endpoint for fetching a single tour
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    // Try Offer table first (new schema)
    let tour = await prisma.offer.findUnique({
      where: { id },
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
        image: true,
        transport: true,
        isSurprise: true,
        requiresVisa: true,
        requiresPassport: true,
        createdAt: true,
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    // Fallback to InventoryItem if not found in Offer
    if (!tour) {
      tour = await prisma.inventoryItem.findUnique({
        where: { id },
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
          terms: true,
          image: true,
          transport: true,
          isSurprise: true,
          requiresVisa: true,
          requiresPassport: true,
          createdAt: true,
        },
      }) as any;
    }

    if (!tour) {
      return NextResponse.json({ error: 'Tur bulunamadı' }, { status: 404 });
    }

    // Parse and format response
    const parsedTour = {
      ...tour,
      seatsLeft: tour.seatsLeft,
      supplier: tour.supplier?.name || (tour as any).supplier || 'TuruYakala',
    };
    
    // Remove priceMinor from response if exists
    const { priceMinor, ...tourResponse } = parsedTour;

    return NextResponse.json(tourResponse, { status: 200 });
  } catch (error) {
    console.error('Tour fetch error:', error);
    return NextResponse.json({ error: 'Tur yüklenemedi' }, { status: 500 });
  }
}

