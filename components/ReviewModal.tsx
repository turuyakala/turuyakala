'use client';

import { useState } from 'react';

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  tourName: string;
  onSuccess: () => void;
};

export default function ReviewModal({ isOpen, onClose, orderId, tourName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Lütfen puan verin');
      return;
    }

    if (comment.length < 10) {
      setError('Yorum en az 10 karakter olmalıdır');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Yorum gönderilirken bir hata oluştu');
        setIsSubmitting(false);
        return;
      }

      // Success
      setRating(0);
      setComment('');
      setError(null);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Review submission error:', err);
      setError('Bir hata oluştu, lütfen tekrar deneyin');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Puan Ver ve Yorum Yap</h2>
              <p className="text-gray-600 mt-1">{tourName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Puanınız <span className="text-secondary">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`text-4xl transition-transform hover:scale-110 ${
                      star <= (hoverRating || rating)
                        ? 'text-primary'
                        : 'text-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {rating === 5 && 'Mükemmel!'}
                  {rating === 4 && 'Çok İyi'}
                  {rating === 3 && 'İyi'}
                  {rating === 2 && 'Orta'}
                  {rating === 1 && 'Kötü'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Yorumunuz <span className="text-secondary">*</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Tur deneyiminizi paylaşın... (En az 10 karakter)"
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/10 karakter (minimum)
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-3">
                <p className="text-sm text-secondary">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || rating === 0 || comment.length < 10}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

