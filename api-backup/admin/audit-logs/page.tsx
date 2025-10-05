'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  statusCode: number | null;
  error: string | null;
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

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/admin/audit-logs' 
        : `/api/admin/audit-logs?action=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const getActionBadge = (action: string) => {
    const styles = {
      sync_started: 'bg-blue-100 text-blue-700',
      sync_completed: 'bg-green-100 text-green-700',
      sync_failed: 'bg-red-100 text-red-700',
      rate_limit_hit: 'bg-orange-100 text-orange-700',
    };

    const icons = {
      sync_started: '▶️',
      sync_completed: '✅',
      sync_failed: '❌',
      rate_limit_hit: '⏱️',
    };

    const style = styles[action as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    const icon = icons[action as keyof typeof icons] || '📋';

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${style}`}>
        {icon} {action.replace(/_/g, ' ')}
      </span>
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logları</h1>
          <p className="text-gray-600 mt-1">
            Sistem olaylarını ve hataları izleyin
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/jobs"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Görevler
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'sync_started', 'sync_completed', 'sync_failed', 'rate_limit_hit'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-[#91A8D0] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Tümü' : f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Log bulunamadı
              </h3>
              <p className="text-gray-600">
                Bu filtre için henüz log kaydı yok
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const metadata = parseMetadata(log.metadata);
              return (
                <div
                  key={log.id}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getActionBadge(log.action)}
                      {log.supplier && (
                        <span className="text-sm font-medium text-gray-900">
                          {log.supplier.name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Entity:</span>
                      <span className="ml-2 font-medium">{log.entity}</span>
                    </div>
                    {log.statusCode && (
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 font-medium">{log.statusCode}</span>
                      </div>
                    )}
                    {log.user && (
                      <div>
                        <span className="text-gray-500">User:</span>
                        <span className="ml-2 font-medium">
                          {log.user.name || log.user.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  {metadata && (
                    <div className="mt-3 bg-gray-50 rounded p-3">
                      <div className="text-xs font-semibold text-gray-700 mb-2">
                        Metadata:
                      </div>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Error */}
                  {log.error && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
                      <div className="text-xs font-semibold text-red-900 mb-2">
                        Error:
                      </div>
                      <pre className="text-xs text-red-700 whitespace-pre-wrap">
                        {log.error}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

