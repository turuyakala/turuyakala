import { requireAuth } from '@/lib/middleware/admin';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#91A8D0] text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-montserrat">👤 Profilim</h1>
              <p className="text-white/80 mt-1">Hesap bilgileriniz ve ayarlarınız</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              ← Ana Sayfa
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hesap Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {session.user?.name || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresi
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {session.user?.email || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hesap Türü
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    {(session.user as any)?.role === 'admin' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        👑 Admin
                      </span>
                    )}
                    {(session.user as any)?.role === 'seller' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        🏢 Satıcı
                      </span>
                    )}
                    {(session.user as any)?.role === 'user' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        👤 Kullanıcı
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Siparişlerim</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  ℹ️ Sipariş geçmişiniz henüz eklenmedi. Bu özellik yakında aktif olacak.
                </p>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hesap İşlemleri</h2>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-[#91A8D0] text-white font-medium rounded-lg hover:bg-[#7a90bb] transition-colors">
                  Şifre Değiştir
                </button>
                <button className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                  Bilgilerimi Güncelle
                </button>
              </div>
            </div>
          </div>
        </div>

        {(session.user as any)?.role === 'admin' && (
          <div className="mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Admin Panel</h3>
                <p className="text-white/90 text-sm">Sistem yönetimi ve tur ekleme</p>
              </div>
              <Link
                href="/admin"
                className="px-6 py-2.5 bg-white text-orange-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Panele Git →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}




