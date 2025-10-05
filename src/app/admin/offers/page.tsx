'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Offer = {
  id: string;
  vendorOfferId: string;
  title: string;
  from: string;
  to: string;
  startAt: string;
  seatsLeft: number;
  seatsTotal: number;
  price: number;
  currency: string;
  status: string;
  importedToInventory: boolean;
  lastSyncedAt: string;
  supplier: {
    name: string;
  };
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastSyncedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchOffers = async () => {
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
      
      const res = await fetch(`/api/admin/offers?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [search, statusFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-semibold">🆕 Yeni</span>;
      case 'imported':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-semibold">✓ İçe Aktarıldı</span>;
      case 'ignored':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-semibold">⊘ Yok Sayıldı</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-semibold">⏰ Süresi Doldu</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Envanter (Offerlar)</h1>
          <p className="text-gray-600 mt-1">Tedarikçilerden çekilen ham offerlar - {offers.length} adet</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Ara
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Başlık, Vendor ID, Nereden, Nereye..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            >
              <option value="all">Tümü</option>
              <option value="new">🆕 Yeni</option>
              <option value="imported">✓ İçe Aktarıldı</option>
              <option value="ignored">⊘ Yok Sayıldı</option>
              <option value="expired">⏰ Süresi Doldu</option>
            </select>
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
                <option value="lastSyncedAt">Sync Zamanı</option>
                <option value="startAt">Kalkış</option>
                <option value="price">Fiyat</option>
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
                <option value="desc">Azalan</option>
                <option value="asc">Artan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Offers List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">📦</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz offer yok</h3>
          <p className="text-gray-600 mb-6">Tedarikçilerden veri çekildiğinde burada görünecek</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor ID / Tedarikçi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Offer
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Sync
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detay
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{offer.vendorOfferId}</div>
                      <div className="text-xs text-gray-500">{offer.supplier.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                        {offer.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {offer.from} → {offer.to}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(offer.startAt).toLocaleString('tr-TR', {
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
                        offer.seatsLeft === 0
                          ? 'bg-red-100 text-red-800'
                          : offer.seatsLeft <= 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {offer.seatsLeft}/{offer.seatsTotal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {offer.price.toLocaleString('tr-TR')} {offer.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(offer.status)}
                      {offer.importedToInventory && (
                        <div className="mt-1 text-xs text-green-600">✓ Envanterdesiniz</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(offer.lastSyncedAt).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/offers/${offer.id}`}
                        className="text-[#91A8D0] hover:text-[#7a90bb] font-medium"
                      >
                        👁️ Görüntüle
                      </Link>
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

