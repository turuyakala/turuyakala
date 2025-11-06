'use client';

import { useState } from 'react';

type TourTabsProps = {
  description?: string;
  program?: string[];
  included?: string[];
  excluded?: string[];
  importantInfo?: string[];
};

export default function TourTabs({
  description,
  program,
  included,
  excluded,
  importantInfo,
}: TourTabsProps) {
  const [activeTab, setActiveTab] = useState<'program' | 'included' | 'info' | 'cancel'>('program');

  const tabs = [
    { id: 'program', label: '📋 Program', icon: '📋' },
    { id: 'included', label: '✅ Dahil Olanlar', icon: '✅' },
    { id: 'info', label: 'ℹ️ Önemli Bilgiler', icon: 'ℹ️' },
    { id: 'cancel', label: '❌ İptal Koşulları', icon: '❌' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Sekmeler */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-6 py-4 font-semibold text-sm md:text-base transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#91A8D0] text-white border-b-2 border-[#91A8D0]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* İçerik */}
      <div className="p-6 md:p-8">
        {/* Program */}
        {activeTab === 'program' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Tur Programı</h3>
            {description && (
              <p className="text-gray-700 leading-relaxed mb-6">{description}</p>
            )}
            {program && program.length > 0 ? (
              <div className="space-y-4">
                {program.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#91A8D0] text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 bg-gray-50 p-6 rounded-lg text-center">
                Bu tur için detaylı program bilgisi henüz eklenmemiştir.
              </p>
            )}
          </div>
        )}

        {/* Dahil Olanlar/Olmayanlar */}
        {activeTab === 'included' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dahil Olanlar */}
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Dahil Olanlar
              </h3>
              {included && included.length > 0 ? (
                <ul className="space-y-3">
                  {included.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                      <span className="text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  Bilgi bulunmamaktadır.
                </p>
              )}
            </div>

            {/* Dahil Olmayanlar */}
            <div>
              <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                <span className="text-2xl">❌</span>
                Dahil Olmayanlar
              </h3>
              {excluded && excluded.length > 0 ? (
                <ul className="space-y-3">
                  {excluded.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-red-500 text-xl flex-shrink-0">✗</span>
                      <span className="text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  Bilgi bulunmamaktadır.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Önemli Bilgiler */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Önemli Bilgiler</h3>
            {importantInfo && importantInfo.length > 0 ? (
              <div className="space-y-3">
                {importantInfo.map((info, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-800 flex items-start gap-3">
                      <span className="text-blue-500 text-xl flex-shrink-0">ℹ️</span>
                      {info}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 bg-gray-50 p-6 rounded-lg text-center">
                Bu tur için önemli bilgi eklenmemiştir.
              </p>
            )}
          </div>
        )}

        {/* İptal Koşulları */}
        {activeTab === 'cancel' && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">İptal ve İade Koşulları</h3>
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-5xl">⚠️</span>
                <div>
                  <h4 className="text-xl font-bold text-red-600 mb-3">
                    Bu Tur Kesinlikle İptal Edilemez!
                  </h4>
                  <div className="space-y-2 text-gray-800">
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Son dakika turu olduğu için rezervasyon sonrası iptal kabul edilmez.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Ödeme yapıldıktan sonra iade yapılmaz.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Tarih değişikliği yapılamaz.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>İsim değişikliği yapılabilir (ek ücret karşılığında).</span>
                    </p>
                  </div>
                  <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                    <p className="text-sm text-gray-800">
                      <strong>💡 Not:</strong> Rezervasyon yapmadan önce tarih ve detayları dikkatlice kontrol ediniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}












