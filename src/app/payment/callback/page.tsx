'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus();
    }
  }, [orderId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payment/status?orderId=${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        setPaymentStatus(data.paymentStatus === 'paid' ? 'success' : 'failed');
        
        // Koltuk sayısını güncelle (ödeme başarılı veya başarısız olsun)
        if (data.inventoryItemId) {
          window.dispatchEvent(new CustomEvent('seats-updated', {
            detail: { tourId: data.inventoryItemId }
          }));
        }
        
        // If paid, redirect to success page after 2 seconds
        if (data.paymentStatus === 'paid') {
          setTimeout(() => {
            router.push(`/reservation/${orderId}/success?orderId=${orderId}`);
          }, 2000);
        }
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      setPaymentStatus('failed');
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      {paymentStatus === 'loading' && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme İşleniyor</h2>
          <p className="text-gray-600">Lütfen bekleyin...</p>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Ödeme Başarılı!</h2>
          <p className="text-gray-600 mb-6">Rezervasyonunuz onaylandı. Yönlendiriliyorsunuz...</p>
          {order && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">
                <strong>PNR Kodu:</strong> {order.pnrCode || 'Oluşturuluyor...'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Toplam Tutar:</strong> {order.amount.toLocaleString('tr-TR')} {order.currency === 'TRY' ? '₺' : order.currency}
              </p>
            </div>
          )}
          <Link
            href={`/reservation/${orderId}/success?orderId=${orderId}`}
            className="inline-block px-6 py-3 bg-[#1A2A5A] text-white font-medium rounded-lg hover:bg-[#1A2A5A]/90 transition-colors"
          >
            Rezervasyon Detaylarına Git →
          </Link>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Ödeme Başarısız</h2>
          <p className="text-gray-600 mb-6">
            Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href={`/reservation/${orderId}`}
              className="px-6 py-3 bg-[#E63946] text-white font-medium rounded-lg hover:bg-[#E63946]/90 transition-colors"
            >
              Tekrar Dene
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Suspense fallback={
        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ödeme İşleniyor</h2>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </main>
      }>
        <PaymentCallbackContent />
      </Suspense>
    </div>
  );
}



