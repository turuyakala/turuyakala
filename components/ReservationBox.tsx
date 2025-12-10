'use client';

import { useState } from 'react';
import ReservationModal from './ReservationModal';

type ReservationBoxProps = {
  tourId: string;
  price: number;
  originalPrice?: number;
  currency: string;
  seatsLeft: number;
  requiresPassport?: boolean;
  contact?: {
    phone?: string;
    whatsapp?: string;
  };
  tourTitle?: string;
  tourFrom?: string;
  tourTo?: string;
  tourStartAt?: string;
};

export default function ReservationBox({ 
  tourId, 
  price, 
  originalPrice,
  currency, 
  seatsLeft, 
  requiresPassport, 
  contact,
  tourTitle = '',
  tourFrom = '',
  tourTo = '',
  tourStartAt = '',
}: ReservationBoxProps) {
  const [guests, setGuests] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPrice = price * guests;
  const currencySymbol = currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : '$';

  const handleReservation = () => {
    setIsModalOpen(true);
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
        {originalPrice && originalPrice > price ? (
          <div className="space-y-1 mb-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Asıl Fiyat:</span>
              <span className="line-through">{originalPrice.toLocaleString('tr-TR')} {currencySymbol} × {guests} kişi</span>
            </div>
            <div className="flex justify-between text-sm text-primary">
              <span>İndirimli Fiyatımız:</span>
              <span className="font-medium">{price.toLocaleString('tr-TR')} {currencySymbol} × {guests} kişi</span>
            </div>
            <div className="text-xs text-green-600 font-medium text-right">
              %{Math.round(((originalPrice - price) / originalPrice) * 100)} İndirim
            </div>
          </div>
        ) : (
          <div className="flex justify-between text-sm text-primary">
            <span>{price.toLocaleString('tr-TR')} {currencySymbol} × {guests} kişi</span>
            <span className="font-medium">{totalPrice.toLocaleString('tr-TR')} {currencySymbol}</span>
          </div>
        )}
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
        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
      >
        <img src="/logo.png" alt="Turu Yakala" className="w-6 h-6 object-contain" />
        Şimdi Turu Yakala!
      </button>

      <p className="text-xs text-primary text-center">
        Rezervasyon için WhatsApp üzerinden iletişime geçilecektir
      </p>

      {/* Rezervasyon Modal */}
      {isModalOpen && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tourId={tourId}
          tourTitle={tourTitle}
          tourFrom={tourFrom}
          tourTo={tourTo}
          tourStartAt={tourStartAt}
          price={price}
          currency={currency}
          guests={guests}
          totalPrice={totalPrice}
          requiresPassport={requiresPassport}
          seatsLeft={seatsLeft}
        />
      )}
    </div>
  );
}




