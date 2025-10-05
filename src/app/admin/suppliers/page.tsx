'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/contexts/ToastContext';

type Supplier = {
  id: string;
  name: string;
  description: string | null;
  integrationMode: string;
  apiUrl: string | null;
  healthcheckStatus: string | null;
  lastHealthcheck: string | null;
  isActive: boolean;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/admin/suppliers');
      const data = await res.json();
      
      if (res.ok) {
        setSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" tedarikçisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchSuppliers();
      } else {
        alert('Tedarikçi silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Tedarikçi silinirken bir hata oluştu');
    }
  };

  const handleTestConnection = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/suppliers/${id}/test-connection`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast(`✅ ${name}: ${data.message}`, 'success');
        fetchSuppliers(); // Refresh to show updated healthcheck status
      } else {
        showToast(`❌ ${name}: ${data.message || data.error}`, 'error');
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      showToast('Bağlantı testi sırasında bir hata oluştu', 'error');
    }
  };

  const handleSyncNow = async (id: string, name: string) => {
    if (syncingIds.has(id)) {
      showToast('Bu tedarikçi zaten senkronize ediliyor', 'warning');
      return;
    }

    setSyncingIds(prev => new Set(prev).add(id));
    showToast(`${name} senkronizasyonu başlatılıyor...`, 'info', 3000);

    try {
      const res = await fetch(`/api/admin/suppliers/${id}/sync-now`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const message = `${name} senkronize edildi!\n✅ Eklenen: ${data.inserted}\n🔄 Güncellenen: ${data.updated}\n❌ Başarısız: ${data.failed}`;
        showToast(message, 'success', 8000);
        fetchSuppliers();
      } else {
        showToast(`❌ ${name}: ${data.error || 'Senkronizasyon hatası'}`, 'error', 6000);
      }
    } catch (error) {
      console.error('Error syncing supplier:', error);
      showToast(`${name} senkronize edilirken hata oluştu`, 'error');
    } finally {
      setSyncingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getIntegrationModeLabel = (mode: string) => {
    switch (mode) {
      case 'pull': return '📥 Pull (Çek)';
      case 'push': return '📤 Push (Gönder)';
      case 'csv': return '📄 CSV';
      default: return mode;
    }
  };

  const getHealthcheckBadge = (status: string | null) => {
    if (!status) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Test Edilmedi</span>;
    }
    
    if (status === 'success') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">✓ Başarılı</span>;
    }
    
    return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">✗ Başarısız</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tedarikçi Ayarları</h1>
          <p className="text-gray-600 mt-1">{suppliers.length} tedarikçi bulundu</p>
        </div>
        <Link
          href="/admin/suppliers/new"
          className="px-6 py-3 bg-[#91A8D0] text-white font-semibold rounded-lg hover:bg-[#7a90bb] transition-colors"
        >
          + Yeni Tedarikçi Ekle
        </Link>
      </div>

      {/* Suppliers List */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">⚙️</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz tedarikçi yok</h3>
          <p className="text-gray-600 mb-6">İlk tedarikçinizi ekleyerek başlayın</p>
          <Link
            href="/admin/suppliers/new"
            className="inline-block px-6 py-3 bg-[#91A8D0] text-white font-semibold rounded-lg hover:bg-[#7a90bb] transition-colors"
          >
            + Yeni Tedarikçi Ekle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{supplier.name}</h3>
                    {!supplier.isActive && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                        Pasif
                      </span>
                    )}
                  </div>
                  {supplier.description && (
                    <p className="text-sm text-gray-600">{supplier.description}</p>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Entegrasyon Modu:</span>
                  <span className="font-medium text-gray-900">
                    {getIntegrationModeLabel(supplier.integrationMode)}
                  </span>
                </div>
                
                {supplier.apiUrl && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">API URL:</span>
                    <span className="font-mono text-xs text-gray-700 truncate max-w-xs">
                      {supplier.apiUrl}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Bağlantı Durumu:</span>
                  {getHealthcheckBadge(supplier.healthcheckStatus)}
                </div>

                {supplier.lastHealthcheck && (
                  <div className="text-xs text-gray-500">
                    Son test: {new Date(supplier.lastHealthcheck).toLocaleString('tr-TR')}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleTestConnection(supplier.id, supplier.name)}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  🔍 Bağlantı Testi
                </button>
                {supplier.integrationMode === 'pull' && supplier.apiUrl && (
                  <button
                    onClick={() => handleSyncNow(supplier.id, supplier.name)}
                    disabled={syncingIds.has(supplier.id)}
                    className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors text-sm ${
                      syncingIds.has(supplier.id)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {syncingIds.has(supplier.id) ? '⏳ Senkronize ediliyor...' : '🔄 Şimdi Senkronize Et'}
                  </button>
                )}
                <Link
                  href={`/admin/suppliers/edit/${supplier.id}`}
                  className="flex-1 px-4 py-2 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors text-center text-sm"
                >
                  ✏️ Düzenle
                </Link>
                <button
                  onClick={() => handleDelete(supplier.id, supplier.name)}
                  className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm"
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

