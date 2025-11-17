'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewModal from '@/components/ReviewModal';
import Navigation from '@/components/Navigation';
import { formatDate } from '@/lib/time';
import { formatPrice } from '@/lib/price';
import Image from 'next/image';

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
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Hesap Bilgileri ve Adres Bilgileri Kutucuğu */}
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
                    T.C. Kimlik Numarası
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.tcKimlikNo ? (
                      <span className="font-mono">{userProfile.tcKimlikNo}</span>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cinsiyet
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.gender === 'male' ? 'Erkek' : 
                     userProfile?.gender === 'female' ? 'Kadın' : 
                     userProfile?.gender === 'other' ? 'Diğer' : 
                     userProfile?.gender === 'prefer_not_to_say' ? 'Belirtmek istemiyorum' : '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doğum Tarihi
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('tr-TR') : '-'}
                  </div>
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

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Adres Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ülke
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.addressCountry || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İl
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.addressProvince || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlçe
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.addressDistrict || '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posta Kodu
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.addressPostalCode || '-'}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres Satırı
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.addressLine1 || '-'}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres Satırı 2 (İsteğe Bağlı)
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                    {userProfile?.addressLine2 || '-'}
                  </div>
                </div>
              </div>
              {(!userProfile?.addressCountry || !userProfile?.addressProvince || !userProfile?.addressLine1) && (
                <p className="text-xs text-gray-500 mt-4">
                  Fatura için{' '}
                  <Link href="/profile/update" className="text-[#DD7230] hover:underline">
                        adres bilgilerinizi ekleyin
                      </Link>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Önceden Yakaladıklarım - Ayrı Kutucuk */}
        <div className="bg-[#1A2A5A] rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Önceden Yakaladıklarım</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white text-lg mb-2">
                Henüz bir tur yakalamamışsınız. Yakalamak için durmayın,{' '}
                <Link href="/" className="underline font-bold hover:text-[#DAE4F2] transition-colors">
                  tıklayın!
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const hasReview = order.reviews.length > 0;
                const review = hasReview ? order.reviews[0] : null;
                const departureDate = new Date(order.inventoryItem.startAt);
                const tourImage = order.inventoryItem.image || '/images/default-tour.jpg';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg p-5 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center hover:shadow-lg transition-shadow"
                  >
                    {/* Sol: Fotoğraf */}
                    <div className="flex-shrink-0">
                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-200">
                        <Image
                          src={tourImage}
                          alt={order.inventoryItem.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 96px, 128px"
                        />
                      </div>
                    </div>

                    {/* Orta: Tur Bilgileri */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {order.inventoryItem.title}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <span className="font-medium">Tarih:</span> {formatDate(departureDate)}
                        </div>
                        <div>
                          <span className="font-medium">Rota:</span> {order.inventoryItem.from} → {order.inventoryItem.to}
                        </div>
                        {review && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-sm ${
                                      star <= review.rating ? 'text-[#E63946]' : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {review.isPublished ? '✅ Yayında' : '⏳ Onay Bekliyor'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 italic line-clamp-2">&ldquo;{review.comment}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sağ: Değerlendir Butonu */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                      {!hasReview ? (
                        <button
                          onClick={() => handleReviewClick(order)}
                          className="w-full md:w-auto px-6 py-3 bg-[#E63946] text-white font-semibold rounded-lg hover:bg-[#E63946]/90 transition-colors shadow-md whitespace-nowrap"
                        >
                          ⭐ Değerlendir ve Yorum Yap
                        </button>
                      ) : review ? (
                        <div className="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-lg text-center whitespace-nowrap">
                          {review.isPublished ? '✅ Yorumunuz Yayında' : '⏳ Onay Bekliyor'}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hesap İşlemleri Kutucuğu */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hesap İşlemleri</h2>
            <p className="text-sm text-gray-600 mb-4">
              Kişisel bilgilerinizi, adres bilgilerinizi ve diğer profil bilgilerinizi güncelleyebilirsiniz.
            </p>
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












