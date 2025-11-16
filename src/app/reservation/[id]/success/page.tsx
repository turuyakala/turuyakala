'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ReservationSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Rezervasyonunuz Başarıyla Oluşturuldu!
          </h2>
          
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Rezervasyon Kodu</p>
              <p className="text-2xl font-bold text-[#DD7230] font-mono">{orderId}</p>
            </div>
          )}

          <p className="text-gray-700 mb-8 leading-relaxed">
            Rezervasyonunuz onaylandı. Detaylar e-posta adresinize gönderilecektir.
            Rezervasyon bilgilerinizi profil sayfanızdan görüntüleyebilirsiniz.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/profile"
              className="px-6 py-3 bg-[#DD7230] text-white font-semibold rounded-lg hover:bg-[#DD7230]/90 transition-colors"
            >
              Profilime Git
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

