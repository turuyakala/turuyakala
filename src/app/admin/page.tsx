import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/middleware/admin';
import Link from 'next/link';

export default async function AdminPage() {
  // Admin kontrolü
  await requireAdmin();

  // Basit istatistikler
  const [usersCount, reviewsCount, suppliersCount, pendingReviewsCount] = await Promise.all([
    prisma.user.count(),
    prisma.review.count(),
    prisma.supplier.count(),
    prisma.review.count({ where: { isApproved: false } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Yönetim paneline hoş geldiniz</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{usersCount}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </Link>

        <Link href="/admin/reviews" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Yorum</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{reviewsCount}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </Link>

        <Link href="/admin/reviews" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Onay Bekleyen</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{pendingReviewsCount}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </Link>

        <Link href="/admin/suppliers" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Girişleri</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{suppliersCount}</p>
            </div>
            <div className="text-4xl">🔌</div>
          </div>
        </Link>
      </div>

      {/* Hızlı Erişim */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-gray-900">Kullanıcıları Görüntüle</p>
              <p className="text-sm text-gray-600">Tüm kayıtlı kullanıcıları görüntüle</p>
            </div>
          </Link>

          <Link
            href="/admin/reviews"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-medium text-gray-900">Yorumları Yönet</p>
              <p className="text-sm text-gray-600">Yorumları onayla veya reddet</p>
            </div>
          </Link>

          <Link
            href="/admin/suppliers"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🔌</span>
            <div>
              <p className="font-medium text-gray-900">API Girişleri</p>
              <p className="text-sm text-gray-600">Tedarikçi API ayarlarını yönet</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

