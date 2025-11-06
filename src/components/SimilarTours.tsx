'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Item } from '@/lib/types';
import { getTimeUntilDeparture } from '@/lib/time';

type SimilarToursProps = {
  tours: Item[];
  currentTourId: string;
};

export default function SimilarTours({ tours, currentTourId }: SimilarToursProps) {
  if (tours.length === 0) {
    return null;
  }

  // İlk öneri sürpriz tur (eğer varsa)
  const surpriseTour = tours.find(t => t.isSurprise);
  
  // Gerçek benzer turlar (sürpriz olmayan, kendisi hariç)
  const similarTours = tours.filter(t => !t.isSurprise && t.id !== currentTourId);
  
  // Öneriler: 1 sürpriz + 2 benzer = 3 toplam
  const recommendations = [
    ...(surpriseTour ? [surpriseTour] : []),
    ...similarTours.slice(0, 2)
  ].slice(0, 3);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        🔍 Size Özel Öneriler
      </h3>
      <div className="flex flex-col md:flex-row gap-2 md:gap-3">
        {recommendations.map((tour) => {
          const departureDate = new Date(tour.startAt);
          const timeInfo = getTimeUntilDeparture(departureDate);
          const isSurprise = tour.isSurprise || false;
          
          return (
            <Link
              key={tour.id}
              href={`/item/${tour.id}`}
              className={`group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all flex flex-row flex-1 ${
                isSurprise ? 'border-2 border-red-500' : 'border-2 border-gray-200 hover:border-[#91A8D0]'
              }`}
            >
              {/* Fotoğraf - Sol taraf, dar */}
              <div className="relative w-20 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
                {tour.image ? (
                  <Image
                    src={isSurprise ? '/images/surprise.jpg' : tour.image}
                    alt={tour.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">
                    {isSurprise ? '❓' : '🏞️'}
                  </div>
                )}
                
                {/* Badges üst üste */}
                <div className="absolute top-1 left-1 flex flex-col gap-1">
                  {/* Sürpriz Badge */}
                  {isSurprise && (
                    <div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                      🎁
                    </div>
                  )}
                  
                  {/* Zaman Bilgisi */}
                  {!isSurprise && timeInfo.totalHours <= 24 && (
                    <div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                      🔥{timeInfo.totalHours}h
                    </div>
                  )}
                </div>
                
                {/* Ulaşım Şekli - Alt */}
                {tour.transport && (
                  <div className={`absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded text-[9px] font-medium text-center truncate ${
                    isSurprise ? 'bg-red-600 text-white' : 'bg-white/90 text-gray-800'
                  }`}>
                    {tour.transport.replace(' ile', '')}
                  </div>
                )}
              </div>

              {/* İçerik - Sağ taraf */}
              <div className="p-1.5 flex-grow flex flex-col justify-between min-w-0">
                <div>
                  <h4 className="font-bold text-[10px] text-gray-900 line-clamp-2 mb-0.5 group-hover:text-[#91A8D0] transition-colors leading-tight">
                    {tour.title}
                  </h4>
                  
                  {!isSurprise && (
                    <div className="flex items-center gap-0.5 text-[9px] text-gray-600 mb-0.5">
                      <span className="truncate">{tour.from}</span>
                      <span>→</span>
                      <span className="truncate">{tour.to}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <div className="text-sm font-bold text-[#91A8D0]">
                    {tour.price.toLocaleString('tr-TR')}
                    <span className="text-[9px] ml-0.5">{tour.currency === 'TRY' ? '₺' : tour.currency}</span>
                  </div>
                  {tour.seatsLeft <= 3 && (
                    <div className="bg-red-100 text-red-600 px-1 py-0.5 rounded text-[9px] font-bold text-center">
                      Son {tour.seatsLeft}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
