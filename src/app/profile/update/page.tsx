'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import Navigation from '@/components/Navigation';
import { provinces, districts, getDistrictsForProvince } from '@/lib/turkey-addresses';
import { countries } from '@/lib/countries';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().optional(),
  tcKimlikNo: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  birthDate: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  addressCountry: z.string().optional(),
  addressProvince: z.string().optional(),
  addressDistrict: z.string().optional(),
  addressPostalCode: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
});

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export default function UpdateProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [formData, setFormData] = useState<UpdateProfileInput>({
    name: '',
    email: '',
    phone: '',
    tcKimlikNo: '',
    gender: undefined,
    birthDate: '',
    passportNumber: '',
    passportExpiry: '',
    addressCountry: '',
    addressProvince: '',
    addressDistrict: '',
    addressPostalCode: '',
    addressLine1: '',
    addressLine2: '',
  });
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfileInput, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          tcKimlikNo: data.user.tcKimlikNo || '',
          gender: data.user.gender || undefined,
          birthDate: data.user.birthDate ? new Date(data.user.birthDate).toISOString().split('T')[0] : '',
          passportNumber: data.user.passportNumber || '',
          passportExpiry: data.user.passportExpiry ? new Date(data.user.passportExpiry).toISOString().split('T')[0] : '',
          addressCountry: data.user.addressCountry || '',
          addressProvince: data.user.addressProvince || '',
          addressDistrict: data.user.addressDistrict || '',
          addressPostalCode: data.user.addressPostalCode || '',
          addressLine1: data.user.addressLine1 || '',
          addressLine2: data.user.addressLine2 || '',
        });
        
        // İl seçilmişse ilçeleri yükle
        if (data.user.addressProvince) {
          setAvailableDistricts(getDistrictsForProvince(data.user.addressProvince));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate form
      const validation = updateProfileSchema.safeParse(formData);
      
      if (!validation.success) {
        const fieldErrors: Partial<Record<keyof UpdateProfileInput, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof UpdateProfileInput] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Call API
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Bilgiler güncellenemedi');
        setIsLoading(false);
        return;
      }

      // Update session
      await update();

      // Success
      setSuccess('Bilgileriniz başarıyla güncellendi');
      
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Bilgiler güncellenirken bir hata oluştu');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bilgilerimi Güncelle</h1>
            <p className="text-sm text-gray-600">
              Kişisel bilgilerinizi, adres bilgilerinizi ve diğer profil bilgilerinizi buradan güncelleyebilirsiniz.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#1A2A5A]'
                }`}
                placeholder="Adınız ve soyadınız"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-[#1A2A5A]'
                }`}
                placeholder="ornek@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                placeholder="+90 555 123 4567"
              />
              <p className="mt-1 text-xs text-gray-500">Rezervasyon yaparken otomatik doldurulacak</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tcKimlikNo" className="block text-sm font-medium text-gray-700 mb-2">
                  T.C. Kimlik Numarası
                </label>
                <input
                  id="tcKimlikNo"
                  name="tcKimlikNo"
                  type="text"
                  value={formData.tcKimlikNo}
                  onChange={(e) => setFormData({ ...formData, tcKimlikNo: e.target.value })}
                  maxLength={11}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                  placeholder="12345678901"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Cinsiyet
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                >
                  <option value="">Seçiniz</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                  <option value="other">Diğer</option>
                  <option value="prefer_not_to_say">Belirtmek istemiyorum</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Doğum Tarihi
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📘</span>
                <h3 className="text-lg font-semibold text-gray-900">Pasaport Bilgileri</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Yurtdışı turları için pasaport bilgilerinizi kaydedin. Rezervasyon yaparken otomatik doldurulacak.</p>
              
              <div>
                <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Pasaport Numarası
                </label>
                <input
                  id="passportNumber"
                  name="passportNumber"
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                  placeholder="A12345678"
                />
              </div>

              <div>
                <label htmlFor="passportExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                  Pasaport Geçerlilik Tarihi
                </label>
                <input
                  id="passportExpiry"
                  name="passportExpiry"
                  type="date"
                  value={formData.passportExpiry}
                  onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📍</span>
                <h3 className="text-lg font-semibold text-gray-900">Adres Bilgileri</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Fatura için adres bilgilerinizi girin.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="addressCountry" className="block text-sm font-medium text-gray-700 mb-2">
                    Ülke
                  </label>
                  <select
                    id="addressCountry"
                    name="addressCountry"
                    value={formData.addressCountry}
                    onChange={(e) => setFormData({ ...formData, addressCountry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                  >
                    <option value="">Ülke Seçiniz</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="addressProvince" className="block text-sm font-medium text-gray-700 mb-2">
                    İl
                  </label>
                  <select
                    id="addressProvince"
                    name="addressProvince"
                    value={formData.addressProvince}
                    onChange={(e) => {
                      setFormData({ ...formData, addressProvince: e.target.value, addressDistrict: '' });
                      setAvailableDistricts(getDistrictsForProvince(e.target.value));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                  >
                    <option value="">İl Seçiniz</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="addressDistrict" className="block text-sm font-medium text-gray-700 mb-2">
                    İlçe
                  </label>
                  <select
                    id="addressDistrict"
                    name="addressDistrict"
                    value={formData.addressDistrict}
                    onChange={(e) => setFormData({ ...formData, addressDistrict: e.target.value })}
                    disabled={!formData.addressProvince || availableDistricts.length === 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">İlçe Seçiniz</option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="addressPostalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Posta Kodu
                  </label>
                  <input
                    id="addressPostalCode"
                    name="addressPostalCode"
                    type="text"
                    value={formData.addressPostalCode}
                    onChange={(e) => setFormData({ ...formData, addressPostalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                    placeholder="34000"
                    maxLength={5}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                    Adres Satırı *
                  </label>
                  <input
                    id="addressLine1"
                    name="addressLine1"
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                    placeholder="Mahalle, sokak, cadde, bina no"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                    Adres Satırı 2 (İsteğe Bağlı)
                  </label>
                  <input
                    id="addressLine2"
                    name="addressLine2"
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2A5A]"
                    placeholder="Daire no, kat, blok vb."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-[#1A2A5A] text-white font-medium rounded-lg hover:bg-[#1A2A5A]/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
              </button>
              <Link
                href="/profile"
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors text-center"
              >
                İptal
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

