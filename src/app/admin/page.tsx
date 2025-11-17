import { requireAdmin } from '@/lib/middleware/admin';
import Link from 'next/link';

export default async function AdminPage() {
  // Admin kontrolü (layout'ta zaten yapılıyor ama ekstra güvenlik için)
  try {
    await requireAdmin();
  } catch (error) {
    console.error('Admin page error:', error);
    throw error;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Yönetim paneline hoş geldiniz</p>
      </div>

      {/* Ana Menü Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Turlar */}
        <Link
          href="/admin/tours"
          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-[#E63946] hover:scale-[1.02]"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#E63946] transition-colors">Turlar</h2>
            <p className="text-gray-600">Turları görüntüle, düzenle ve yönet</p>
          </div>
        </Link>

        {/* Kullanıcılar */}
        <Link
          href="/admin/users"
          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-[#E63946] hover:scale-[1.02]"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#E63946] transition-colors">Kullanıcılar</h2>
            <p className="text-gray-600">Kullanıcıları görüntüle ve yönet</p>
          </div>
        </Link>

        {/* Yorumlar */}
        <Link
          href="/admin/reviews"
          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-[#E63946] hover:scale-[1.02]"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#E63946] transition-colors">Yorumlar</h2>
            <p className="text-gray-600">Yorumları onayla, reddet veya düzenle</p>
          </div>
        </Link>

        {/* Site İçi Ayarlar */}
        <Link
          href="/admin/settings"
          className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-[#E63946] hover:scale-[1.02]"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#E63946] transition-colors">Site İçi Ayarlar</h2>
            <p className="text-gray-600">Site ayarlarını yönet ve düzenle</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

