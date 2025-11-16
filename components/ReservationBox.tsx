'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ReservationBoxProps = {
  tourId: string;
  price: number;
  currency: string;
  seatsLeft: number;
  requiresPassport?: boolean;
  contact?: {
    phone?: string;
    whatsapp?: string;
  };
};

export default function ReservationBox({ tourId, price, currency, seatsLeft, requiresPassport, contact }: ReservationBoxProps) {
  const router = useRouter();
  const [guests, setGuests] = useState(1);

  const totalPrice = price * guests;
  const currencySymbol = currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : '$';

  const handleReservation = () => {
    // Redirect to reservation page with tour ID and guest count
    router.push(`/reservation/${tourId}?guests=${guests}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 space-y-6">
      <h3 className="text-xl font-bold text-primary">Rezervasyon Yap</h3>

      {/* Kişi Sayısı Seçimi */}
      <div>
        <label className="block text-sm font-medium text-primary mb-3">
          Kişi Sayısı
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setGuests(Math.max(1, guests - 1))}
            disabled={guests <= 1}
            className="w-12 h-12 bg-tertiary hover:bg-tertiary/80 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg font-bold text-xl text-primary transition-colors"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <div className="text-4xl font-bold text-primary">{guests}</div>
            <div className="text-sm text-primary">Kişi</div>
          </div>
          <button
            onClick={() => setGuests(Math.min(seatsLeft, guests + 1))}
            disabled={guests >= seatsLeft}
            className="w-12 h-12 bg-primary hover:bg-primary/90 disabled:bg-gray-100 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl transition-colors"
          >
            +
          </button>
        </div>
        <p className="text-xs text-primary mt-2 text-center">
          Maksimum {seatsLeft} kişi seçebilirsiniz
        </p>
      </div>

      {/* Fiyat Hesaplama */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm text-primary">
          <span>{price.toLocaleString('tr-TR')} {currencySymbol} × {guests} kişi</span>
          <span className="font-medium">{totalPrice.toLocaleString('tr-TR')} {currencySymbol}</span>
        </div>
        <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
          <span className="font-bold text-primary">Toplam</span>
          <span className="text-2xl font-bold text-primary">
            {totalPrice.toLocaleString('tr-TR')} {currencySymbol}
          </span>
        </div>
      </div>

      {/* Rezervasyon Butonu */}
      <button
        onClick={handleReservation}
        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
      >
        🎫 Hemen Rezervasyon Yap
      </button>

      <p className="text-xs text-primary text-center">
        Rezervasyon için WhatsApp üzerinden iletişime geçilecektir
      </p>
    </div>
  );
}




