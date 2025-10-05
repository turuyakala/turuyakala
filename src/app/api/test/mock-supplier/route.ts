import { NextResponse } from 'next/server';

/**
 * Mock Supplier API for Testing
 * Use this endpoint to test supplier synchronization without a real external API
 * 
 * Usage:
 * 1. Create a new supplier in admin panel
 * 2. Set API URL to: http://localhost:3000/api/test/mock-supplier
 * 3. Set integration mode to: Pull
 * 4. Click "Şimdi Senkronize Et"
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '100');

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate mock offers
  const offers = [];
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, 50); // Total 50 mock offers

  for (let i = startIndex; i < endIndex; i++) {
    const offerNum = i + 1;
    const categories = ['tour', 'bus', 'flight', 'cruise'];
    const category = categories[i % categories.length];
    
    const routes = [
      { from: 'İstanbul', to: 'Antalya' },
      { from: 'Ankara', to: 'İzmir' },
      { from: 'İstanbul', to: 'Kapadokya' },
      { from: 'Bursa', to: 'Çanakkale' },
    ];
    const route = routes[i % routes.length];

    const titles = {
      tour: `${route.to} ${['Kültür', 'Doğa', 'Tarih', 'Şehir'][i % 4]} Turu`,
      bus: `${route.from} - ${route.to} Otobüs Bileti`,
      flight: `${route.from} - ${route.to} Uçak Bileti`,
      cruise: `${route.to} Tekne Turu`,
    };

    offers.push({
      vendorOfferId: `MOCK-${String(offerNum).padStart(3, '0')}`,
      category,
      title: titles[category as keyof typeof titles],
      from: route.from,
      to: route.to,
      startAt: new Date(Date.now() + (i + 1) * 86400000).toISOString(), // +1, +2, +3 days
      seatsTotal: 20 + (i % 30),
      seatsLeft: 3 + (i % 15),
      price: 500 + (i * 100), // 500, 600, 700... TRY
      currency: 'TRY',
      image: `/images/hero-${(i % 4) + 1}.jpg`,
      terms: 'Kalkıştan 24 saat önce iptal edilirse %80 iade. Sonrasında iade yok.',
      transport: category === 'tour' ? 'Otobüs ile' : undefined,
      isSurprise: i < 3, // First 3 are surprise tours
      requiresVisa: i % 5 === 0,
      requiresPassport: i % 3 === 0,
    });
  }

  // Check if there are more pages
  const hasMore = endIndex < 50;

  return NextResponse.json({
    offers,
    pagination: {
      page,
      limit,
      total: 50,
      hasMore,
    },
    message: 'Mock supplier API - Test data',
  });
}

