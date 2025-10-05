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

  // Add price filter (priceMinor is in kuruş, convert from TRY)
  if (params.minPrice || params.maxPrice) {
    where.priceMinor = {};
    if (params.minPrice) where.priceMinor.gte = parseFloat(params.minPrice) * 100;
    if (params.maxPrice) where.priceMinor.lte = parseFloat(params.maxPrice) * 100;
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

  // Fetch surprise tours (always show at top, no filters, exclude from main query)
  const surpriseTours = await prisma.offer.findMany({
    where: {
      category: 'tour',
      isSurprise: true,
      status: 'active',
      startAt: {
        gte: now,
        lte: windowEnd,
      },
    },
    orderBy: { startAt: 'asc' },
    take: 3,
    include: {
      supplier: {
        select: {
          name: true,
        },
      },
    },
  });

  // Fetch regular tours with filters (exclude surprise tours)
  const regularTours = await prisma.offer.findMany({
    where: {
      ...where,
      isSurprise: false, // Exclude surprise tours from main query
    },
    orderBy,
    include: {
      supplier: {
        select: {
          name: true,
        },
      },
    },
  });

  // Combine: surprise tours first, then regular tours
  const allTours = [...surpriseTours, ...regularTours];

  // Convert to Item format
  const sortedItems: Item[] = allTours.map(tour => ({
    id: tour.id,
    category: tour.category as any,
    title: tour.title,
    from: tour.from,
    to: tour.to,
    startAt: tour.startAt.toISOString(),
    seatsLeft: tour.seatsLeft,
    price: tour.priceMinor / 100, // Convert minor units to major
    currency: tour.currency as any,
    supplier: tour.supplier?.name || 'TuruYakala',
    contact: undefined, // Offer doesn't have contact field
    terms: tour.terms || undefined,
    image: tour.image || undefined,
    transport: tour.transport || undefined,
    isSurprise: tour.isSurprise,
    requiresVisa: tour.requiresVisa,
    requiresPassport: tour.requiresPassport,
    createdAt: tour.createdAt.toISOString(),
  }));

  // Get price range for filter (convert priceMinor to price)
  const allPrices = allTours.map(t => t.priceMinor / 100).filter(p => p > 0);
  const priceRange = {
    min: allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 0,
    max: allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 10000,
  };
  
  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || sortOptions[0].label;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Navigation */}
      <nav className="bg-[#563C5C] text-white py-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-montserrat">TuruYakala</h1>
            <AuthButtons />
          </div>
        </div>
      </nav>

      {/* Hero Slider */}
      <HeroSlider />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filter and Sort Bar */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {sortedItems.length} Tur Fırsatı Bulundu
              </h2>
              <p className="text-sm text-gray-600 mt-1">72 saat içinde kalkış yapacak turlar</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <SimplePriceFilter priceRange={priceRange} />
              <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
              <SortSelect />
            </div>
          </div>
        </div>
        
        {/* Offers Grid - TÜM TURLAR (Sürpriz turlar en üstte) */}
        {sortedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map((item) => (
              <OfferCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Fırsat Bulunamadı
            </h3>
            <p className="text-gray-600 mb-6">
              Aradığınız kriterlere uygun son dakika fırsatı bulunamadı.
              <br />
              Filtreleri değiştirerek tekrar deneyin.
            </p>
          </div>
        )}
      </main>

      {/* Reviews Section (above footer) */}
      <ReviewsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">✈️</div>
            <p className="text-xl text-gray-600">Fırsatlar yükleniyor...</p>
          </div>
        </div>
      }
    >
      <OffersContent searchParams={searchParams} />
    </Suspense>
  );
}
