import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Item } from '@/lib/types';
import { formatDate, getTimeUntilDeparture } from '@/lib/time';
import { formatPrice, getCurrencySymbol } from '@/lib/price';
import ImageGallery from '@/components/ImageGallery';
import TourTabs from '@/components/TourTabs';
import ReservationBox from '@/components/ReservationBox';
import SimilarTours from '@/components/SimilarTours';
import ShareButtons from '@/components/ShareButtons';
import MapSection from '@/components/MapSection';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering - this page needs real-time data
// This prevents build-time database queries and ensures pages are rendered at request time
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ItemDetailPage({ params }: PageProps) {
  try {
    const { id } = await params;
    
    if (!id) {
      notFound();
    }
    
    // Fetch the tour from database (using Offer table)
    const tourData = await prisma.offer.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!tourData) {
      notFound();
    }

  // Convert to Item format
  const item: Item = {
    id: tourData.id,
    category: tourData.category as any,
    title: tourData.title,
    from: tourData.from,
    to: tourData.to,
    startAt: tourData.startAt.toISOString(),
    seatsLeft: tourData.seatsLeft,
    price: tourData.priceMinor / 100, // Convert minor units to major
    currency: tourData.currency as any,
    supplier: tourData.supplier?.name || 'TuruYakala',
    contact: undefined, // Offer doesn't have contact field
    terms: tourData.terms || undefined,
    image: tourData.image || undefined,
    transport: tourData.transport || undefined,
    isSurprise: tourData.isSurprise,
    requiresVisa: tourData.requiresVisa,
    requiresPassport: tourData.requiresPassport,
    createdAt: tourData.createdAt.toISOString(),
    // Optional fields for detail page
    description: undefined,
    program: undefined,
    included: undefined,
    excluded: undefined,
    importantInfo: undefined,
    departureLocation: undefined,
  };

  const departureDate = new Date(item.startAt);
  const timeInfo = getTimeUntilDeparture(departureDate);

  // Galeri için fotoğraflar
  const gallery = item.images || (item.image ? [item.image] : []);

  // Benzer turlar - Akıllı öneriler
  const currentCity = item.to?.toLowerCase() || '';
  const currentTitle = item.title?.toLowerCase() || '';
  
  // 1. Sürpriz turları al (1 tane)
  const surpriseToursData = await prisma.offer.findMany({
    where: {
      category: 'tour',
      isSurprise: true,
      status: 'active',
      id: { not: id },
    },
    take: 1,
    orderBy: { startAt: 'asc' },
    include: {
      supplier: {
        select: {
          name: true,
        },
      },
    },
  });
  
  // 2. Şehir/aktivite bazında benzer turları bul
  const similarToursData = await prisma.offer.findMany({
    where: {
      category: item.category,
      isSurprise: false,
      status: 'active',
      id: { not: id },
    },
    take: 10,
    orderBy: { startAt: 'asc' },
    include: {
      supplier: {
        select: {
          name: true,
        },
      },
    },
  });
  
  // Filter by location/title in memory (SQLite doesn't support case-insensitive contains)
  const filteredSimilarTours = similarToursData.filter(t => 
    t.to.toLowerCase().includes(currentCity) || 
    t.title.toLowerCase().includes(currentTitle.split(' ')[0])
  ).slice(0, 4);
  
  // 3. Diğer turlar (yedek olarak)
  const otherToursData = await prisma.offer.findMany({
    where: {
      category: item.category,
      isSurprise: false,
      status: 'active',
      id: { 
        not: id,
        notIn: filteredSimilarTours.map(t => t.id),
      },
    },
    take: 2,
    orderBy: { startAt: 'asc' },
    include: {
      supplier: {
        select: {
          name: true,
        },
      },
    },
  });
  
  // Combine all similar tours
  const allSimilarTours = [...surpriseToursData, ...filteredSimilarTours, ...otherToursData];
  
  // Convert to Item format
  const similarToursRecommendations: Item[] = allSimilarTours.slice(0, 6).map(tour => ({
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

          return (
            <div className="min-h-screen bg-gray-50">
              {/* Navigation */}
              <Navigation />

              {/* Main Content */}
              <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Sol Kolon - Ana İçerik */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Başlık */}
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        {item.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <img src="/images/icons/location.svg" alt="Konum" className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">{item.from} → {item.to}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img src="/images/icons/calendar.svg" alt="Tarih" className="w-5 h-5 text-gray-600" />
                          <span>{formatDate(departureDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img src="/images/icons/transport.svg" alt="Ulaşım" className="w-5 h-5 text-gray-600" />
                          <span>{item.transport || 'Ulaşım bilgisi yok'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Fotoğraf Galerisi */}
                    <ImageGallery images={gallery} title={item.title} />

                    {/* Sosyal Medya Paylaşım */}
                    <ShareButtons title={item.title} />

                    {/* Sekmeler: Program, Dahil/Hariç, Önemli Bilgiler, İptal */}
                    <TourTabs
                      description={item.description}
                      program={item.program}
                      included={item.included}
                      excluded={item.excluded}
                      importantInfo={item.importantInfo}
                    />

                    {/* Harita */}
                    {item.departureLocation && (
                      <MapSection location={item.departureLocation} />
                    )}

                    {/* Benzer Turlar */}
                    <SimilarTours tours={similarToursRecommendations} />
                  </div>

                  {/* Sağ Kolon - Fiyat ve Rezervasyon */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                      {/* Fiyat Kutusu */}
                      <div className="bg-gradient-to-br from-[#1A2A5A] to-[#1A2A5A]/90 rounded-xl shadow-lg p-6 text-white">
                        <div className="text-sm opacity-90 mb-2">Kişi Başı Fiyat</div>
                        <div className="text-5xl font-bold mb-1">
                          {formatPrice(item.price * 100, item.currency)}
                        </div>
                        <div className="text-sm opacity-90 mt-2">
                          ⏰ Kalkışa {Math.floor(timeInfo.totalHours)} saat kaldı
                        </div>
                      </div>

                      {/* Koltuk Durumu - Fiyatın hemen altında */}
                      {item.seatsLeft <= 5 && (
                        <div className="bg-gradient-to-br from-[#E63946] to-[#E63946]/90 rounded-xl shadow-lg p-4 text-center text-white animate-pulse-slow">
                          <div className="text-4xl mb-2">🔥</div>
                          <div className="font-bold text-2xl">
                            Son {item.seatsLeft} Koltuk!
                          </div>
                          <div className="text-sm mt-1 opacity-90">
                            Hemen rezervasyon yapın
                          </div>
                        </div>
                      )}

                      {/* İptal Politikası - Vanilla */}
                      <div className="bg-gradient-to-br from-[#F3E5AB] to-[#E8D596] rounded-xl shadow-lg p-6">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">⚠️</span>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              İptal Politikası
                            </h3>
                            <p className="text-gray-900 font-semibold">
                              ❌ Bu tur kesinlikle iptal edilemez!
                            </p>
                            <p className="text-sm text-gray-800 mt-2">
                              Son dakika turu olduğu için iptal ve iade kabul edilmemektedir.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Rezervasyon Kutusu */}
                      <ReservationBox
                        tourId={item.id}
                        price={item.price}
                        currency={item.currency}
                        seatsLeft={item.seatsLeft}
                        requiresPassport={item.requiresPassport}
                        contact={item.contact}
                      />
                    </div>
                  </div>
                </div>
              </main>
            </div>
          );
  } catch (error) {
    console.error('Error loading tour detail:', error);
    notFound();
  }
}
