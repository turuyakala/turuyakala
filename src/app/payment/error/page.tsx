'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message') || 'Ödeme işlemi tamamlanamadı';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Ödeme Hatası</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            {orderId && (
              <Link
                href={`/reservation/${orderId}`}
                className="px-6 py-3 bg-[#E63946] text-white font-medium rounded-lg hover:bg-[#E63946]/90 transition-colors"
              >
                Tekrar Dene
              </Link>
            )}
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}



