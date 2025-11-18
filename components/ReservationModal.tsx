'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { formatPrice, type Currency } from '@/lib/price';
import Link from 'next/link';

const reservationSchema = z.object({
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  kvkkAccepted: z.boolean().refine(val => val === true, 'KVKK sözleşmesini onaylamanız gerekmektedir'),
  mesafeliAccepted: z.boolean().refine(val => val === true, 'Mesafeli satış sözleşmesini onaylamanız gerekmektedir'),
});

type ReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
  tourTitle: string;
  tourFrom: string;
  tourTo: string;
  tourStartAt: string;
  price: number;
  currency: string;
  guests: number;
  totalPrice: number;
  requiresPassport?: boolean;
  seatsLeft: number;
};

export default function ReservationModal({
  isOpen,
  onClose,
  tourId,
  tourTitle,
  tourFrom,
  tourTo,
  tourStartAt,
  price,
  currency,
  guests,
  totalPrice,
  requiresPassport,
  seatsLeft,
}: ReservationModalProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
    passportExpiry: '',
    kvkkAccepted: false,
    mesafeliAccepted: false,
  });

  useEffect(() => {
    if (isOpen && session?.user) {
      fetchUserProfile();
    }
    if (isOpen) {
      // Auto-fill with session data
      setFormData(prev => ({
        ...prev,
        fullName: session?.user?.name || prev.fullName,
        email: session?.user?.email || prev.email,
      }));
    }
  }, [isOpen, session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate form
      const validation = reservationSchema.safeParse({
        ...formData,
        guests,
      });

      if (!validation.success) {
        const fieldErrors = validation.error.errors[0];
        setError(fieldErrors.message);
        setIsSubmitting(false);
        return;
      }

      // Check if tour requires passport
      if (requiresPassport && !formData.passportNumber) {
        setError('Bu tur için pasaport numarası gereklidir');
        setIsSubmitting(false);
        return;
      }

      // Check if enough seats available
      if (guests > seatsLeft) {
        setError(`Sadece ${seatsLeft} koltuk kaldı`);
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
          tourId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          guests,
          passportNumber: formData.passportNumber || undefined,
          passportExpiry: formData.passportExpiry || undefined,
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
        detail: { tourId, seats: data.order?.seats }
      }));
      window.dispatchEvent(new CustomEvent('seats-updated', {
        detail: { tourId }
      }));

      // Close modal and redirect to payment page
      onClose();
      window.location.href = `/reservation/${tourId}?guests=${guests}&orderId=${data.order.id}`;
    } catch (err) {
      console.error('Reservation error:', err);
      setError('Bir hata oluştu, lütfen tekrar deneyin');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#1A2A5A] to-[#1A2A5A]/90 text-white p-6 rounded-t-xl flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold">Rezervasyon Yap</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Tur Özeti */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{tourTitle}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Rota:</span> {tourFrom} → {tourTo}</p>
                <p><span className="font-medium">Kalkış:</span> {new Date(tourStartAt).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</p>
                <p><span className="font-medium">Kişi Sayısı:</span> {guests}</p>
                <p className="pt-2 border-t border-gray-300 mt-2">
                  <span className="font-medium">Toplam:</span> <span className="text-lg font-bold text-[#E63946]">
                    {formatPrice(totalPrice * 100, currency as Currency)}
                  </span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Kişisel Bilgiler */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kişisel Bilgiler</h3>
                <div className="space-y-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-[#1A2A5A] text-gray-900"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-[#1A2A5A] text-gray-900"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-[#1A2A5A] text-gray-900"
                    />
                  </div>

                  {/* Pasaport Bilgileri */}
                  {requiresPassport && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">📘</span>
                        <h4 className="text-lg font-semibold text-gray-900">Pasaport Bilgileri</h4>
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-[#1A2A5A] text-gray-900"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2A5A] focus:border-[#1A2A5A] text-gray-900"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sözleşmeler */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sözleşmeler</h3>
                <div className="space-y-3">
                  {/* KVKK */}
                  <div className="flex items-start gap-3">
                    <input
                      id="kvkk"
                      type="checkbox"
                      checked={formData.kvkkAccepted}
                      onChange={(e) => setFormData({ ...formData, kvkkAccepted: e.target.checked })}
                      disabled={isSubmitting}
                      className="mt-1 w-5 h-5 text-[#1A2A5A] border-gray-300 rounded focus:ring-[#1A2A5A]"
                    />
                    <label htmlFor="kvkk" className="text-sm text-gray-700">
                      <Link href="/legal/kvkk" target="_blank" className="text-[#1A2A5A] hover:underline font-medium">
                        Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni
                      </Link>
                      'ni okudum ve kabul ediyorum. *
                    </label>
                  </div>

                  {/* Mesafeli Satış */}
                  <div className="flex items-start gap-3">
                    <input
                      id="mesafeli"
                      type="checkbox"
                      checked={formData.mesafeliAccepted}
                      onChange={(e) => setFormData({ ...formData, mesafeliAccepted: e.target.checked })}
                      disabled={isSubmitting}
                      className="mt-1 w-5 h-5 text-[#1A2A5A] border-gray-300 rounded focus:ring-[#1A2A5A]"
                    />
                    <label htmlFor="mesafeli" className="text-sm text-gray-700">
                      <Link href="/legal/mesafeli" target="_blank" className="text-[#1A2A5A] hover:underline font-medium">
                        Mesafeli Satış Sözleşmesi
                      </Link>
                      'ni okudum ve kabul ediyorum. *
                    </label>
                  </div>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-[#E63946] hover:bg-[#E63946]/90 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'İşleniyor...' : 'Ödemeye Geç'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

