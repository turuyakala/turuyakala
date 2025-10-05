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

export default function IntegrationHealthWidget() {
  const [health, setHealth] = useState<IntegrationHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health/integrations');
        if (response.ok) {
          const data = await response.json();
          setHealth(data.integrationHealth);
        }
      } catch (error) {
        console.error('Error fetching health:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealth();
  }, []);

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Hiç';
    
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins}dk önce`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}sa önce`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}g önce`;
  };

  const getTimeUntil = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = then.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0) return 'Şimdi';
    if (diffMins < 60) return `${diffMins}dk`;
    
    return `${Math.floor(diffMins / 60)}sa`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">🔌 Entegrasyon Sağlığı</h2>
        </div>
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  const healthySuppliersCount = health.filter(h => h.healthStatus === 'healthy').length;
  const warningSuppliersCount = health.filter(h => h.healthStatus === 'warning').length;
  const criticalSuppliersCount = health.filter(h => h.healthStatus === 'critical').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">🔌 Entegrasyon Sağlığı</h2>
        <Link
          href="/admin/integrations-health"
          className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
        >
          Detaylar →
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{healthySuppliersCount}</div>
          <div className="text-xs text-green-600">Sağlıklı</div>
        </div>
        <div className="bg-yellow-50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-yellow-700">{warningSuppliersCount}</div>
          <div className="text-xs text-yellow-600">Uyarı</div>
        </div>
        <div className="bg-red-50 rounded p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{criticalSuppliersCount}</div>
          <div className="text-xs text-red-600">Kritik</div>
        </div>
      </div>

      {/* Supplier Cards */}
      <div className="space-y-3">
        {health.slice(0, 4).map((item) => (
          <div
            key={item.supplier.id}
            className={`border-l-4 p-3 rounded ${
              item.healthStatus === 'healthy'
                ? 'bg-green-50 border-green-500'
                : item.healthStatus === 'warning'
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900 text-sm truncate">
                {item.supplier.name}
              </div>
              <span className="text-xs px-2 py-0.5 bg-white rounded">
                {item.supplier.integrationMode.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {item.pullEnabled && (
                <div>
                  <span className="text-gray-600">Pull:</span>
                  <span className="ml-1 font-semibold text-gray-900">
                    {getTimeAgo(item.lastSuccessfulPull)}
                  </span>
                </div>
              )}
              {item.supplier.integrationMode === 'push' && (
                <div>
                  <span className="text-gray-600">Webhook:</span>
                  <span className="ml-1 font-semibold text-gray-900">
                    {getTimeAgo(item.lastWebhook)}
                  </span>
                </div>
              )}
              {item.nextCronTime && (
                <div>
                  <span className="text-gray-600">Sıradaki:</span>
                  <span className="ml-1 font-semibold text-blue-700">
                    {getTimeUntil(item.nextCronTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {health.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aktif tedarikçi yok
        </div>
      )}
    </div>
  );
}

