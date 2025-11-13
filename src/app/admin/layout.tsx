import { requireAdmin } from '@/lib/middleware/admin';
import Link from 'next/link';
import { ToastProvider } from '@/lib/contexts/ToastContext';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Admin Header */}
        <header className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-2xl font-bold font-montserrat hover:opacity-80">
                  👑 Admin Panel
                </Link>
                <nav className="hidden md:flex gap-4">
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/admin/users"
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    👥 Kullanıcılar
                  </Link>
                  <Link
                    href="/admin/reviews"
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    💬 Yorumlar
                  </Link>
                  <Link
                    href="/admin/suppliers"
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    🔌 API Girişleri
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">Hoşgeldin, <strong>{session?.user?.name || session?.user?.email || 'Admin'}</strong></span>
                <Link
                  href="/"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                >
                  Ana Sayfa
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

