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
import Navigation from '@/components/Navigation';
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
    
    // Fetch the tour from database (try InventoryItem first, then Offer)
    let tourData: any = null;
    let isInventoryItem = false;

    // Try InventoryItem first (has more detailed info)
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    if (inventoryItem) {
      tourData = inventoryItem;
      isInventoryItem = true;
    } else {
      // Try Offer table
      const offerData = await prisma.offer.findUnique({
        where: { id },
        include: {
          supplier: {
            select: {
              name: true,
            },
          },
        },
      });
      
      if (offerData) {
        tourData = offerData;
        isInventoryItem = false;
      }
    }

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
    originalPrice: isInventoryItem && tourData.originalPriceMinor ? tourData.originalPriceMinor / 100 : undefined,
    discountPercentage: isInventoryItem && tourData.discountPercentage ? tourData.discountPercentage : undefined,
    currency: tourData.currency as any,
    supplier: tourData.supplier?.name || 'TuruYakala',
    contact: isInventoryItem && tourData.contact ? JSON.parse(tourData.contact) : undefined,
    terms: tourData.terms || undefined,
    image: tourData.image || undefined,
    images: isInventoryItem && tourData.images ? JSON.parse(tourData.images) : undefined,
    transport: tourData.transport || undefined,
    isSurprise: tourData.isSurprise,
    requiresVisa: tourData.requiresVisa,
    requiresPassport: tourData.requiresPassport,
    createdAt: tourData.createdAt.toISOString(),
    // Optional fields for detail page (only available in InventoryItem)
    description: isInventoryItem ? tourData.description || undefined : undefined,
    program: isInventoryItem && tourData.program ? JSON.parse(tourData.program) : undefined,
    included: isInventoryItem && tourData.included ? JSON.parse(tourData.included) : undefined,
    excluded: isInventoryItem && tourData.excluded ? JSON.parse(tourData.excluded) : undefined,
    importantInfo: isInventoryItem && tourData.importantInfo ? JSON.parse(tourData.importantInfo) : undefined,
    departureLocation: isInventoryItem && tourData.departureLocation ? JSON.parse(tourData.departureLocation) : undefined,
    destinationLocation: isInventoryItem && tourData.destinationLocation ? JSON.parse(tourData.destinationLocation) : undefined,
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
                    <ImageGallery images={gallery} title={item.title} seatsLeft={item.seatsLeft} />

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

                    {/* Gezilecek Yer Haritası - Açıklama kısmının altında */}
                    {item.destinationLocation && (
                      <MapSection location={item.destinationLocation} title="Gezilecek Yer" />
                    )}

                    {/* Kalkış Noktası Haritası */}
                    {item.departureLocation && (
                      <MapSection location={item.departureLocation} title="Kalkış Noktası" />
                    )}

                    {/* Benzer Turlar */}
                    <SimilarTours tours={similarToursRecommendations} />
                  </div>

                  {/* Sağ Kolon - Fiyat ve Rezervasyon */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                      {/* İndirim Oranı Yıldız Kutucuğu */}
                      {item.discountPercentage && item.discountPercentage > 0 && (
                        <div className="relative flex items-center justify-center">
                          <svg className="w-32 h-32 text-[#E63946] drop-shadow-lg" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M50 5 L61 35 L95 35 L68 55 L79 85 L50 65 L21 85 L32 55 L5 35 L39 35 Z" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            <div className="text-3xl font-bold">%{item.discountPercentage}</div>
                            <div className="text-xs font-medium">İndirim</div>
                          </div>
                        </div>
                      )}

                      {/* Fiyat Kutusu */}
                      <div className="bg-gradient-to-br from-[#1A2A5A] to-[#1A2A5A]/90 rounded-xl shadow-lg p-6 text-white">
                        <div className="text-sm opacity-90 mb-2">Kişi Başı Fiyat</div>
                        {item.originalPrice && item.originalPrice > item.price ? (
                          <div className="mb-2">
                            <div className="text-2xl font-medium line-through opacity-70 mb-1">
                              {formatPrice(item.originalPrice * 100, item.currency)}
                            </div>
                            <div className="text-5xl font-bold text-[#E63946]">
                              {formatPrice(item.price * 100, item.currency)}
                            </div>
                            {!item.discountPercentage && (
                              <div className="text-sm font-medium text-green-300 mt-1">
                                %{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)} İndirim
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-5xl font-bold mb-1">
                            {formatPrice(item.price * 100, item.currency)}
                          </div>
                        )}
                        <div className="text-sm opacity-90 mt-2">
                          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Kalkışa {Math.floor(timeInfo.totalHours)} saat kaldı
                        </div>
                      </div>

                      {/* Koltuk Durumu - Fiyatın hemen altında */}
                      {item.seatsLeft <= 5 && (
                        <div className="bg-gradient-to-br from-[#E63946] to-[#E63946]/90 rounded-xl shadow-lg p-4 text-center text-white animate-pulse-slow">
                          <div className="flex justify-center mb-2">
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="font-bold text-2xl">
                            Son {item.seatsLeft} Koltuk!
                          </div>
                          <div className="text-sm mt-1 opacity-90">
                            Şimdi Turu Yakala!
                          </div>
                        </div>
                      )}

                      {/* İptal Politikası - Vanilla */}
                      <div className="bg-gradient-to-br from-[#F3E5AB] to-[#E8D596] rounded-xl shadow-lg p-6">
                        <div className="flex items-start gap-3">
                          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              İptal Politikası
                            </h3>
                            <p className="text-gray-900 font-semibold">
                              <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Bu tur kesinlikle iptal edilemez!
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
                        originalPrice={item.originalPrice}
                        currency={item.currency}
                        seatsLeft={item.seatsLeft}
                        requiresPassport={item.requiresPassport}
                        contact={item.contact}
                        tourTitle={item.title}
                        tourFrom={item.from}
                        tourTo={item.to}
                        tourStartAt={item.startAt}
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
