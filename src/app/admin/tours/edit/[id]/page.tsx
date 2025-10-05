'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function EditTourPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    category: 'tour',
    title: '',
    from: '',
    to: '',
    startAt: '',
    seatsTotal: '',
    seatsLeft: '',
    price: '',
    currency: 'TRY',
    supplierId: '',
    transport: '',
    phone: '',
    whatsapp: '',
    image: '',
    terms: '',
    isSurprise: false,
    requiresVisa: false,
    requiresPassport: false,
    status: 'active',
  });

  useEffect(() => {
    fetchTour();
  }, [resolvedParams.id]);

  const fetchTour = async () => {
    try {
      const res = await fetch(`/api/admin/tours/${resolvedParams.id}`);
      if (!res.ok) throw new Error('Tur bulunamadı');
      const tour = await res.json();

      // Convert date to datetime-local format
      const date = new Date(tour.startAt);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        category: tour.category || 'tour',
        title: tour.title,
        from: tour.from,
        to: tour.to,
        startAt: localDate,
        seatsTotal: tour.seatsTotal.toString(),
        seatsLeft: tour.seatsLeft.toString(),
        price: tour.price.toString(), // Already converted from priceMinor in API
        currency: tour.currency || 'TRY',
        supplierId: tour.supplierId || '',
        transport: tour.transport || '',
        phone: tour.contact?.phone || '',
        whatsapp: tour.contact?.whatsapp || '',
        image: tour.image || '',
        terms: tour.terms || '',
        isSurprise: tour.isSurprise || false,
        requiresVisa: tour.requiresVisa || false,
        requiresPassport: tour.requiresPassport || false,
        status: tour.status || 'active',
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/tours/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          seatsTotal: parseInt(formData.seatsTotal),
          seatsLeft: parseInt(formData.seatsLeft),
          price: parseFloat(formData.price),
          contact: formData.phone || formData.whatsapp ? {
            phone: formData.phone,
            whatsapp: formData.whatsapp,
          } : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Tur güncellenirken hata oluştu');
      }

      setSuccess('Tur başarıyla güncellendi!');
      setTimeout(() => {
        router.push('/admin/tours');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">✈️</div>
          <p className="text-gray-600">Tur bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tur Düzenle</h1>
          <p className="text-gray-600 mt-1">Tur bilgilerini güncelleyin</p>
        </div>
        <Link
          href="/admin/tours"
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
        >
          ← Geri
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            {success}
          </div>
        )}

        {/* Sürpriz Tur */}
        <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <input
            type="checkbox"
            id="isSurprise"
            name="isSurprise"
            checked={formData.isSurprise}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label htmlFor="isSurprise" className="font-semibold text-gray-900 cursor-pointer">
            🎁 Sürpriz Tur (Destinasyon gizli)
          </label>
        </div>

        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tur Başlığı *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nereden *
            </label>
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nereye *
            </label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ulaşım Şekli
            </label>
            <select
              name="transport"
              value={formData.transport}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            >
              <option value="">Seçiniz</option>
              <option value="Uçak ile">Uçak ile</option>
              <option value="Otobüs ile">Otobüs ile</option>
              <option value="Minibüs ile">Minibüs ile</option>
              <option value="Özel Araç ile">Özel Araç ile</option>
              <option value="Tekne ile">Tekne ile</option>
              <option value="Tren ile">Tren ile</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kalkış Tarihi ve Saati *
            </label>
            <input
              type="datetime-local"
              name="startAt"
              value={formData.startAt}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Sürpriz Tur Detayları */}
        {formData.isSurprise && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresPassport"
                name="requiresPassport"
                checked={formData.requiresPassport}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label htmlFor="requiresPassport" className="text-sm font-medium text-gray-700 cursor-pointer">
                📘 Pasaport Gerekli
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresVisa"
                name="requiresVisa"
                checked={formData.requiresVisa}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label htmlFor="requiresVisa" className="text-sm font-medium text-gray-700 cursor-pointer">
                📝 Vize Gerekli
              </label>
            </div>
          </div>
        )}

        {/* Kapasite ve Fiyat */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toplam Koltuk *
            </label>
            <input
              type="number"
              name="seatsTotal"
              value={formData.seatsTotal}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kalan Koltuk *
            </label>
            <input
              type="number"
              name="seatsLeft"
              value={formData.seatsLeft}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiyat *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para Birimi *
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            >
              <option value="TRY">₺ TRY</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Görsel ve Durum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Görsel URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            >
              <option value="active">✅ Aktif</option>
              <option value="inactive">⏸️ Pasif</option>
              <option value="expired">⏰ Süresi Dolmuş</option>
              <option value="sold_out">🔴 Tükendi</option>
            </select>
          </div>
        </div>

        {/* Koşullar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İptal Koşulları ve Önemli Notlar
          </label>
          <textarea
            name="terms"
            value={formData.terms}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#91A8D0] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#7a90bb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Kaydediliyor...' : '✅ Değişiklikleri Kaydet'}
          </button>
          <Link
            href="/admin/tours"
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}


