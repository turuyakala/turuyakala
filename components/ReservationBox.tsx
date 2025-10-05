'use client';

import { useState } from 'react';

type ReservationBoxProps = {
  price: number;
  currency: string;
  seatsLeft: number;
  contact?: {
    phone?: string;
    whatsapp?: string;
  };
};

export default function ReservationBox({ price, currency, seatsLeft, contact }: ReservationBoxProps) {
  const [guests, setGuests] = useState(1);

  const totalPrice = price * guests;
  const currencySymbol = currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : '$';

  const handleReservation = () => {
    const message = `Merhaba! ${guests} kişilik rezervasyon yapmak istiyorum. Toplam: ${totalPrice.toLocaleString('tr-TR')} ${currencySymbol}`;
    const encodedMessage = encodeURIComponent(message);
    
    if (contact?.whatsapp) {
      window.open(`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
    } else if (contact?.phone) {
      window.open(`tel:${contact.phone}`, '_blank');
    } else {
      alert('İletişim bilgisi bulunamadı!');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Rezervasyon Yap</h3>

      {/* Kişi Sayısı Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Kişi Sayısı
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setGuests(Math.max(1, guests - 1))}
            disabled={guests <= 1}
            className="w-12 h-12 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg font-bold text-xl transition-colors"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <div className="text-4xl font-bold text-english-violet">{guests}</div>
            <div className="text-sm text-gray-600">Kişi</div>
          </div>
          <button
            onClick={() => setGuests(Math.min(seatsLeft, guests + 1))}
            disabled={guests >= seatsLeft}
            className="w-12 h-12 bg-english-violet hover:bg-english-violet/90 disabled:bg-gray-100 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl transition-colors"
          >
            +
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Maksimum {seatsLeft} kişi seçebilirsiniz
        </p>
      </div>

      {/* Fiyat Hesaplama */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{price.toLocaleString('tr-TR')} {currencySymbol} × {guests} kişi</span>
          <span className="font-medium">{totalPrice.toLocaleString('tr-TR')} {currencySymbol}</span>
        </div>
        <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
          <span className="font-bold text-gray-900">Toplam</span>
          <span className="text-2xl font-bold text-english-violet">
            {totalPrice.toLocaleString('tr-TR')} {currencySymbol}
          </span>
        </div>
      </div>

      {/* Rezervasyon Butonu */}
      <button
        onClick={handleReservation}
        className="w-full bg-[#563C5C] hover:bg-[#563C5C]/90 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
      >
        🎫 Hemen Rezervasyon Yap
      </button>

      <p className="text-xs text-gray-500 text-center">
        Rezervasyon için WhatsApp üzerinden iletişime geçilecektir
      </p>
    </div>
  );
}




