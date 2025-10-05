import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Public endpoint for fetching a single tour
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const tour = await prisma.inventoryItem.findUnique({
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
        price: true,
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
    });

    if (!tour) {
      return NextResponse.json({ error: 'Tur bulunamadı' }, { status: 404 });
    }

    // Parse contact JSON if exists
    const parsedTour = {
      ...tour,
      contact: tour.contact ? JSON.parse(tour.contact as string) : null,
    };

    return NextResponse.json(parsedTour, { status: 200 });
  } catch (error) {
    console.error('Tour fetch error:', error);
    return NextResponse.json({ error: 'Tur yüklenemedi' }, { status: 500 });
  }
}

