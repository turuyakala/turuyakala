import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - List all offers with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const supplierId = searchParams.get('supplierId') || '';
    const sortBy = searchParams.get('sortBy') || 'lastSyncedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    // Fetch offers
    let offers = await prisma.offer.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    // Filter by search in memory
    if (search) {
      const searchLower = search.toLowerCase();
      offers = offers.filter(o => 
        o.title.toLowerCase().includes(searchLower) ||
        o.from.toLowerCase().includes(searchLower) ||
        o.to.toLowerCase().includes(searchLower) ||
        o.vendorOfferId.toLowerCase().includes(searchLower)
      );
    }

    // Convert priceMinor to price for display
    const offersWithPrice = offers.map(offer => ({
      ...offer,
      price: offer.priceMinor / 100,
    }));

    return NextResponse.json({ offers: offersWithPrice }, { status: 200 });
  } catch (error) {
    console.error('Offers fetch error:', error);
    return NextResponse.json({ error: 'Offerlar yüklenemedi' }, { status: 500 });
  }
}

