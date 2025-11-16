'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewTourPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
    images: '', // Çoklu görseller (her satıra bir URL)
    terms: '',
    description: '',
    program: '',
    included: '',
    excluded: '',
    importantInfo: '',
    departureAddress: '',
    departureLat: '',
    departureLng: '',
    checkInTime: '',
    checkOutTime: '',
    roomRules: '',
    petFriendly: false,
    languages: '',
    paymentMethods: '',
    // Flight Info
    airline: '',
    flightNumber: '',
    departureAirport: '',
    arrivalAirport: '',
    flightDepartureTime: '',
    flightArrivalTime: '',
    // Hotel Info
    hotelName: '',
    hotelStars: '',
    hotelLocation: '',
    hotelAddress: '',
    hotelAmenities: '',
    hotelExtraInfoUrl: '',
    isSurprise: false,
    requiresVisa: false,
    requiresPassport: false,
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Parse arrays from newline-separated strings
      const parseArray = (str: string) => str.split('\n').filter(line => line.trim()).map(line => line.trim());
      
      const response = await fetch('/api/admin/tours', {
        method: 'POST',
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
          description: formData.description || undefined,
          images: formData.images ? parseArray(formData.images) : undefined,
          program: formData.program ? parseArray(formData.program) : undefined,
          included: formData.included ? parseArray(formData.included) : undefined,
          excluded: formData.excluded ? parseArray(formData.excluded) : undefined,
          importantInfo: formData.importantInfo ? parseArray(formData.importantInfo) : undefined,
          departureLocation: formData.departureAddress && formData.departureLat && formData.departureLng ? {
            address: formData.departureAddress,
            lat: parseFloat(formData.departureLat),
            lng: parseFloat(formData.departureLng),
          } : undefined,
          checkInTime: formData.checkInTime || undefined,
          checkOutTime: formData.checkOutTime || undefined,
          roomRules: formData.roomRules ? parseArray(formData.roomRules) : undefined,
          petFriendly: formData.petFriendly,
          languages: formData.languages ? parseArray(formData.languages) : undefined,
          paymentMethods: formData.paymentMethods ? parseArray(formData.paymentMethods) : undefined,
          flightInfo: (formData.airline || formData.flightNumber) ? {
            airline: formData.airline,
            flightNumber: formData.flightNumber,
            departureAirport: formData.departureAirport,
            arrivalAirport: formData.arrivalAirport,
            departureTime: formData.flightDepartureTime,
            arrivalTime: formData.flightArrivalTime,
          } : undefined,
          hotelInfo: (formData.hotelName || formData.hotelLocation) ? {
            name: formData.hotelName,
            stars: formData.hotelStars ? parseInt(formData.hotelStars) : null,
            location: formData.hotelLocation,
            address: formData.hotelAddress,
            amenities: formData.hotelAmenities ? parseArray(formData.hotelAmenities) : [],
            extraInfoUrl: formData.hotelExtraInfoUrl || null,
          } : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Tur eklenirken bir hata oluştu');
      }

      router.push('/admin/tours');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
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

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Tur Ekle</h1>
          <p className="text-gray-600 mt-1">Son dakika fırsatı oluşturun</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
            >
              <option value="tour">🏞️ Tur</option>
              <option value="bus">🚌 Otobüs</option>
              <option value="flight">✈️ Uçuş</option>
              <option value="cruise">🚢 Gemi</option>
            </select>
          </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="Örn: Kapadokya Balon Turu"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="İstanbul"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nereye * {formData.isSurprise && <span className="text-xs text-gray-500">(Kullanıcılara gösterilmez)</span>}
            </label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="Kapadokya"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="+90 555 123 4567"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="905551234567"
            />
          </div>
        </div>

        {/* Görsel ve Durum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ana Görsel URL *
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="/images/tour.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Tur kartında gösterilecek ana görsel</p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
            >
              <option value="active">✅ Aktif</option>
              <option value="inactive">⏸️ Pasif</option>
              <option value="expired">⏰ Süresi Dolmuş</option>
              <option value="sold_out">🔴 Tükendi</option>
            </select>
          </div>
        </div>

        {/* Çoklu Görseller */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ek Görseller (Her satıra bir görsel URL)
          </label>
          <textarea
            name="images"
            value={formData.images}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900 font-mono text-sm"
            placeholder="/images/tour-1.jpg&#10;/images/tour-2.jpg&#10;/images/tour-3.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">Tur detay sayfasında gösterilecek ek görseller (her satıra bir URL)</p>
        </div>

        {/* Detaylı Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detaylı Açıklama
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            placeholder="Tur hakkında detaylı bilgi..."
          />
        </div>

        {/* Program */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program (Her satıra bir gün/aktivite yazın)
          </label>
          <textarea
            name="program"
            value={formData.program}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900 font-mono text-sm"
            placeholder="Gün 1: İstanbul'dan kalkış&#10;Gün 2: Kapadokya'da balon turu&#10;Gün 3: Dönüş"
          />
          <p className="text-xs text-gray-500 mt-1">Her satıra bir gün/aktivite yazın</p>
        </div>

        {/* Dahil Olanlar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dahil Olanlar (Her satıra bir madde)
          </label>
          <textarea
            name="included"
            value={formData.included}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900 font-mono text-sm"
            placeholder="Kahvaltı&#10;Öğle yemeği&#10;Rehberlik hizmeti&#10;Transfer"
          />
          <p className="text-xs text-gray-500 mt-1">Her satıra bir madde yazın</p>
        </div>

        {/* Dahil Olmayanlar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dahil Olmayanlar (Her satıra bir madde)
          </label>
          <textarea
            name="excluded"
            value={formData.excluded}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900 font-mono text-sm"
            placeholder="İçecekler&#10;Ekstra aktiviteler&#10;Kişisel harcamalar"
          />
          <p className="text-xs text-gray-500 mt-1">Her satıra bir madde yazın</p>
        </div>

        {/* Önemli Bilgiler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Önemli Bilgiler (Her satıra bir bilgi)
          </label>
          <textarea
            name="importantInfo"
            value={formData.importantInfo}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900 font-mono text-sm"
            placeholder="Pasaport gerekli&#10;Vize gerekli&#10;Minimum yaş: 18&#10;Sağlık sigortası önerilir"
          />
          <p className="text-xs text-gray-500 mt-1">Her satıra bir bilgi yazın</p>
        </div>

        {/* Kalkış Lokasyonu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kalkış Adresi
            </label>
            <input
              type="text"
              name="departureAddress"
              value={formData.departureAddress}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="Örn: İstanbul Havalimanı, Terminal 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlem (Latitude)
            </label>
            <input
              type="number"
              step="any"
              name="departureLat"
              value={formData.departureLat}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="41.0082"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Boylam (Longitude)
            </label>
            <input
              type="number"
              step="any"
              name="departureLng"
              value={formData.departureLng}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="28.9784"
            />
          </div>
        </div>

        {/* Giriş/Çıkış Zamanları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giriş Zamanı
            </label>
            <input
              type="time"
              name="checkInTime"
              value={formData.checkInTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="14:00"
            />
            <p className="text-xs text-gray-500 mt-1">Örn: 14:00</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Çıkış Zamanı
            </label>
            <input
              type="time"
              name="checkOutTime"
              value={formData.checkOutTime}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              placeholder="11:00"
            />
            <p className="text-xs text-gray-500 mt-1">Örn: 11:00</p>
          </div>
        </div>

        {/* Oda Kuralları */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Oda Kuralları (Her satıra bir kural)
          </label>
          <textarea
            name="roomRules"
            value={formData.roomRules}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900 font-mono text-sm"
            placeholder="Sigara içilmez&#10;Ses yapılmaz&#10;Gece 22:00'den sonra sessizlik&#10;Çocuklar için uygun"
          />
          <p className="text-xs text-gray-500 mt-1">Her satıra bir kural yazın</p>
        </div>

        {/* Hayvan Girebilirliği */}
        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-300 rounded-lg">
          <input
            type="checkbox"
            id="petFriendly"
            name="petFriendly"
            checked={formData.petFriendly}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label htmlFor="petFriendly" className="font-semibold text-gray-900 cursor-pointer">
            🐾 Hayvan Girebilir (Pet Friendly)
          </label>
        </div>

        {/* Kullanılan Diller */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kullanılan Diller (Her satıra bir dil)
          </label>
          <textarea
            name="languages"
            value={formData.languages}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900 font-mono text-sm"
            placeholder="Türkçe&#10;İngilizce&#10;Almanca"
          />
          <p className="text-xs text-gray-500 mt-1">Her satıra bir dil yazın</p>
        </div>

        {/* Ödeme Yöntemleri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ödeme Yöntemleri (Her satıra bir yöntem)
          </label>
          <textarea
            name="paymentMethods"
            value={formData.paymentMethods}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900 font-mono text-sm"
            placeholder="Nakit&#10;Kredi Kartı&#10;Banka Transferi&#10;Havale/EFT"
          />
          <p className="text-xs text-gray-500 mt-1">Her satıra bir ödeme yöntemi yazın</p>
        </div>

        {/* Uçak Bilgileri */}
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✈️</span>
            <h3 className="text-lg font-semibold text-gray-900">Uçak Bilgileri</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Havayolu
              </label>
              <input
                type="text"
                name="airline"
                value={formData.airline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
                placeholder="Örn: Turkish Airlines"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uçuş Numarası
              </label>
              <input
                type="text"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
                placeholder="Örn: TK1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kalkış Havalimanı
              </label>
              <input
                type="text"
                name="departureAirport"
                value={formData.departureAirport}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
                placeholder="Örn: İstanbul (IST)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Varış Havalimanı
              </label>
              <input
                type="text"
                name="arrivalAirport"
                value={formData.arrivalAirport}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
                placeholder="Örn: Antalya (AYT)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kalkış Saati
              </label>
              <input
                type="time"
                name="flightDepartureTime"
                value={formData.flightDepartureTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Varış Saati
              </label>
              <input
                type="time"
                name="flightArrivalTime"
                value={formData.flightArrivalTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Otel Bilgileri */}
        <div className="bg-purple-50 border border-purple-300 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏨</span>
            <h3 className="text-lg font-semibold text-gray-900">Otel Bilgileri</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otel Adı *
              </label>
              <input
                type="text"
                name="hotelName"
                value={formData.hotelName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
                placeholder="Örn: Grand Hotel Antalya"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yıldız Sayısı
              </label>
              <select
                name="hotelStars"
                value={formData.hotelStars}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
              >
                <option value="">Seçiniz</option>
                <option value="1">1 Yıldız</option>
                <option value="2">2 Yıldız</option>
                <option value="3">3 Yıldız</option>
                <option value="4">4 Yıldız</option>
                <option value="5">5 Yıldız</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konum
              </label>
              <input
                type="text"
                name="hotelLocation"
                value={formData.hotelLocation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
                placeholder="Örn: Lara, Antalya"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otel Adresi
              </label>
              <input
                type="text"
                name="hotelAddress"
                value={formData.hotelAddress}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
                placeholder="Tam adres bilgisi"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otel Özellikleri (Her satıra bir özellik)
              </label>
              <textarea
                name="hotelAmenities"
                value={formData.hotelAmenities}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900 font-mono text-sm"
                placeholder="Wi-Fi&#10;Havuz&#10;Spa&#10;Fitness Center&#10;Oda Servisi&#10;Klima"
              />
              <p className="text-xs text-gray-500 mt-1">Her satıra bir özellik yazın</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otel Hakkında Ekstra Bilgi Linki
              </label>
              <input
                type="url"
                name="hotelExtraInfoUrl"
                value={formData.hotelExtraInfoUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-transparent text-gray-900"
                placeholder="https://example.com/hotel-details"
              />
              <p className="text-xs text-gray-500 mt-1">Otel hakkında detaylı bilgi için link (opsiyonel)</p>
            </div>
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
            placeholder="Kesinlikle iptal edilemez. Satın alma tamamlandıktan sonra iade alınmaz..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#1A2A5A] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#1A2A5A]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Kaydediliyor...' : '✅ Turu Kaydet'}
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
