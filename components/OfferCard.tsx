import Link from 'next/link';
import Image from 'next/image';
import { Item } from '@/lib/types';
import { formatDateShort, getTimeUntilDeparture } from '@/lib/time';
import { formatPrice } from '@/lib/price';
import { toNum, toString } from '@/lib/utils';

type OfferCardProps = {
  item: Item;
};

const categoryColors: Record<Item['category'], { bg: string; border: string }> = {
  tour: { bg: 'from-[#a4dded]/10 to-[#8cc5d8]/10', border: 'border-l-[#a4dded]' },
  bus: { bg: 'from-[#a4dded]/10 to-[#8cc5d8]/10', border: 'border-l-[#a4dded]' },
  flight: { bg: 'from-[#a4dded]/10 to-[#8cc5d8]/10', border: 'border-l-[#a4dded]' },
  cruise: { bg: 'from-[#a4dded]/10 to-[#8cc5d8]/10', border: 'border-l-[#a4dded]' },
};

export default function OfferCard({ item }: OfferCardProps) {
  // Güvenli değer okuma
  const departureDate = new Date(item?.startAt || Date.now());
  const timeInfo = getTimeUntilDeparture(departureDate);
  const isSurprise = item?.isSurprise === true;
  const isCritical = toNum(timeInfo?.totalHours, 0) <= 3;
  const categoryColor = categoryColors[item?.category] || categoryColors.tour;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${
      isSurprise ? 'border-4 border-[#DD7230] ring-4 ring-[#DD7230]/30' : `border-l-4 ${categoryColor.border}`
    } ${isCritical ? 'animate-pulse-slow ring-2 ring-red-400' : ''}`}>
      <div className={`relative h-56 flex items-center justify-center overflow-hidden ${
        isSurprise ? 'surprise-bg-animated' : `bg-gradient-to-br ${categoryColor.bg}`
      }`}>
        {isSurprise ? (
          <>
            {/* Animated background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#DD7230] via-[#F4C95D] to-[#DD7230] opacity-75 animate-gradient-shift"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[#F4C95D] via-[#DD7230] to-[#F4C95D] opacity-50 animate-gradient-shift-reverse"></div>
            {/* Glowing particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#F4C95D] rounded-full opacity-30 blur-2xl animate-float"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#DD7230] rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
              <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-[#F4C95D] rounded-full opacity-25 blur-xl animate-float-slow"></div>
            </div>
            {/* Question mark */}
            <div className="relative z-10 text-9xl animate-bounce-slow text-white drop-shadow-2xl filter drop-shadow-[0_0_20px_rgba(244,201,93,0.8)]">❓</div>
          </>
        ) : item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                ? 'bg-[#DD7230] text-white font-bold' 
                : 'bg-white/90 text-gray-700'
            }`}>
              {toString(item?.transport, 'Uçak')}
            </div>
          </div>
        )}

        {/* Sağ üst: Geri sayım ibaresi */}
        {timeInfo && (
          <div className="absolute top-3 right-3 z-10">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg ${
              isSurprise 
                ? 'bg-[#F4C95D] text-white' 
                : 'bg-[#DD7230] text-white'
            } ${isCritical ? 'animate-pulse' : ''}`}>
              {/* Kum Saati İkonu */}
              <div className="hourglass-icon text-xl">
                ⏳
              </div>
              {/* Sayaç */}
              <div className="flex flex-col items-center leading-tight min-w-[50px]">
                <div className="text-[9px] opacity-90 font-semibold uppercase tracking-wide">KALKIŞA</div>
                {toNum(timeInfo?.totalHours, 0) < 24 ? (
                  <>
                    <div className="text-xl font-bold font-mono tabular-nums">{timeInfo.hours}</div>
                    <div className="text-[9px] font-semibold uppercase">SAAT</div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold font-mono tabular-nums">{timeInfo.days}</div>
                    <div className="text-[9px] font-semibold uppercase">GÜN</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sağ alt (kartın içinde): Kalan koltuk - Kırmızı yuvarlak */}
        {toNum(item?.seatsLeft, 0) <= 2 && !isSurprise && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <div className="text-center">
                <div className="text-white font-bold text-lg leading-tight">SON</div>
                <div className="text-white font-bold text-2xl leading-tight">{toNum(item?.seatsLeft, 0)}</div>
                <div className="text-white font-bold text-xs leading-tight">KOLTUK</div>
              </div>
            </div>
          </div>
        )}
        {isCritical && (
          <div className={`absolute inset-0 ${isSurprise ? 'bg-[#DD7230]/10' : 'bg-red-500/10'} animate-pulse`} />
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
            className="px-5 py-2.5 bg-[#E7E393] text-white text-sm font-semibold rounded-lg hover:bg-[#E7E393]/90 hover:scale-105 transition-all shadow-md"
          >
            Detay →
          </Link>
        </div>
      </div>
    </div>
  );
}

