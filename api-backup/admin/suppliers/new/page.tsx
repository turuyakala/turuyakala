'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSupplierPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    integrationMode: 'pull',
    apiUrl: '',
    apiKey: '',
    apiSecret: '',
    username: '',
    password: '',
    additionalHeaders: '',
    healthcheckUrl: '',
    healthcheckMethod: 'GET',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Tedarikçi eklenirken bir hata oluştu');
      }

      router.push('/admin/suppliers');
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
          <h1 className="text-3xl font-bold text-gray-900">Yeni Tedarikçi Ekle</h1>
          <p className="text-gray-600 mt-1">Tedarikçi entegrasyonu oluşturun</p>
        </div>
        <Link
          href="/admin/suppliers"
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

        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Temel Bilgiler</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tedarikçi Adı *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
              placeholder="Örn: Acme Travel API"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
              placeholder="Tedarikçi hakkında kısa açıklama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entegrasyon Modu *
            </label>
            <select
              name="integrationMode"
              value={formData.integrationMode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
            >
              <option value="pull">📥 Pull - Tedarikçiden veri çek</option>
              <option value="push">📤 Push - Tedarikçiye veri gönder</option>
              <option value="csv">📄 CSV - Dosya bazlı entegrasyon</option>
            </select>
          </div>
        </div>

        {/* API Ayarları */}
        {formData.integrationMode !== 'csv' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">API Ayarları</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL *
              </label>
              <input
                type="url"
                name="apiUrl"
                value={formData.apiUrl}
                onChange={handleChange}
                required={formData.integrationMode !== 'csv'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
                placeholder="https://api.supplier.com/v1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
                  placeholder="API anahtarı"
                />
                <p className="text-xs text-gray-500 mt-1">Şifreli olarak saklanacak</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Secret
                </label>
                <input
                  type="password"
                  name="apiSecret"
                  value={formData.apiSecret}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
                  placeholder="API secret"
                />
                <p className="text-xs text-gray-500 mt-1">Şifreli olarak saklanacak</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
                  placeholder="Basic auth için"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
                  placeholder="Basic auth için"
                />
                <p className="text-xs text-gray-500 mt-1">Şifreli olarak saklanacak</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ek Header'lar (JSON)
              </label>
              <textarea
                name="additionalHeaders"
                value={formData.additionalHeaders}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900 font-mono text-sm"
                placeholder='{"X-Custom-Header": "value"}'
              />
              <p className="text-xs text-gray-500 mt-1">JSON formatında özel header'lar</p>
            </div>
          </div>
        )}

        {/* Healthcheck Ayarları */}
        {formData.integrationMode !== 'csv' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Bağlantı Testi Ayarları</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Healthcheck URL
              </label>
              <input
                type="url"
                name="healthcheckUrl"
                value={formData.healthcheckUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
                placeholder="https://api.supplier.com/health"
              />
              <p className="text-xs text-gray-500 mt-1">Bağlantı testi için kullanılacak endpoint</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Healthcheck Method
              </label>
              <select
                name="healthcheckMethod"
                value={formData.healthcheckMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#91A8D0] focus:border-transparent text-gray-900"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </div>
        )}

        {/* Durum */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Durum</h3>
          
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-300 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5"
            />
            <label htmlFor="isActive" className="font-semibold text-gray-900 cursor-pointer">
              ✓ Tedarikçi aktif (Entegrasyon çalışsın)
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-[#91A8D0] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#7a90bb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Kaydediliyor...' : '✅ Tedarikçiyi Kaydet'}
          </button>
          <Link
            href="/admin/suppliers"
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}

