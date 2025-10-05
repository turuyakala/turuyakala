import Link from 'next/link';
import { Item } from '@/lib/types';
import { formatDate, getTimeUntilDeparture } from '@/lib/time';

type SimilarToursProps = {
  tours: Item[];
};

export default function SimilarTours({ tours }: SimilarToursProps) {
  if (tours.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        🔍 Benzer Turlar
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tours.map((tour) => {
          const departureDate = new Date(tour.startAt);
          const timeInfo = getTimeUntilDeparture(departureDate);
          
          return (
            <Link
              key={tour.id}
              href={`/item/${tour.id}`}
              className="group bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#91A8D0] hover:shadow-lg transition-all"
            >
              {/* Fotoğraf */}
              <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                {tour.image ? (
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">
                    🏞️
                  </div>
                )}
                
                {/* Kalan Süre Badge */}
                {timeInfo.totalHours <= 24 && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    🔥 {timeInfo.totalHours}h
                  </div>
                )}
              </div>

              {/* İçerik */}
              <div className="p-4">
                <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#91A8D0] transition-colors">
                  {tour.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span>{tour.from}</span>
                  <span>→</span>
                  <span>{tour.to}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-[#91A8D0]">
                    {tour.price.toLocaleString('tr-TR')}
                    <span className="text-sm ml-1">{tour.currency === 'TRY' ? '₺' : tour.currency}</span>
                  </div>
                  {tour.seatsLeft <= 3 && (
                    <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                      {tour.seatsLeft} koltuk
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




