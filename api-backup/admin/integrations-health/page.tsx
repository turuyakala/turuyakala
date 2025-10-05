'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type IntegrationHealth = {
  supplier: {
    id: string;
    name: string;
    integrationMode: string;
  };
  lastSuccessfulPull: string | null;
  lastWebhook: string | null;
  nextCronTime: string | null;
  healthStatus: 'healthy' | 'warning' | 'critical';
  healthMessage: string;
  pullEnabled: boolean;
};

export default function IntegrationsHealthPage() {
  const [health, setHealth] = useState<IntegrationHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health/integrations');
      if (response.ok) {
        const data = await response.json();
        setHealth(data.integrationHealth);
        setLastUpdate(data.timestamp);
      }
    } catch (error) {
      console.error('Error fetching health:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Hiç';
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Hiç';
    
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gün önce`;
  };

  const getTimeUntil = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = then.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} saat ${diffMins % 60} dakika`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-700 border-green-300',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      critical: 'bg-red-100 text-red-700 border-red-300',
    };

    const icons = {
      healthy: '✅',
      warning: '⚠️',
      critical: '🚨',
    };

    const color = colors[status as keyof typeof colors] || colors.healthy;
    const icon = icons[status as keyof typeof icons] || icons.healthy;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${color}`}>
        {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔄</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔌 Entegrasyon Sağlığı</h1>
          <p className="text-gray-600 mt-1">
            Tedarikçi entegrasyonları durum takibi
          </p>
          {lastUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              Son güncelleme: {formatDateTime(lastUpdate)}
            </p>
          )}
        </div>
        <button
          onClick={fetchHealth}
          className="px-4 py-2 bg-[#563C5C] text-white rounded-lg hover:bg-[#563C5C]/90 transition-colors"
        >
          🔄 Yenile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-green-600 font-semibold mb-1">Sağlıklı</div>
          <div className="text-3xl font-bold text-green-900">
            {health.filter(h => h.healthStatus === 'healthy').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-yellow-600 font-semibold mb-1">Uyarı</div>
          <div className="text-3xl font-bold text-yellow-900">
            {health.filter(h => h.healthStatus === 'warning').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-600 font-semibold mb-1">Kritik</div>
          <div className="text-3xl font-bold text-red-900">
            {health.filter(h => h.healthStatus === 'critical').length}
          </div>
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {health.map((item) => (
          <div
            key={item.supplier.id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 ${
              item.healthStatus === 'healthy'
                ? 'border-green-200'
                : item.healthStatus === 'warning'
                ? 'border-yellow-200'
                : 'border-red-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {item.supplier.name}
              </h3>
              {getStatusBadge(item.healthStatus)}
            </div>

            {/* Integration Mode */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {item.supplier.integrationMode.toUpperCase()}
              </span>
            </div>

            {/* Health Message */}
            <div className="mb-4 text-sm text-gray-700">
              {item.healthMessage}
            </div>

            {/* Metrics */}
            <div className="space-y-3 text-sm">
              {/* Last Pull */}
              {item.pullEnabled && (
                <div className="flex items-start justify-between">
                  <div className="text-gray-600">Son Pull:</div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {getTimeAgo(item.lastSuccessfulPull)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(item.lastSuccessfulPull)}
                    </div>
                  </div>
                </div>
              )}

              {/* Last Webhook */}
              {item.supplier.integrationMode === 'push' && (
                <div className="flex items-start justify-between">
                  <div className="text-gray-600">Son Webhook:</div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {getTimeAgo(item.lastWebhook)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(item.lastWebhook)}
                    </div>
                  </div>
                </div>
              )}

              {/* Next Cron */}
              {item.nextCronTime && (
                <div className="flex items-start justify-between">
                  <div className="text-gray-600">Sıradaki Cron:</div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-700">
                      {getTimeUntil(item.nextCronTime)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(item.nextCronTime)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href={`/admin/suppliers/edit/${item.supplier.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Ayarları Görüntüle →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {health.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aktif Tedarikçi Bulunamadı
          </h3>
          <p className="text-gray-600">
            Henüz aktif bir tedarikçi entegrasyonu yok
          </p>
        </div>
      )}
    </div>
  );
}

