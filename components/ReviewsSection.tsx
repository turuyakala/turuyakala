'use client';

import { useEffect, useState } from 'react';

type Review = {
  id: string;
  rating: number;
  comment: string;
  tourName: string;
  user: {
    name: string | null;
  };
  createdAt: string;
};

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
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

  const maskName = (fullName: string | null) => {
    if (!fullName) return 'A**** Y****';
    
    const parts = fullName.trim().split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return 'A**** Y****';
    if (parts.length === 1) {
      return parts[0][0] + '****';
    }
    
    // İlk kelimenin ilk harfi + ****, ikinci kelimenin ilk harfi + ****
    return parts.slice(0, 2).map(part => part[0] + '****').join(' ');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-2xl ${i < rating ? 'text-[#a4dded]' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 3 >= reviews.length ? 0 : prev + 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 3 < 0 ? Math.max(0, reviews.length - 3) : prev - 3));
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Kullanıcılarımız Ne Diyor?
          </h2>
          <div className="text-center text-gray-500">Yükleniyor...</div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  const visibleReviews = reviews.slice(currentIndex, currentIndex + 3);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Kullanıcılarımız Ne Diyor?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Turlarımıza katılan misafirlerimizin deneyimleri
        </p>

        {/* Reviews Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {visibleReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
              >
                {/* Stars */}
                <div className="text-2xl mb-4" title={`${review.rating}/5 Puan`}>
                  {renderStars(review.rating)}
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-6 leading-relaxed min-h-[80px]">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* User Info */}
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">
                    — {maskName(review.user.name)} - {review.tourName}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {reviews.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                aria-label="Önceki yorumlar"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                disabled={currentIndex + 3 >= reviews.length}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                aria-label="Sonraki yorumlar"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {reviews.length > 3 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * 3)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / 3) === index
                    ? 'w-8 bg-[#a4dded]'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`${index + 1}. grup yorumlar`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

