'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ id: string }>;
};

type Offer = {
  id: string;
  vendorOfferId: string;
  supplierId: string;
  title: string;
  category: string;
  from: string;
  to: string;
  startAt: string;
  seatsTotal: number;
  seatsLeft: number;
  price: number;
  currency: string;
  image: string | null;
  terms: string | null;
  transport: string | null;
  status: string;
  importedToInventory: boolean;
  inventoryItemId: string | null;
  rawData: any;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
  supplier: {
    id: string;
    name: string;
    integrationMode: string;
  };
};

export default function OfferDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offer, setOffer] = useState<Offer | null>(null);

  useEffect(() => {
    fetchOffer();
  }, [resolvedParams.id]);

  const fetchOffer = async () => {
    try {
      const res = await fetch(`/api/admin/offers/${resolvedParams.id}`);
      if (!res.ok) throw new Error('Offer bulunamadı');
      const data = await res.json();
      setOffer(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 font-semibold">🆕 Yeni</span>;
      case 'imported':
        return <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-semibold">✓ İçe Aktarıldı</span>;
      case 'ignored':
        return <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 font-semibold">⊘ Yok Sayıldı</span>;
      case 'expired':
        return <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-semibold">⏰ Süresi Doldu</span>;
      default:
        return <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl space-y-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">📦</div>
          <p className="text-gray-600">Offer yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="max-w-6xl space-y-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Hata</h3>
          <p className="text-gray-600">{error}</p>
          <Link
            href="/admin/offers"
            className="mt-6 inline-block px-6 py-3 bg-[#91A8D0] text-white font-semibold rounded-lg hover:bg-[#7a90bb] transition-colors"
          >
            ← Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offer Detayı</h1>
          <p className="text-gray-600 mt-1">Salt okunur görünüm</p>
        </div>
        <Link
          href="/admin/offers"
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
        >
          ← Geri
        </Link>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusBadge(offer.status)}
            {offer.importedToInventory && (
              <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800 font-semibold">
                📋 Envanterde
              </span>
            )}
          </div>
          {offer.inventoryItemId && (
            <Link
              href={`/admin/tours/edit/${offer.inventoryItemId}`}
              className="text-[#91A8D0] hover:text-[#7a90bb] font-medium"
            >
              → Envanter Kaydına Git
            </Link>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Offer Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Offer Bilgileri</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Başlık</label>
                <p className="text-lg font-semibold text-gray-900">{offer.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nereden</label>
                  <p className="text-gray-900">{offer.from}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nereye</label>
                  <p className="text-gray-900">{offer.to}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Kategori</label>
                  <p className="text-gray-900">{offer.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ulaşım</label>
                  <p className="text-gray-900">{offer.transport || '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Kalkış Tarihi</label>
                <p className="text-gray-900">
                  {new Date(offer.startAt).toLocaleString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Toplam Koltuk</label>
                  <p className="text-gray-900 font-semibold">{offer.seatsTotal}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Kalan Koltuk</label>
                  <p className="text-gray-900 font-semibold">{offer.seatsLeft}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Dolu</label>
                  <p className="text-gray-900 font-semibold">{offer.seatsTotal - offer.seatsLeft}</p>
                </div>
              </div>

              {offer.terms && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Koşullar</label>
                  <p className="text-gray-700 whitespace-pre-wrap">{offer.terms}</p>
                </div>
              )}

              {offer.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Görsel</label>
                  <img src={offer.image} alt={offer.title} className="w-full h-64 object-cover rounded-lg" />
                </div>
              )}
            </div>
          </div>

          {/* Raw JSON */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ham Veri (Raw JSON)</h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono text-gray-800">
              {JSON.stringify(offer.rawData, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right Column - Meta Info */}
        <div className="space-y-6">
          {/* Supplier Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tedarikçi</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">İsim</label>
                <Link
                  href={`/admin/suppliers/edit/${offer.supplier.id}`}
                  className="text-[#91A8D0] hover:text-[#7a90bb] font-medium"
                >
                  {offer.supplier.name} →
                </Link>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Entegrasyon Modu</label>
                <p className="text-gray-900 capitalize">{offer.supplier.integrationMode}</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Fiyat</h3>
            <div className="text-4xl font-bold">
              {offer.price.toLocaleString('tr-TR')}
              <span className="text-xl ml-2">{offer.currency}</span>
            </div>
            <p className="text-sm mt-2 opacity-90">Kişi başı</p>
          </div>

          {/* IDs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Kimlikler</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Offer ID</label>
                <code className="block text-xs bg-gray-100 p-2 rounded font-mono text-gray-800 break-all">
                  {offer.id}
                </code>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Vendor Offer ID</label>
                <code className="block text-xs bg-gray-100 p-2 rounded font-mono text-gray-800 break-all">
                  {offer.vendorOfferId}
                </code>
              </div>
              {offer.inventoryItemId && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Envanter ID</label>
                  <code className="block text-xs bg-gray-100 p-2 rounded font-mono text-gray-800 break-all">
                    {offer.inventoryItemId}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Zaman Damgaları</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Oluşturulma</label>
                <p className="text-gray-900">
                  {new Date(offer.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Son Güncelleme</label>
                <p className="text-gray-900">
                  {new Date(offer.updatedAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Son Senkronizasyon</label>
                <p className="text-gray-900 font-semibold">
                  {new Date(offer.lastSyncedAt).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

