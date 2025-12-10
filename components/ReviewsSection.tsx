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
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    fetchReviews();
    
    // Responsive items per view
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth >= 768 ? 3 : 1);
    };
    
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    
    return () => window.removeEventListener('resize', updateItemsPerView);
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
      <span key={i} className={`text-2xl ${i < rating ? 'text-[#E63946]' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, reviews.length - itemsPerView);
      return prev + 1 > maxIndex ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, reviews.length - itemsPerView);
      return prev - 1 < 0 ? maxIndex : prev - 1;
    });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
            Kullanıcılarımız Ne Diyor?
          </h2>
          <div className="text-center text-primary">Yükleniyor...</div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  const maxIndex = Math.max(0, reviews.length - itemsPerView);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* WhatsApp Channel Button */}
        <div className="mb-12 flex justify-center px-4">
          <a
            href="https://whatsapp.com/channel/0029VbC4WE5KrWQpQXthgF3D"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 md:gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 max-w-4xl w-full justify-center text-center"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span className="text-sm md:text-base lg:text-lg leading-tight">
              WhatsApp duyuru kanalımızı takip ederek son yüklenen turlardan anında haberdâr olabilirsiniz!
            </span>
          </a>
        </div>

        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">
          Kullanıcılarımız Ne Diyor?
        </h2>
        <p className="text-center text-primary mb-12 max-w-2xl mx-auto">
          Turlarımıza katılan misafirlerimizin deneyimleri
        </p>

        {/* Reviews Slider */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out gap-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100 h-[320px] flex flex-col flex-shrink-0"
                style={{
                  width: `calc(${100 / itemsPerView}% - ${1.5 * (itemsPerView - 1) / itemsPerView}rem)`,
                  minWidth: `calc(${100 / itemsPerView}% - ${1.5 * (itemsPerView - 1) / itemsPerView}rem)`,
                }}
              >
                {/* Stars */}
                <div className="text-2xl mb-4 flex-shrink-0" title={`${review.rating}/5 Puan`}>
                  {renderStars(review.rating)}
                </div>

                {/* Comment */}
                <p className="text-primary mb-6 leading-relaxed flex-grow overflow-hidden">
                  <span className="line-clamp-5 block">
                    &ldquo;{review.comment}&rdquo;
                  </span>
                </p>

                {/* User Info */}
                <div className="border-t pt-4 flex-shrink-0">
                  <div className="font-semibold text-primary truncate">
                    — {maskName(review.user.name)} - {review.tourName}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {reviews.length > itemsPerView && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 z-10"
                aria-label="Önceki yorum"
              >
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 z-10"
                aria-label="Sonraki yorum"
              >
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {reviews.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`${index + 1}. yorum`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

