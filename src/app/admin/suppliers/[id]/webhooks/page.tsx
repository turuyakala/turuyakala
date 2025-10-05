'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Supplier = {
  id: string;
  name: string;
  webhookSecret: string | null;
};

export default function SupplierWebhooksPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Test webhook state
  const [testEvent, setTestEvent] = useState<string>('offer.created');
  const [testData, setTestData] = useState<string>(JSON.stringify({
    vendorOfferId: 'TEST-001',
    title: 'Test Tur',
    price: 100,
    currency: 'TRY',
    category: 'tours',
    startLocation: 'İstanbul',
    endLocation: 'Ankara',
    startAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 48 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    availableSeats: 30,
  }, null, 2));
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetchSupplier();
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}`);
      if (response.ok) {
        const data = await response.json();
        setSupplier(data);
      }
    } catch (error) {
      console.error('Error fetching supplier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSecret = async () => {
    if (!confirm('Yeni bir webhook secret oluşturmak istediğinizden emin misiniz? Eski secret geçersiz olacak.')) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/admin/suppliers/${supplierId}/generate-webhook-secret`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSupplier(prev => prev ? { ...prev, webhookSecret: data.webhookSecret } : null);
        setShowSecret(true);
        alert('✅ Webhook secret başarıyla oluşturuldu!');
      } else {
        alert('❌ Secret oluşturulamadı');
      }
    } catch (error) {
      console.error('Error generating secret:', error);
      alert('❌ Hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const testWebhook = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test/send-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          webhookSecret: supplier?.webhookSecret,
          event: testEvent,
          data: JSON.parse(testData),
        }),
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Test webhook error:', error);
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔌</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600">Tedarikçi bulunamadı</p>
        </div>
      </div>
    );
  }

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/suppliers/${supplierId}/webhook`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhook Ayarları</h1>
          <p className="text-gray-600 mt-1">{supplier.name}</p>
        </div>
        <Link
          href={`/admin/suppliers/edit/${supplierId}`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Geri
        </Link>
      </div>

      {/* Webhook URL */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📡 Webhook Endpoint</h2>
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">{webhookUrl}</span>
            <button
              onClick={() => copyToClipboard(webhookUrl)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
            >
              {isCopied ? '✓ Kopyalandı' : 'Kopyala'}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Bu URL'yi tedarikçinize verin. Webhook event'lerini bu endpoint'e POST request olarak göndersinler.
        </p>
      </div>

      {/* Webhook Secret */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🔐 Webhook Secret</h2>
        
        {supplier.webhookSecret ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Secret Key:</span>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showSecret ? '👁️ Gizle' : '👁️ Göster'}
                </button>
              </div>
              <div className="font-mono text-sm bg-white p-3 rounded border border-gray-200">
                {showSecret ? supplier.webhookSecret : '•'.repeat(64)}
              </div>
              {showSecret && (
                <button
                  onClick={() => copyToClipboard(supplier.webhookSecret!)}
                  className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                >
                  📋 Kopyala
                </button>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Önemli Güvenlik Notu</h3>
                  <p className="text-sm text-yellow-800">
                    Bu secret'ı tedarikçinizle <strong>güvenli bir kanal</strong> üzerinden paylaşın.
                    Secret, webhook request'lerini HMAC-SHA256 ile imzalamak için kullanılır.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={generateSecret}
              disabled={isGenerating}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Oluşturuluyor...' : '🔄 Yeni Secret Oluştur'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">🔒</div>
              <p className="text-gray-600 mb-4">
                Henüz webhook secret oluşturulmamış.
              </p>
              <button
                onClick={generateSecret}
                disabled={isGenerating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {isGenerating ? 'Oluşturuluyor...' : '🔐 Secret Oluştur'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Test Webhook */}
      {supplier.webhookSecret && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🧪 Webhook Test</h2>
          
          <div className="space-y-4">
            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Tipi
              </label>
              <select
                value={testEvent}
                onChange={(e) => setTestEvent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="offer.created">offer.created</option>
                <option value="offer.updated">offer.updated</option>
                <option value="offer.deleted">offer.deleted</option>
                <option value="offer.expired">offer.expired</option>
              </select>
            </div>

            {/* Test Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Verisi (JSON)
              </label>
              <textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {/* Test Button */}
            <button
              onClick={testWebhook}
              disabled={isTesting}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
            >
              {isTesting ? '⏳ Test Ediliyor...' : '🚀 Webhook Test Et'}
            </button>

            {/* Test Result */}
            {testResult && (
              <div className={`rounded-lg p-4 ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{testResult.success ? '✅' : '❌'}</span>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                      {testResult.success ? 'Webhook Başarılı' : 'Webhook Başarısız'}
                    </h3>
                    <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      Status: {testResult.status}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded p-3 font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(testResult, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documentation Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Webhook Dokümantasyonu</h3>
            <p className="text-sm text-blue-800 mb-2">
              Webhook entegrasyonu hakkında detaylı bilgi için dokümantasyonu inceleyin.
            </p>
            <a
              href="/WEBHOOK_GUIDE.md"
              target="_blank"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              WEBHOOK_GUIDE.md'yi Aç →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

