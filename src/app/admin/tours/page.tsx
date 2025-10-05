'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Tour = {
  id: string;
  title: string;
  from: string;
  to: string;
  startAt: string;
  seatsLeft: number;
  seatsTotal: number;
  price: number;
  currency: string;
  isSurprise: boolean;
  transport?: string;
};

export default function ToursPage() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('startAt');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchTours = async () => {
    try {
      const params = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
      });
      
      const res = await fetch(`/api/admin/tours?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setTours(data.tours);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [search, sortBy, sortOrder]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" turunu silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tours/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTours();
      } else {
        alert('Tur silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Tur silinirken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Turlar</h1>
          <p className="text-gray-600 mt-1">{tours.length} tur bulundu</p>
        </div>
        <Link
          href="/admin/tours/new"
          className="px-6 py-3 bg-[#91A8D0] text-white font-semibold rounded-lg hover:bg-[#7a90bb] transition-colors"
        >
          + Yeni Tur Ekle
        </Link>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Ara (Başlık, Nereden, Nereye)
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sırala
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
              >
                <option value="startAt">Tarih</option>
                <option value="price">Fiyat</option>
                <option value="seatsLeft">Koltuk</option>
                <option value="title">Başlık</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yön
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
              >
                <option value="asc">Artan</option>
                <option value="desc">Azalan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tours List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">✈️</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : tours.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz tur yok</h3>
          <p className="text-gray-600 mb-6">İlk turunuzu ekleyerek başlayın</p>
          <Link
            href="/admin/tours/new"
            className="inline-block px-6 py-3 bg-[#91A8D0] text-white font-semibold rounded-lg hover:bg-[#7a90bb] transition-colors"
          >
            + Yeni Tur Ekle
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kalkış
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Koltuk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {tour.isSurprise && <span className="text-xl">🎁</span>}
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {tour.title}
                          </div>
                          {tour.transport && (
                            <div className="text-xs text-gray-500">{tour.transport}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tour.from} → {tour.isSurprise ? '???' : tour.to}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(tour.startAt).toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tour.seatsLeft <= 2
                          ? 'bg-red-100 text-red-800'
                          : tour.seatsLeft <= 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {tour.seatsLeft}/{tour.seatsTotal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {tour.price.toLocaleString('tr-TR')} {tour.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/admin/tours/edit/${tour.id}`}
                        className="text-[#91A8D0] hover:text-[#7a90bb] font-medium"
                      >
                        ✏️ Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(tour.id, tour.title)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        🗑️ Sil
                      </button>
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
