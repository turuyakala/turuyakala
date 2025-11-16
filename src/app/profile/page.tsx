'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewModal from '@/components/ReviewModal';
import Navigation from '@/components/Navigation';
import { formatDate } from '@/lib/time';
import { formatPrice } from '@/lib/price';

type UserRole = 'admin' | 'seller' | 'user';

interface ExtendedUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: UserRole;
}

type Order = {
  id: string;
  seats: number;
  totalPrice: number;
  paymentStatus: string;
  pnrCode: string | null;
  createdAt: string;
  inventoryItem: {
    id: string;
    title: string;
    from: string;
    to: string;
    startAt: string;
    image: string | null;
    category: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    isPublished: boolean;
    createdAt: string;
  }>;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/profile/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
      fetchUserProfile();
    }
  }, [status, router, fetchOrders]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleReviewClick = (order: Order) => {
    // Check if already reviewed
    if (order.reviews.length > 0) {
      alert('Bu tur için zaten yorum yaptınız. Yorumunuz onay bekliyor.');
      return;
    }
    setSelectedOrder(order);
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    fetchOrders(); // Refresh orders to show the new review
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

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
                    {(session.user as ExtendedUser)?.role === 'admin' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        👑 Admin
                      </span>
                    )}
                    {(session.user as ExtendedUser)?.role === 'seller' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        🏢 Satıcı
                      </span>
                    )}
                    {(session.user as ExtendedUser)?.role === 'user' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        👤 Kullanıcı
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.phone || '-'}
                  </div>
                  {!userProfile?.phone && (
                    <p className="text-xs text-gray-500 mt-1">
                      Rezervasyon yaparken otomatik doldurulması için{' '}
                      <Link href="/profile/update" className="text-[#DD7230] hover:underline">
                        bilgilerinizi güncelleyin
                      </Link>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pasaport Numarası
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.passportNumber ? (
                      <span className="font-mono">{userProfile.passportNumber}</span>
                    ) : (
                      '-'
                    )}
                  </div>
                  {userProfile?.passportExpiry && (
                    <p className="text-xs text-gray-500 mt-1">
                      Geçerlilik: {new Date(userProfile.passportExpiry).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                  {!userProfile?.passportNumber && (
                    <p className="text-xs text-gray-500 mt-1">
                      Yurtdışı turları için{' '}
                      <Link href="/profile/update" className="text-[#DD7230] hover:underline">
                        pasaport bilgilerinizi ekleyin
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Siparişlerim</h2>
              {orders.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    ℹ️ Henüz tur satın almadınız. Turlarımıza göz atmak için{' '}
                    <Link href="/" className="underline font-semibold">
                      ana sayfaya
                    </Link>{' '}
                    gidin.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const hasReview = order.reviews.length > 0;
                    const review = hasReview ? order.reviews[0] : null;
                    const departureDate = new Date(order.inventoryItem.startAt);

                    return (
                      <div
                        key={order.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          {/* Left: Tour Info */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {order.inventoryItem.title}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Rota:</span> {order.inventoryItem.from} → {order.inventoryItem.to}
                              </div>
                              <div>
                                <span className="font-medium">Kalkış:</span> {formatDate(departureDate)}
                              </div>
                              <div>
                                <span className="font-medium">Koltuk Sayısı:</span> {order.seats}
                              </div>
                              <div>
                                <span className="font-medium">Toplam Tutar:</span>{' '}
                                {formatPrice(order.totalPrice, 'TRY')}
                              </div>
                              {order.pnrCode && (
                                <div>
                                  <span className="font-medium">PNR:</span> {order.pnrCode}
                                </div>
                              )}
                            </div>
                            {review && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span
                                        key={star}
                                        className={`text-lg ${
                                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-600">
                                    {review.isPublished ? '✅ Yayında' : '⏳ Onay Bekliyor'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 italic">&ldquo;{review.comment}&rdquo;</p>
                              </div>
                            )}
                          </div>

                          {/* Right: Action Button */}
                          <div className="flex-shrink-0">
                            {!hasReview ? (
                              <button
                                onClick={() => handleReviewClick(order)}
                                className="px-6 py-2.5 bg-[#DD7230] text-white font-medium rounded-lg hover:bg-[#DD7230]/90 transition-colors shadow-md whitespace-nowrap"
                              >
                                ⭐ Puan Ver ve Yorum Yap
                              </button>
                            ) : review ? (
                              <div className="text-center">
                                <div className="px-6 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-lg whitespace-nowrap">
                                  {review.isPublished ? '✅ Yorumunuz Yayında' : '⏳ Onay Bekliyor'}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hesap İşlemleri</h2>
              <div className="flex gap-3">
                <Link
                  href="/profile/change-password"
                  className="px-6 py-2.5 bg-[#E63946] text-white font-medium rounded-lg hover:bg-[#E63946]/90 transition-colors shadow-md inline-block text-center"
                >
                  Şifre Değiştir
                </Link>
                <Link
                  href="/profile/update"
                  className="px-6 py-2.5 bg-[#1A2A5A] text-white font-medium rounded-lg hover:bg-[#1A2A5A]/90 transition-colors shadow-md inline-block text-center"
                >
                  Bilgilerimi Güncelle
                </Link>
              </div>
            </div>
          </div>
        </div>

        {(session.user as ExtendedUser)?.role === 'admin' && (
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

      {/* Review Modal */}
      {selectedOrder && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          tourName={selectedOrder.inventoryItem.title}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}












