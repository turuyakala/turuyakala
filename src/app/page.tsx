import { Suspense } from 'react';
import OfferCard from '@/components/OfferCard';
import SortSelect from '@/components/SortSelect';
import SimplePriceFilter from '@/components/SimplePriceFilter';
import AuthButtons from '@/components/AuthButtons';
import HeroSlider from '@/components/HeroSlider';
import ReviewsSection from '@/components/ReviewsSection';
import Footer from '@/components/Footer';
import { sortOptions } from '@/lib/sort';
import { Item } from '@/lib/types';
import { prisma } from '@/lib/prisma';
import { toNum } from '@/lib/utils';

type SearchParams = Promise<{
  cat?: string;
  from?: string;
  to?: string;
  window?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}>;

async function OffersContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  
  // Get current date/time for filtering tours within 72 hours
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  // Build where clause for Offer table
  const where: any = {
    category: 'tour',
    status: 'active', // Only active offers
    startAt: {
      gte: now,
      lte: windowEnd,
    },
  };

  // Apply filters
  if (params.cat) {
    where.category = params.cat;
  }
  if (params.from) {
    where.from = { contains: params.from, mode: 'insensitive' };
  }
  if (params.to) {
    where.to = { contains: params.to, mode: 'insensitive' };
  }
  if (params.minPrice) {
    where.priceMinor = { gte: toNum(params.minPrice, 0) * 100 };
  }
  if (params.maxPrice) {
    where.priceMinor = { ...where.priceMinor, lte: toNum(params.maxPrice, Number.MAX_SAFE_INTEGER) * 100 };
  }

  // Determine sort order (adapted for Offer table)
  const sortBy = params.sort || 'departure-asc';
  let orderBy: any = { startAt: 'asc' };
  
  switch (sortBy) {
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

  // For production, use sample data if database is not available
  let surpriseTours: any[] = [];
  let mainOffers: any[] = [];

  try {
    // Fetch surprise tours (always show at top, no filters, exclude from main query)
    surpriseTours = await prisma.offer.findMany({
      where: {
        category: 'tour',
        isSurprise: true,
        status: 'active',
        startAt: {
          gte: now,
          lte: windowEnd,
        },
      },
      include: {
        supplier: {
          select: {
            name: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
      },
      take: 3,
    });

    // Get main offers (excluding surprise tours)
    mainOffers = await prisma.offer.findMany({
      where: {
        ...where,
        isSurprise: false, // Exclude surprise tours from main query
      },
      include: {
        supplier: {
          select: {
            name: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
      },
      orderBy,
      take: 21, // Show 21 offers + 3 surprise = 24 total
    });
  } catch (error) {
    console.error('Database error, using sample data:', error);
    
    // Fallback to sample data
    surpriseTours = [
      {
        id: '1',
        title: 'Kapadokya Balon Turu',
        description: 'Kapadokya\'da unutulmaz balon turu',
        priceMinor: toNum(150000),
        currency: 'TRY',
        from: 'İstanbul',
        to: 'Nevşehir',
        startAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        seatsLeft: 3,
        transport: 'Uçak',
        duration: '2 gün 1 gece',
        images: ['/images/hero-2.jpg'],
        isSurprise: true,
        category: 'tour',
        supplier: {
          name: 'Test Acentesi',
          contactEmail: 'info@test.com',
          contactPhone: '+90 555 123 4567'
        }
      }
    ];

    mainOffers = [
      {
        id: '2',
        title: 'Antalya Kaş Turu',
        description: 'Muhteşem Kaş bölgesinde 3 günlük tatil',
        priceMinor: toNum(120000),
        currency: 'TRY',
        from: 'İstanbul',
        to: 'Antalya',
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        seatsLeft: 5,
        transport: 'Uçak',
        duration: '3 gün 2 gece',
        images: ['/images/hero-1.jpg'],
        isSurprise: false,
        category: 'tour',
        supplier: {
          name: 'Test Acentesi',
          contactEmail: 'info@test.com',
          contactPhone: '+90 555 123 4567'
        }
      },
      {
        id: '3',
        title: 'Bodrum Yacht Turu',
        description: 'Bodrum\'da lüks yacht turu',
        priceMinor: toNum(200000),
        currency: 'TRY',
        from: 'İstanbul',
        to: 'Bodrum',
        startAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        seatsLeft: 8,
        transport: 'Uçak',
        duration: '4 gün 3 gece',
        images: ['/images/hero-3.jpg'],
        isSurprise: false,
        category: 'tour',
        supplier: {
          name: 'Test Acentesi',
          contactEmail: 'info@test.com',
          contactPhone: '+90 555 123 4567'
        }
      }
    ];
  }

  // Convert to Item format
  const surpriseItems: Item[] = surpriseTours.map((offer) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description || '',
    priceMinor: offer.priceMinor,
    currency: offer.currency,
    from: offer.from,
    to: offer.to,
    startAt: offer.startAt,
    seatsLeft: offer.seatsLeft,
    transport: offer.transport || 'Uçak',
    duration: offer.duration || '1 gün',
    images: offer.images || [],
    isSurprise: true,
    category: offer.category,
    supplier: offer.supplier,
  }));

  const mainItems: Item[] = mainOffers.map((offer) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description || '',
    priceMinor: offer.priceMinor,
    currency: offer.currency,
    from: offer.from,
    to: offer.to,
    startAt: offer.startAt,
    seatsLeft: offer.seatsLeft,
    transport: offer.transport || 'Uçak',
    duration: offer.duration || '1 gün',
    images: offer.images || [],
    isSurprise: false,
    category: offer.category,
    supplier: offer.supplier,
  }));

  // Combine surprise tours at top + main offers
  const allItems = [...surpriseItems, ...mainItems];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-[#563C5C] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">TuruYakala</h1>
            </div>
            <div className="flex items-center space-x-4">
              <AuthButtons />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSlider />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat Aralığı
              </label>
              <SimplePriceFilter />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıralama
              </label>
              <SortSelect options={sortOptions} />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {allItems.length} Tur Fırsatı Bulundu
          </h2>
          
          {/* Surprise Tours */}
          {surpriseTours.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sürpriz Turlar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surpriseItems.map((offer) => (
                  <OfferCard key={offer.id} item={offer} />
                ))}
              </div>
            </div>
          )}

          {/* Main Offers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainItems.map((offer) => (
              <OfferCard key={offer.id} item={offer} />
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OffersContent searchParams={searchParams} />
    </Suspense>
  );
}