'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type FetchJob = {
  id: string;
  supplierId: string;
  jobType: string;
  scheduledAt: string;
  interval: number | null;
  status: string;
  enabled: boolean;
  lastRunAt: string | null;
  createdAt: string;
  supplier: {
    name: string;
  };
  _count: {
    runs: number;
  };
};

type JobRun = {
  id: string;
  jobId: string;
  supplierId: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  duration: number | null;
  inserted: number;
  updated: number;
  failed: number;
  error: string | null;
  supplier: {
    name: string;
  };
  job: {
    jobType: string;
  };
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<FetchJob[]>([]);
  const [runs, setRuns] = useState<JobRun[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'runs'>('jobs');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [jobsRes, runsRes] = await Promise.all([
        fetch('/api/admin/jobs'),
        fetch('/api/admin/jobs/runs'),
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs);
      }

      if (runsRes.ok) {
        const runsData = await runsRes.json();
        setRuns(runsData.runs);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700',
      running: 'bg-blue-100 text-blue-700 animate-pulse',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-orange-100 text-orange-700',
    };

    const icons = {
      pending: '⏳',
      running: '⚙️',
      completed: '✅',
      failed: '❌',
      cancelled: '🚫',
    };

    const style = styles[status as keyof typeof styles] || styles.pending;
    const icon = icons[status as keyof typeof icons] || '⏳';

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${style}`}>
        {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arka Plan Görevleri</h1>
          <p className="text-gray-600 mt-1">
            {activeTab === 'jobs' 
              ? `${jobs.length} görev tanımlı` 
              : `${runs.length} çalıştırma kaydı`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/suppliers"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Tedarikçiler
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'jobs'
              ? 'text-[#91A8D0] border-b-2 border-[#91A8D0]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Görevler ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('runs')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'runs'
              ? 'text-[#91A8D0] border-b-2 border-[#91A8D0]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Çalıştırma Logları ({runs.length})
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">⚙️</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : (
        <>
          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {jobs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Henüz görev yok
                  </h3>
                  <p className="text-gray-600">
                    Tedarikçi senkronizasyonu yaptığınızda otomatik olarak görevler oluşturulur
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tedarikçi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Görev Tipi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Periyot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Son Çalışma
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Çalışma Sayısı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aktif
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {job.supplier.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {job.jobType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(job.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {job.interval ? `${job.interval} dakika` : 'Tek seferlik'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">
                              {formatDate(job.lastRunAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                              {job._count.runs}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {job.enabled ? (
                              <span className="text-green-600 font-semibold">✓ Aktif</span>
                            ) : (
                              <span className="text-gray-400">Pasif</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Runs Tab */}
          {activeTab === 'runs' && (
            <div className="space-y-4">
              {runs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Henüz çalıştırma kaydı yok
                  </h3>
                  <p className="text-gray-600">
                    Görevler çalıştırıldığında loglar burada görünecek
                  </p>
                </div>
              ) : (
                runs.map((run) => (
                  <div
                    key={run.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {run.supplier.name}
                          </h3>
                          {getStatusBadge(run.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {run.job.jobType}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {formatDate(run.startedAt)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Süre: {formatDuration(run.duration)}
                        </div>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-700">
                          {run.inserted}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Eklenen
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-700">
                          {run.updated}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Güncellenen
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-red-700">
                          {run.failed}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          Başarısız
                        </div>
                      </div>
                    </div>

                    {/* Error */}
                    {run.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="font-semibold text-red-900 mb-2">
                          ❌ Hata
                        </div>
                        <pre className="text-sm text-red-700 whitespace-pre-wrap">
                          {run.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

