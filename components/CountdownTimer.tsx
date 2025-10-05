'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(172800); // 2 gün = 48 saat = 172800 saniye

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Sayaç bittiğinde sayfayı yenile
          window.location.reload();
          return 172800; // 2 gün - Yeniden başlat
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-500 rounded-xl p-3">
      {/* Sayaç Kutusu */}
      <div className="bg-red-500 text-white rounded-lg px-3 py-2 min-w-[140px] text-center shadow-lg">
        <div className="text-xl font-bold font-mono tabular-nums">
          {days}G {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
      
      {/* Açıklama */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">
          ⏰ Yeni Sürpriz Turlar için geri sayım
        </p>
        <p className="text-xs text-gray-600 mt-0.5">
          Sayaç bittiğinde otomatik yenilenecek
        </p>
      </div>
    </div>
  );
}
