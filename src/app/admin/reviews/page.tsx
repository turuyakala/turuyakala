'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Review = {
  id: string;
  rating: number;
  comment: string;
  tourName: string;
  isApproved: boolean;
  isPublished: boolean;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  order: {
    pnrCode: string | null;
  };
};

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isApproved: approved,
          isPublished: approved, // Auto-publish when approved
        }),
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-2xl ${i < rating ? 'text-[#a4dded]' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💬</div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const pendingReviews = reviews.filter(r => !r.isApproved);
  const publishedReviews = reviews.filter(r => r.isPublished);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💬 Kullanıcı Yorumları</h1>
          <p className="text-gray-600 mt-1">
            Yorum moderasyonu ve yönetimi
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-yellow-600 font-semibold mb-1">Onay Bekleyen</div>
          <div className="text-3xl font-bold text-yellow-900">{pendingReviews.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-green-600 font-semibold mb-1">Yayınlanan</div>
          <div className="text-3xl font-bold text-green-900">{publishedReviews.length}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-gray-600 font-semibold mb-1">Toplam</div>
          <div className="text-3xl font-bold text-gray-900">{reviews.length}</div>
        </div>
      </div>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-yellow-700">⏳ Onay Bekleyen Yorumlar</h2>
          {pendingReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{renderStars(review.rating)}</div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                      Onay Bekliyor
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                  <div className="text-sm text-gray-600">
                    <div><strong>Tur:</strong> {review.tourName}</div>
                    <div><strong>Kullanıcı:</strong> {review.user.name} ({review.user.email})</div>
                    {review.order.pnrCode && <div><strong>PNR:</strong> {review.order.pnrCode}</div>}
                    <div><strong>Tarih:</strong> {new Date(review.createdAt).toLocaleString('tr-TR')}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(review.id, true)}
                  className="px-4 py-2 bg-[#E7E393] text-white rounded-lg hover:bg-[#E7E393]/90 transition-colors font-semibold"
                >
                  ✓ Onayla ve Ana Sayfada Göster
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  ✗ Reddet ve Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Published Reviews */}
      {publishedReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-700">✅ Yayınlanan Yorumlar</h2>
          {publishedReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{renderStars(review.rating)}</div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      Yayında
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                  <div className="text-sm text-gray-600">
                    <div><strong>Tur:</strong> {review.tourName}</div>
                    <div><strong>Kullanıcı:</strong> {review.user.name} ({review.user.email})</div>
                    <div><strong>Tarih:</strong> {new Date(review.createdAt).toLocaleString('tr-TR')}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(review.id, false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  📰 Ana Sayfadan Kaldır
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  ✗ Tamamen Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz Yorum Yok
          </h3>
          <p className="text-gray-600">
            Kullanıcılardan gelen yorumlar burada görünecek
          </p>
        </div>
      )}
    </div>
  );
}

