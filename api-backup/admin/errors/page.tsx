'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  actor: string | null;
  statusCode: number | null;
  error: string | null;
  ip: string | null;
  userAgent: string | null;
  payloadSize: number | null;
  metadata: string | null;
  createdAt: string;
  supplier: {
    name: string;
  } | null;
  user: {
    name: string | null;
    email: string;
  } | null;
};

export default function ErrorsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('24h');

  const fetchErrors = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('statusCode', statusFilter);
      if (actorFilter !== 'all') params.append('actor', actorFilter);
      params.append('timeRange', timeFilter);

      const response = await fetch(`/api/admin/errors?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.errors);
      }
    } catch (error) {
      console.error('Error fetching errors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, [statusFilter, actorFilter, timeFilter]);

  const getStatusBadge = (statusCode: number | null) => {
    if (!statusCode) return null;

    if (statusCode >= 500) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
        {statusCode} Server Error
      </span>;
    } else if (statusCode >= 400) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
        {statusCode} Client Error
      </span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
      {statusCode}
    </span>;
  };

  const getActorBadge = (actor: string | null) => {
    if (!actor) return null;

    const colors = {
      scheduler: 'bg-blue-100 text-blue-700',
      webhook: 'bg-purple-100 text-purple-700',
      manual: 'bg-green-100 text-green-700',
      api: 'bg-yellow-100 text-yellow-700',
      system: 'bg-gray-100 text-gray-700',
    };

    const color = colors[actor as keyof typeof colors] || 'bg-gray-100 text-gray-700';

    return <span className={`px-2 py-1 ${color} rounded text-xs font-semibold`}>
      {actor}
    </span>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('tr-TR');
  };

  const parseMetadata = (metadata: string | null) => {
    if (!metadata) return null;
    try {
      return JSON.parse(metadata);
    } catch {
      return null;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🚨</div>
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
          <h1 className="text-3xl font-bold text-gray-900">🚨 Hatalar ve Audit Logları</h1>
          <p className="text-gray-600 mt-1">
            Sistem hataları ve entegrasyon çağrıları
          </p>
        </div>
        <Link
          href="/admin/audit-logs"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Tüm Loglar →
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-3 gap-4">
          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zaman Aralığı
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Son 1 Saat</option>
              <option value="24h">Son 24 Saat</option>
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
            </select>
          </div>

          {/* Status Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durum Kodu
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tümü</option>
              <option value="4xx">4xx (Client Errors)</option>
              <option value="5xx">5xx (Server Errors)</option>
            </select>
          </div>

          {/* Actor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actor
            </label>
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tümü</option>
              <option value="scheduler">Scheduler</option>
              <option value="webhook">Webhook</option>
              <option value="manual">Manual</option>
              <option value="api">API</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Count Summary */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">
              Toplam Hata Sayısı
            </h3>
            <p className="text-sm text-red-700">
              Seçilen zaman aralığında
            </p>
          </div>
          <div className="text-5xl font-bold text-red-700">
            {logs.length}
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Hata bulunamadı
            </h3>
            <p className="text-gray-600">
              Seçilen filtrelerde hata kaydı yok
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const metadata = parseMetadata(log.metadata);
            return (
              <div
                key={log.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {log.action}
                      </h3>
                      {getStatusBadge(log.statusCode)}
                      {getActorBadge(log.actor)}
                    </div>
                    {log.supplier && (
                      <p className="text-sm text-gray-600">
                        <strong>Supplier:</strong> {log.supplier.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Network Info */}
                {(log.ip || log.userAgent || log.payloadSize) && (
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm bg-gray-50 rounded p-3">
                    {log.ip && (
                      <div>
                        <span className="text-gray-500">IP:</span>
                        <span className="ml-2 font-medium text-gray-900">{log.ip}</span>
                      </div>
                    )}
                    {log.payloadSize && (
                      <div>
                        <span className="text-gray-500">Payload:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatBytes(log.payloadSize)}
                        </span>
                      </div>
                    )}
                    {log.userAgent && (
                      <div className="col-span-2">
                        <span className="text-gray-500">User Agent:</span>
                        <span className="ml-2 font-medium text-gray-900 truncate block">
                          {log.userAgent}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {log.error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="font-semibold text-red-900 mb-2">
                      ❌ Error
                    </div>
                    <pre className="text-sm text-red-700 whitespace-pre-wrap">
                      {log.error}
                    </pre>
                  </div>
                )}

                {/* Metadata */}
                {metadata && (
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-2">
                      Metadata:
                    </div>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

