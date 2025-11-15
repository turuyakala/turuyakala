import { Suspense } from 'react';
import Link from 'next/link';
import OfferCard from '@/components/OfferCard';
import SortSelect from '@/components/SortSelect';
import SimplePriceFilter from '@/components/SimplePriceFilter';
import AuthButtons from '@/components/AuthButtons';
import HeroSlider from '@/components/HeroSlider';
import ReviewsSection from '@/components/ReviewsSection';
import Logo from '@/components/Logo';
import { Item, Category } from '@/lib/types';
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
  const where: {
    category: string;
    status: string;
    startAt: { gte: Date; lte: Date };
    from?: { contains: string; mode: 'insensitive' };
    to?: { contains: string; mode: 'insensitive' };
    priceMinor?: { gte?: number; lte?: number };
    isSurprise?: boolean;
  } = {
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
  let orderBy: { startAt?: 'asc' | 'desc'; priceMinor?: 'asc' | 'desc'; seatsLeft?: 'asc' | 'desc' } = { startAt: 'asc' };
  
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let surpriseTours: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          name: 'Test Acentesi'
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
          name: 'Test Acentesi'
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
          name: 'Test Acentesi'
        }
      }
    ];
  }

  // Convert to Item format
  const surpriseItems: Item[] = surpriseTours.map((offer: {
    id: string;
    title: string;
    description?: string | null;
    priceMinor: number;
    currency: string;
    from: string;
    to: string;
    startAt: Date;
    seatsLeft: number;
    transport?: string | null;
    image?: string | null;
    category: string;
    supplier?: { name: string | null };
    terms?: string | null;
    requiresVisa?: boolean | null;
    requiresPassport?: boolean | null;
  }) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description || '',
    price: offer.priceMinor / 100, // Convert from minor units to major units
    currency: offer.currency as 'TRY' | 'EUR' | 'USD',
    from: offer.from,
    to: offer.to,
    startAt: offer.startAt.toISOString(),
    seatsLeft: offer.seatsLeft,
    transport: offer.transport || 'Uçak',
    images: offer.image ? [offer.image] : [],
    isSurprise: true,
    category: offer.category as Category,
    supplier: offer.supplier?.name || 'Tedarikçi',
    terms: offer.terms || undefined,
    image: offer.image || undefined,
    requiresVisa: offer.requiresVisa || undefined,
    requiresPassport: offer.requiresPassport || undefined,
  }));

  const mainItems: Item[] = mainOffers.map((offer: {
    id: string;
    title: string;
    description?: string | null;
    priceMinor: number;
    currency: string;
    from: string;
    to: string;
    startAt: Date;
    seatsLeft: number;
    transport?: string | null;
    image?: string | null;
    category: string;
    supplier?: { name: string | null };
    terms?: string | null;
    requiresVisa?: boolean | null;
    requiresPassport?: boolean | null;
  }) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description || '',
    price: offer.priceMinor / 100, // Convert from minor units to major units
    currency: offer.currency as 'TRY' | 'EUR' | 'USD',
    from: offer.from,
    to: offer.to,
    startAt: offer.startAt.toISOString(),
    seatsLeft: offer.seatsLeft,
    transport: offer.transport || 'Uçak',
    images: offer.image ? [offer.image] : [],
    isSurprise: false,
    category: offer.category as Category,
    supplier: offer.supplier?.name || 'Tedarikçi',
    terms: offer.terms || undefined,
    image: offer.image || undefined,
    requiresVisa: offer.requiresVisa || undefined,
    requiresPassport: offer.requiresPassport || undefined,
  }));

  // Combine surprise tours at top + main offers
  const allItems = [...surpriseItems, ...mainItems];

  // Calculate price range from all items
  const prices = allItems.map(item => item.price);
  const priceRange = {
    min: prices.length > 0 ? Math.floor(Math.min(...prices)) : 0,
    max: prices.length > 0 ? Math.ceil(Math.max(...prices)) : 10000,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-[#E7E393] text-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24 py-2">
            <div className="flex items-center">
              <Logo />
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
              <SimplePriceFilter priceRange={priceRange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıralama
              </label>
              <SortSelect />
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