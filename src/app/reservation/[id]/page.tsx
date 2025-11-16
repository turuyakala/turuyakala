'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { z } from 'zod';
import { formatPrice } from '@/lib/price';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const reservationSchema = z.object({
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  guests: z.number().min(1).max(20, 'Maksimum 20 kişi rezervasyon yapabilirsiniz'),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
});

type ReservationInput = z.infer<typeof reservationSchema>;

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const resolvedParams = use(params);
  const [tour, setTour] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const guestsParam = parseInt(searchParams.get('guests') || '1');
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState<ReservationInput>({
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    guests: guestsParam,
    passportNumber: '',
    passportExpiry: '',
  });

  useEffect(() => {
    if (resolvedParams.id) {
      fetchTour();
    }
    if (session?.user) {
      fetchUserProfile();
    }
  }, [resolvedParams.id, session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        // Auto-fill form with user profile data
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || data.user.name || '',
          email: prev.email || data.user.email || '',
          phone: prev.phone || data.user.phone || '',
          passportNumber: prev.passportNumber || data.user.passportNumber || '',
          passportExpiry: prev.passportExpiry || (data.user.passportExpiry ? new Date(data.user.passportExpiry).toISOString().split('T')[0] : ''),
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchTour = async () => {
    try {
      const response = await fetch(`/api/tours/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setTour(data);
      } else {
        setError('Tur bulunamadı');
      }
    } catch (err) {
      console.error('Error fetching tour:', err);
      setError('Tur yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate form
      const validation = reservationSchema.safeParse(formData);

      if (!validation.success) {
        const fieldErrors = validation.error.errors[0];
        setError(fieldErrors.message);
        setIsSubmitting(false);
        return;
      }

      // Check if tour requires passport
      if (tour?.requiresPassport && !formData.passportNumber) {
        setError('Bu tur için pasaport numarası gereklidir');
        setIsSubmitting(false);
        return;
      }

      // Check if enough seats available
      if (formData.guests > tour?.seatsLeft) {
        setError(`Sadece ${tour?.seatsLeft} koltuk kaldı`);
        setIsSubmitting(false);
        return;
      }

      // Create reservation
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId: resolvedParams.id,
          ...validation.data,
          userId: session?.user?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Rezervasyon oluşturulurken bir hata oluştu');
        setIsSubmitting(false);
        return;
      }

      // Rezervasyon başarılı - tüm sayfalardaki tur kartlarını güncelle
      window.dispatchEvent(new CustomEvent('reservation-success', {
        detail: { tourId: resolvedParams.id, seats: data.order?.seats }
      }));
      window.dispatchEvent(new CustomEvent('seats-updated', {
        detail: { tourId: resolvedParams.id }
      }));

      // Initiate payment
      const paymentResponse = await fetch('/api/payment/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.order.id,
          paymentMethod: 'credit_card', // Default, can be made selectable
          returnUrl: `${window.location.origin}/payment/callback?orderId=${data.order.id}`,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentData.success) {
        setError(paymentData.error || 'Ödeme işlemi başlatılamadı');
        setIsSubmitting(false);
        return;
      }

      // Redirect to payment page (banka entegrasyonu yapıldığında paymentUrl kullanılacak)
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        // If no payment URL, redirect to success (for testing)
        setSuccess(true);
        setTimeout(() => {
          router.push(`/reservation/${resolvedParams.id}/success?orderId=${data.order.id}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Reservation error:', err);
      setError('Bir hata oluştu, lütfen tekrar deneyin');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✈️</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tur Bulunamadı</h1>
          <Link href="/" className="text-[#DD7230] hover:underline">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = tour.price * formData.guests;
  const requiresPassport = tour.requiresPassport || tour.requiresVisa;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Rezervasyon Başarılı!</h2>
            <p className="text-green-700">Yönlendiriliyorsunuz...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Rezervasyon Bilgileri</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Kişi Sayısı */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kişi Sayısı *
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                        disabled={formData.guests <= 1 || isSubmitting}
                        className="w-12 h-12 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg font-bold text-xl transition-colors"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-bold text-[#DD7230]">{formData.guests}</div>
                        <div className="text-sm text-gray-600">Kişi</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, guests: Math.min(tour.seatsLeft, formData.guests + 1) })}
                        disabled={formData.guests >= tour.seatsLeft || isSubmitting}
                        className="w-12 h-12 bg-[#DD7230] hover:bg-[#DD7230]/90 disabled:bg-gray-100 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Maksimum {tour.seatsLeft} kişi seçebilirsiniz
                    </p>
                  </div>

                  {/* Ad Soyad */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD7230] focus:border-[#DD7230] text-gray-900"
                    />
                  </div>

                  {/* E-posta */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta Adresi *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD7230] focus:border-[#DD7230] text-gray-900"
                    />
                  </div>

                  {/* Telefon */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon Numarası *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      disabled={isSubmitting}
                      placeholder="+90 555 123 4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD7230] focus:border-[#DD7230] text-gray-900"
                    />
                  </div>

                  {/* Pasaport Bilgileri (Yurtdışı turları için) */}
                  {requiresPassport && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📘</span>
                        <h3 className="text-lg font-semibold text-gray-900">Pasaport Bilgileri</h3>
                      </div>
                      
                      <div>
                        <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Pasaport Numarası *
                        </label>
                        <input
                          id="passportNumber"
                          type="text"
                          value={formData.passportNumber}
                          onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                          required
                          disabled={isSubmitting}
                          placeholder="A12345678"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD7230] focus:border-[#DD7230] text-gray-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="passportExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                          Pasaport Geçerlilik Tarihi *
                        </label>
                        <input
                          id="passportExpiry"
                          type="date"
                          value={formData.passportExpiry}
                          onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                          required
                          disabled={isSubmitting}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD7230] focus:border-[#DD7230] text-gray-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#DD7230] hover:bg-[#DD7230]/90 text-white font-bold text-lg py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Rezervasyon Yapılıyor...' : '🎫 Rezervasyonu Tamamla'}
                  </button>
                </form>
              </div>
            </div>

            {/* Özet */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Rezervasyon Özeti</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Tur</p>
                    <p className="font-semibold text-gray-900">{tour.title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Rota</p>
                    <p className="font-semibold text-gray-900">{tour.from} → {tour.to}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Kalkış</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(tour.startAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{tour.price.toLocaleString('tr-TR')} {tour.currency} × {formData.guests} kişi</span>
                      <span className="font-medium">{totalPrice.toLocaleString('tr-TR')} {tour.currency}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Toplam</span>
                      <span className="text-2xl font-bold text-[#DD7230]">
                        {formatPrice(totalPrice * 100, tour.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

