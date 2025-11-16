'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SupplierSecurityPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [ipAllowlist, setIpAllowlist] = useState<string>('');
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState<string>('');

  useEffect(() => {
    fetchSupplier();
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`);
      if (response.ok) {
        const data = await response.json();
        setSupplier(data.supplier);
        
        // Parse allowlist
        if (data.supplier.ipAllowlist) {
          const ips = JSON.parse(data.supplier.ipAllowlist);
          setIpAllowlist(ips.join('\n'));
        }
        
        // Set rate limit
        if (data.supplier.rateLimitPerMinute) {
          setRateLimitPerMinute(String(data.supplier.rateLimitPerMinute));
        }
      }
    } catch (error) {
      console.error('Error fetching supplier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Parse IP allowlist (line-separated)
      const ips = ipAllowlist
        .split('\n')
        .map(ip => ip.trim())
        .filter(ip => ip.length > 0);

      // Parse rate limit
      const rateLimit = rateLimitPerMinute
        ? parseInt(rateLimitPerMinute)
        : null;

      const response = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAllowlist: ips.length > 0 ? JSON.stringify(ips) : null,
          rateLimitPerMinute: rateLimit,
        }),
      });

      if (response.ok) {
        alert('Güvenlik ayarları kaydedildi!');
        fetchSupplier();
      } else {
        const error = await response.json();
        alert('Hata: ' + error.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔒</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Tedarikçi bulunamadı</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🔒 Güvenlik Ayarları
          </h1>
          <p className="text-gray-600 mt-1">
            {supplier.name} - IP Allowlist & Rate Limiting
          </p>
        </div>
        <Link
          href={`/admin/suppliers/edit/${supplierId}`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Geri
        </Link>
      </div>

      {/* IP Allowlist */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            🌐 IP Allowlist
          </h2>
          <p className="text-sm text-gray-600">
            Sadece bu IP adreslerinden gelen isteklere izin verilir. Boş
            bırakılırsa tüm IP&apos;ler kabul edilir.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İzin Verilen IP Adresleri (Her satırda bir IP)
          </label>
          <textarea
            value={ipAllowlist}
            onChange={(e) => setIpAllowlist(e.target.value)}
            rows={10}
            placeholder={`192.168.1.100\n203.0.113.0/24\n198.51.100.50`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 IPv4 adresleri desteklenir. CIDR notasyonu (/24) kullanabilirsiniz.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📝 IP Allowlist Örnekleri</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <code className="bg-white px-2 py-0.5 rounded">192.168.1.100</code> - Tek IP</li>
            <li>• <code className="bg-white px-2 py-0.5 rounded">203.0.113.0/24</code> - IP aralığı (203.0.113.0 - 203.0.113.255)</li>
            <li>• Boş liste = Tüm IP&apos;ler kabul edilir</li>
          </ul>
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ⏱️ Rate Limiting
          </h2>
          <p className="text-sm text-gray-600">
            Bu tedarikçiden dakikada maksimum kaç istek kabul edilecek?
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dakikada Maksimum İstek Sayısı
          </label>
          <input
            type="number"
            value={rateLimitPerMinute}
            onChange={(e) => setRateLimitPerMinute(e.target.value)}
            placeholder="Boş = Sınırsız"
            min="1"
            max="1000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Boş bırakılırsa rate limit uygulanmaz.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Rate Limit Önerileri</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Webhook:</strong> 60-120 istek/dakika (normal)</li>
            <li>• <strong>High-Traffic:</strong> 300-600 istek/dakika</li>
            <li>• <strong>Test/Development:</strong> 10-30 istek/dakika</li>
            <li>• Limit aşıldığında 429 Too Many Requests döner</li>
            <li>• Retry-After header ile ne zaman tekrar deneyebilecekleri bildirilir</li>
          </ul>
        </div>
      </div>

      {/* Current Status */}
      {supplier.ipAllowlist && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3">✅ Mevcut Ayarlar</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 mb-1">IP Allowlist</div>
              <div className="font-semibold text-gray-900">
                {supplier.ipAllowlist
                  ? `${JSON.parse(supplier.ipAllowlist).length} IP tanımlı`
                  : 'Tüm IP\'ler kabul'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Rate Limit</div>
              <div className="font-semibold text-gray-900">
                {supplier.rateLimitPerMinute
                  ? `${supplier.rateLimitPerMinute} istek/dakika`
                  : 'Sınırsız'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-semibold disabled:opacity-50"
        >
          {isSaving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
        </button>
        <button
          onClick={() => {
            setIpAllowlist('');
            setRateLimitPerMinute('');
          }}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          🗑️ Temizle
        </button>
      </div>

      {/* Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">❓ Nasıl Çalışır?</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-gray-900">1. IP Allowlist:</strong>
            <p className="mt-1">Webhook veya API çağrıları geldiğinde, gelen IP adresi allowlist ile kontrol edilir. Eğer IP listede yoksa 403 Forbidden döner.</p>
          </div>
          <div>
            <strong className="text-gray-900">2. Rate Limiting:</strong>
            <p className="mt-1">Dakika başına maksimum istek sayısı aşıldığında 429 Too Many Requests döner. Bir sonraki dakikada sayaç sıfırlanır.</p>
          </div>
          <div>
            <strong className="text-gray-900">3. Audit Logging:</strong>
            <p className="mt-1">Tüm güvenlik kontrolleri (başarılı/başarısız) AuditLog tablosuna kaydedilir. Hataları &quot;Hatalar&quot; sayfasından görebilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

