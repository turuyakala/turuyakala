'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Item } from '@/lib/types';
import { formatDateShort, getTimeUntilDeparture } from '@/lib/time';
import { formatPrice } from '@/lib/price';
import { toNum, toString } from '@/lib/utils';

type OfferCardProps = {
  item: Item;
  serverTime: string; // ISO string formatında server saati (GMT+3)
};

const categoryColors: Record<Item['category'], { bg: string; border: string }> = {
  tour: { bg: 'from-[#DAE4F2]/20 to-[#DAE4F2]/10', border: 'border-l-[#1A2A5A]' },
  bus: { bg: 'from-[#DAE4F2]/20 to-[#DAE4F2]/10', border: 'border-l-[#1A2A5A]' },
  flight: { bg: 'from-[#DAE4F2]/20 to-[#DAE4F2]/10', border: 'border-l-[#1A2A5A]' },
  cruise: { bg: 'from-[#DAE4F2]/20 to-[#DAE4F2]/10', border: 'border-l-[#1A2A5A]' },
};

export default function OfferCard({ item, serverTime }: OfferCardProps) {
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentSeatsLeft, setCurrentSeatsLeft] = useState(toNum(item?.seatsLeft, 0));
  const [previousSeatsLeft, setPreviousSeatsLeft] = useState(toNum(item?.seatsLeft, 0));
  const [mounted, setMounted] = useState(false);
  
  // Ref'ler ile state'i takip et (closure problemi önlemek için)
  const isAnimatingRef = useRef(isAnimating);
  const isSoldOutRef = useRef(isSoldOut);
  
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
    isSoldOutRef.current = isSoldOut;
  }, [isAnimating, isSoldOut]);

  // Güvenli değer okuma - default değerleri kaldırıldı
  if (!item?.startAt) {
    return null; // Eğer startAt yoksa kartı gösterme
  }

  // departureDate'i memoize et (her render'da yeni obje oluşturulmasını önle)
  const departureDate = useMemo(() => new Date(item.startAt), [item.startAt]);
  const departureTimeMs = useMemo(() => departureDate.getTime(), [departureDate]);
  
  const timeInfo = getTimeUntilDeparture(departureDate);
  const isSurprise = item?.isSurprise === true;
  const isCritical = toNum(timeInfo?.totalHours, 0) <= 3;
  const categoryColor = categoryColors[item?.category] || categoryColors.tour;

  // Client-side mount kontrolü
  useEffect(() => {
    setMounted(true);
  }, []);

  // Gerçek zamanlı sayaç için state kullan
  const [timeRemaining, setTimeRemaining] = useState(() => {
    // İlk render'da server saatini kullan
    const now = new Date(serverTime).getTime();
    const diff = Math.max(0, departureTimeMs - now);
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds, totalSeconds };
  });

  // Gerçek zamanlı sayaç güncellemesi - her saniye çalışır
  useEffect(() => {
    if (!mounted) return;

    // İlk hesaplama
    const calculateTimeRemaining = () => {
      const serverTimeMs = new Date(serverTime).getTime();
      const clientTimeMs = Date.now();
      const currentOffset = clientTimeMs - serverTimeMs;
      const now = serverTimeMs + currentOffset;
      const diff = Math.max(0, departureTimeMs - now);

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeRemaining({ hours, minutes, seconds, totalSeconds });
    };

    // İlk hesaplama
    calculateTimeRemaining();

    // Her saniye güncelle
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [mounted, serverTime, departureTimeMs]);

  // Koltuk sayısını düzenli olarak kontrol et ve rezervasyon event'lerini dinle
  // Optimize: useCallback ile fonksiyonu memoize et
  const checkSeats = useCallback(async () => {
    try {
      const response = await fetch(`/api/tours/${item.id}`);
      if (response.ok) {
        const data = await response.json();
        const newSeatsLeft = toNum(data.seatsLeft, 0);
        
        // Batch state updates - React 18 otomatik batch'ler ama yine de dikkatli olalım
        setCurrentSeatsLeft((prevSeats) => {
          // Koltuk sayısı azaldıysa animasyonu tetikle
          if (prevSeats > 0 && newSeatsLeft < prevSeats && !isAnimatingRef.current) {
            // Race condition önleme: flag'i hemen set et, sonra state'i güncelle
            isAnimatingRef.current = true;
            requestAnimationFrame(() => {
              setIsAnimating(true);
              setTimeout(() => {
                setIsSoldOut(true);
              }, 2500);
            });
          }
          
          return newSeatsLeft;
        });
        
        // Eğer koltuk kalmadıysa animasyonu tetikle
        if (newSeatsLeft === 0 && !isSoldOutRef.current && !isAnimatingRef.current) {
          // Race condition önleme: flag'i hemen set et, sonra state'i güncelle
          isAnimatingRef.current = true;
          requestAnimationFrame(() => {
            setIsAnimating(true);
            setTimeout(() => {
              setIsSoldOut(true);
            }, 2500);
          });
        }
        
        setPreviousSeatsLeft(newSeatsLeft);
      }
    } catch (error) {
      console.error('Error checking seats:', error);
    }
  }, [item.id]);

  useEffect(() => {
    // İlk kontrol
    checkSeats();

    // Her 1 dakikada bir kontrol et (optimize edilmiş)
    const interval = setInterval(checkSeats, 60000);

    // Rezervasyon başarılı olduğunda hemen güncelle
    const handleReservationSuccess = (event: CustomEvent) => {
      const { tourId } = event.detail || {};
      // Eğer bu tur için rezervasyon yapıldıysa veya tüm turlar güncelleniyorsa
      if (!tourId || tourId === item.id) {
        checkSeats();
      }
    };

    window.addEventListener('reservation-success' as any, handleReservationSuccess as EventListener);
    window.addEventListener('seats-updated' as any, handleReservationSuccess as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('reservation-success' as any, handleReservationSuccess as EventListener);
      window.removeEventListener('seats-updated' as any, handleReservationSuccess as EventListener);
    };
  }, [item.id, checkSeats]);

  if (isSoldOut) {
    return null; // Kartı tamamen kaldır
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${
      isSurprise ? 'border-4 border-[#E63946] ring-4 ring-[#E63946]/30' : `border-l-4 ${categoryColor.border}`
    } ${isCritical ? 'animate-pulse-slow ring-2 ring-[#E63946]' : ''} ${
      isAnimating ? 'paper-plane-animation' : ''
    }`}>
      <div className={`relative h-56 flex items-center justify-center overflow-hidden ${
        isSurprise ? 'surprise-bg-animated' : `bg-gradient-to-br ${categoryColor.bg}`
      }`}>
        {isSurprise ? (
          <>
            {/* Animated background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E63946] via-[#DAE4F2] to-[#E63946] opacity-75 animate-gradient-shift"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[#DAE4F2] via-[#E63946] to-[#DAE4F2] opacity-50 animate-gradient-shift-reverse"></div>
            {/* Glowing particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#DAE4F2] rounded-full opacity-30 blur-2xl animate-float"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#E63946] rounded-full opacity-20 blur-3xl animate-float-delayed"></div>
              <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-[#DAE4F2] rounded-full opacity-25 blur-xl animate-float-slow"></div>
            </div>
            {/* Question mark */}
            <div className="relative z-10 text-9xl animate-bounce-slow text-white drop-shadow-2xl filter drop-shadow-[0_0_20px_rgba(230,57,70,0.8)]">❓</div>
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

        {/* Sol üst: Geri sayım ibaresi */}
        {timeRemaining.totalSeconds > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md shadow-lg ${
              isSurprise 
                ? 'bg-[#DAE4F2] text-[#1A2A5A]' 
                : 'bg-[#E63946] text-white'
            } ${isCritical ? 'animate-pulse' : ''}`}>
              {/* Kum Saati İkonu */}
              <div className="hourglass-icon text-sm">
                ⏳
              </div>
              {/* Sayaç - Enine dikdörtgen */}
              <div className="flex items-center gap-1 font-mono tabular-nums text-xs font-bold">
                {String(timeRemaining.hours).padStart(2, '0')}:
                {String(timeRemaining.minutes).padStart(2, '0')}:
                {String(timeRemaining.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        {/* Sağ üst: Yanıp sönen koltuk sayısı badge */}
        {currentSeatsLeft > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-[#E63946] text-white px-6 py-3 rounded-lg shadow-2xl font-bold text-base animate-pulse ring-4 ring-[#E63946]/50">
              Son {currentSeatsLeft} Koltuk
            </div>
          </div>
        )}

        {/* Sağ alt (kartın içinde): Kalan koltuk - Kırmızı yuvarlak */}
        {currentSeatsLeft <= 2 && !isSurprise && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className="w-20 h-20 bg-[#E63946] rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <div className="text-center">
                <div className="text-white font-bold text-lg leading-tight">SON</div>
                <div className="text-white font-bold text-2xl leading-tight">{currentSeatsLeft}</div>
                <div className="text-white font-bold text-xs leading-tight">KOLTUK</div>
              </div>
            </div>
          </div>
        )}
        {isCritical && (
          <div className={`absolute inset-0 ${isSurprise ? 'bg-[#E63946]/10' : 'bg-[#E63946]/10'} animate-pulse`} />
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2">
          {isSurprise ? '🎁 Sürpriz Destinasyon' : item.title}
        </h3>

        <div className="space-y-2 mb-4">
          {/* Nereden-Nereye: Sürpriz turlarda gizli */}
          {!isSurprise && (
            <div className="flex items-center text-sm text-primary">
              <span className="font-medium">{item.from}</span>
              <span className="mx-2">→</span>
              <span className="font-medium">{item.to}</span>
            </div>
          )}

          {/* Vize/Pasaport: Sadece sürpriz turlarda */}
          {isSurprise && (
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {item.requiresPassport && (
                <span className="bg-tertiary text-primary px-2 py-1 rounded-md font-medium text-xs">
                  📘 Pasaport Gerekli
                </span>
              )}
              {item.requiresVisa && (
                <span className="bg-tertiary text-primary px-2 py-1 rounded-md font-medium text-xs">
                  📝 Vize Gerekli
                </span>
              )}
            </div>
          )}

          <div className="flex items-center text-sm text-primary">
            <span>📅 {formatDateShort(departureDate)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <div className="text-3xl font-bold text-primary font-montserrat">
              {formatPrice(item.price * 100, item.currency)}
            </div>
            <div className="text-xs text-primary">Kişi başı</div>
          </div>

          <Link
            href={`/item/${item.id}`}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-md"
          >
            Detay →
          </Link>
        </div>
      </div>
    </div>
  );
}

