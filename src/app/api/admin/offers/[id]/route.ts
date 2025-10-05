import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET - Get single offer details
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = await context.params;
    
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            integrationMode: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer bulunamadı' }, { status: 404 });
    }

    // Convert priceMinor to price and parse rawJson
    const offerWithDetails = {
      ...offer,
      price: offer.priceMinor / 100,
      rawData: offer.rawJson ? JSON.parse(offer.rawJson) : null,
    };

    return NextResponse.json(offerWithDetails, { status: 200 });
  } catch (error) {
    console.error('Offer fetch error:', error);
    return NextResponse.json({ error: 'Offer yüklenemedi' }, { status: 500 });
  }
}

