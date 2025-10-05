import Link from 'next/link';
import { Item } from '@/lib/types';
import { formatDateShort, getTimeUntilDeparture } from '@/lib/time';
import { formatPrice } from '@/lib/price';
import Badge from './Badge';

type OfferCardProps = {
  item: Item;
};

const categoryLabels: Record<Item['category'], string> = {
  tour: '🏞️ Tur',
  bus: '🚌 Otobüs',
  flight: '✈️ Uçak',
  cruise: '🚢 Gemi',
};

const categoryColors: Record<Item['category'], { bg: string; border: string }> = {
  tour: { bg: 'from-[#a4dded]/10 to-[#8cc5d8]/10', border: 'border-l-[#a4dded]' },
  bus: { bg: 'from-[#a4dded]/10 to-[#8cc5d8]/10', border: 'border-l-[#a4dded]' },
  flight: { bg: 'from-[#a4dded]/10 to-[#8cc5d8]/10', border: 'border-l-[#a4dded]' },
  cruise: { bg: 'from-[#a4dded]/10 to-[#8cc5d8]/10', border: 'border-l-[#a4dded]' },
};

export default function OfferCard({ item }: OfferCardProps) {
  const departureDate = new Date(item.startAt);
  const timeInfo = getTimeUntilDeparture(departureDate);
  const isSurprise = item.isSurprise === true;
  const isCritical = timeInfo.totalHours <= 3;
  const categoryColor = categoryColors[item.category];

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${
      isSurprise ? 'border-4 border-red-500 ring-4 ring-red-300' : `border-l-4 ${categoryColor.border}`
    } ${isCritical ? 'animate-pulse-slow ring-2 ring-red-400' : ''}`}>
      <div className={`relative h-56 flex items-center justify-center overflow-hidden ${
        isSurprise ? 'bg-gradient-to-br from-red-500 to-pink-600' : `bg-gradient-to-br ${categoryColor.bg}`
      }`}>
        {isSurprise ? (
          <div className="text-9xl animate-bounce-slow text-white drop-shadow-2xl">❓</div>
        ) : item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="text-7xl opacity-40" aria-hidden="true">
            {item.category === 'tour' && '🏞️'}
            {item.category === 'bus' && '🚌'}
            {item.category === 'flight' && '✈️'}
            {item.category === 'cruise' && '🚢'}
          </div>
        )}
        {/* Sol üst: Ulaşım şekli (hem normal hem sürpriz turlar için) */}
        {item.transport && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`px-3 py-1 backdrop-blur-sm text-xs font-medium rounded-md shadow-sm ${
              isSurprise 
                ? 'bg-red-600 text-white font-bold' 
                : 'bg-white/90 text-gray-700'
            }`}>
              {item.transport}
            </div>
          </div>
        )}

        {/* Sağ alt (kartın içinde): Kalan koltuk - Kırmızı yuvarlak */}
        {item.seatsLeft <= 2 && !isSurprise && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <div className="text-center">
                <div className="text-white font-bold text-lg leading-tight">SON</div>
                <div className="text-white font-bold text-2xl leading-tight">{item.seatsLeft}</div>
                <div className="text-white font-bold text-xs leading-tight">KOLTUK</div>
              </div>
            </div>
          </div>
        )}
        {isCritical && (
          <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {isSurprise ? '🎁 Sürpriz Destinasyon' : item.title}
        </h3>

        <div className="space-y-2 mb-4">
          {/* Nereden-Nereye: Sürpriz turlarda gizli */}
          {!isSurprise && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">{item.from}</span>
              <span className="mx-2">→</span>
              <span className="font-medium">{item.to}</span>
            </div>
          )}

          {/* Vize/Pasaport: Sadece sürpriz turlarda */}
          {isSurprise && (
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {item.requiresPassport && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium text-xs">
                  📘 Pasaport Gerekli
                </span>
              )}
              {item.requiresVisa && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-medium text-xs">
                  📝 Vize Gerekli
                </span>
              )}
            </div>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <span>📅 {formatDateShort(departureDate)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <div className="text-3xl font-bold text-gray-900 font-montserrat">
              {formatPrice(item.price * 100, item.currency)}
            </div>
            <div className="text-xs text-gray-500">Kişi başı</div>
          </div>

          <Link
            href={`/item/${item.id}`}
            className="px-5 py-2.5 bg-[#563C5C] text-white text-sm font-semibold rounded-lg hover:bg-[#563C5C]/90 hover:scale-105 transition-all shadow-md"
          >
            Detay →
          </Link>
        </div>
      </div>
    </div>
  );
}

