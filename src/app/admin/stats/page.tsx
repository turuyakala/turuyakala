'use client';

import { useEffect, useState } from 'react';
import IntegrationHealthWidget from '../components/IntegrationHealthWidget';

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [lastCleanup, setLastCleanup] = useState<{
    lastCleanup: string | null;
    metadata: any;
  } | null>(null);
  const [errorFlag, setErrorFlag] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch stats
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((error) => {
        console.error('Error fetching stats:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Fetch last cleanup
    fetch('/api/admin/stats/last-cleanup')
      .then((res) => res.json())
      .then((data) => {
        setLastCleanup(data);
      })
      .catch((error) => {
        console.error('Error fetching last cleanup:', error);
      });

    // Fetch error flag
    fetch('/api/admin/dashboard/error-flag')
      .then((res) => res.json())
      .then((data) => {
        setErrorFlag(data);
      })
      .catch((error) => {
        console.error('Error fetching error flag:', error);
      });
  }, []);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gün önce`;
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-gray-600">İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">İstatistikler ve Raporlar</h1>
        <p className="text-gray-600 mt-2">Sistem genelindeki veriler ve analizler</p>
      </div>

      {/* Error Flag */}
      {errorFlag && errorFlag.errorCount > 0 && (
        <div className={`rounded-lg shadow-md p-6 mb-8 ${
          errorFlag.severity === 'critical'
            ? 'bg-gradient-to-r from-red-50 to-red-100 border border-red-300'
            : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm font-medium mb-1 ${
                errorFlag.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                🚨 Son 24 Saatte Hata Tespit Edildi
              </div>
              <div className={`text-3xl font-bold ${
                errorFlag.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
              }`}>
                {errorFlag.errorCount} Hata
              </div>
              {errorFlag.errorsByAction && errorFlag.errorsByAction.length > 0 && (
                <div className="mt-3 space-y-1">
                  {errorFlag.errorsByAction.slice(0, 3).map((item: any) => (
                    <div key={item.action} className="text-xs">
                      <span className={`font-semibold ${
                        errorFlag.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        {item.action}:
                      </span>
                      <span className={`ml-2 ${
                        errorFlag.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        {item._count.action} kez
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <a
                href="/admin/errors"
                className={`inline-block px-4 py-2 rounded-lg font-semibold transition-colors ${
                  errorFlag.severity === 'critical'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                Hataları Görüntüle →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Last Cleanup */}
      {lastCleanup?.lastCleanup && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-purple-600 mb-1">
                🧹 Son Temizlik
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {new Date(lastCleanup.lastCleanup).toLocaleString('tr-TR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </div>
              <div className="text-xs text-purple-600 mt-2">
                {getTimeAgo(lastCleanup.lastCleanup)}
              </div>
              {lastCleanup.metadata && (
                <div className="flex gap-4 mt-3 text-xs">
                  <span className="bg-purple-100 px-2 py-1 rounded">
                    ⏰ {lastCleanup.metadata.expired || 0} expired
                  </span>
                  <span className="bg-purple-100 px-2 py-1 rounded">
                    🎟️ {lastCleanup.metadata.soldOut || 0} sold out
                  </span>
                  <span className="bg-purple-100 px-2 py-1 rounded">
                    ⚡ {lastCleanup.metadata.duration || 0}s
                  </span>
                </div>
              )}
            </div>
            <div className="text-6xl">⏰</div>
          </div>
        </div>
      )}

      {/* Integration Health Widget */}
      <div className="mb-8">
        <IntegrationHealthWidget />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Toplam Tur</p>
              <p className="text-4xl font-bold mt-2">{stats.totalTours || 0}</p>
            </div>
            <div className="text-5xl opacity-50">🏞️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Son 7 Gün</p>
              <p className="text-4xl font-bold mt-2">{stats.recentTours || 0}</p>
            </div>
            <div className="text-5xl opacity-50">📅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Toplam Kullanıcı</p>
              <p className="text-4xl font-bold mt-2">{stats.totalUsers || 0}</p>
            </div>
            <div className="text-5xl opacity-50">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Kritik Turlar</p>
              <p className="text-4xl font-bold mt-2">{stats.criticalTours?.length || 0}</p>
            </div>
            <div className="text-5xl opacity-50">⚠️</div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      {stats.toursByCategory && stats.toursByCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kategori Dağılımı</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.toursByCategory.map((cat: any) => (
              <div key={cat.category} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl mb-2">
                  {cat.category === 'tours' && '🏞️'}
                  {cat.category === 'flights' && '✈️'}
                  {cat.category === 'buses' && '🚌'}
                  {cat.category === 'ships' && '🚢'}
          </div>
                <div className="text-2xl font-bold text-gray-900">{cat._count.category}</div>
                <div className="text-sm text-gray-600 capitalize">{cat.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Tours */}
      {stats.criticalTours && stats.criticalTours.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Kritik Durumda Turlar (Az Koltuk)</h2>
            <p className="text-gray-600 text-sm mt-1">2 veya daha az koltuk kalan turlar</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tur Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kalan Koltuk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.criticalTours.map((tour: any) => (
                  <tr key={tour.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{tour.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-gray-600">{tour.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${tour.seatsLeft === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                        {tour.seatsLeft} / {tour.seatsTotal}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {tour.seatsLeft === 0 ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          DOLU
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          KRİTİK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming Tours (24h) */}
      {stats.upcomingTours && stats.upcomingTours.length > 0 && (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Yakın Kalkışlar (24 Saat İçinde)</h2>
            <p className="text-gray-600 text-sm mt-1">Önümüzdeki 24 saatte kalkacak turlar</p>
        </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tur Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kalkış</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kalan Koltuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.upcomingTours.map((tour: any) => (
                  <tr key={tour.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{tour.title}</div>
                      <div className="text-sm text-gray-600">{tour.startLocation} → {tour.endLocation}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(tour.startAt).toLocaleString('tr-TR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
              </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {tour.seatsLeft} / {tour.seatsTotal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
