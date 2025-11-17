'use client';

import { useState, useEffect } from 'react';

type Slide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description?: string;
};

type HeroSliderProps = {
  slides?: Slide[];
};

const defaultSlides: Slide[] = [
  {
    id: 1,
    image: '/images/hero-1.jpg',
    title: 'Turu Yakala',
    subtitle: 'Son dakikada, en doğru fırsatla!',
    description: 'Muhteşem turlarda son dakika fırsatlarını kaçırmayın'
  },
  {
    id: 2,
    image: '/images/hero-2.jpg',
    title: 'Son Dakika Turları',
    subtitle: 'En son kalan koltukları kaçırmayın',
  },
  {
    id: 3,
    image: '/images/hero-3.jpg',
    title: 'Sürpriz Turlar',
    subtitle: 'Avrupa, Asya, Afrika ve daha fazlası ',
    description: 'Her gün yenilenen sürpriz turlarla mümkün!'
  },
  {
    id: 4,
    image: '/images/hero-4.jpg',
    title: 'Hemen Rezervasyon Yap',
    subtitle: 'Son koltuklar dolmadan',
    description: ''
  }
];

export default function HeroSlider({ slides: propSlides }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(propSlides || defaultSlides);

  useEffect(() => {
    // Fetch slides from API if not provided
    if (!propSlides) {
      fetch('/api/site-settings/hero-slides')
        .then(res => res.json())
        .then(data => {
          if (data.slides && data.slides.length > 0) {
            setSlides(data.slides);
          }
        })
        .catch(() => {
          // Use default slides on error
          setSlides(defaultSlides);
        });
    }
  }, [propSlides]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 saniyede bir değişir

    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image with Subtle Fade Overlay */}
          <div className="absolute inset-0 bg-black/55">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback gradient if image doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center text-center px-4">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 font-montserrat drop-shadow-lg animate-fade-in">
                {slide.title}
              </h1>
              <p className="text-2xl md:text-4xl text-white mb-4 drop-shadow-lg animate-fade-in-delay">
                {slide.subtitle}
              </p>
              {slide.description && (
                <p className="text-lg md:text-xl text-white/90 drop-shadow-lg animate-fade-in-delay-2">
                  {slide.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Slayt ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow Navigation (optional) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
            aria-label="Önceki slayt"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
            aria-label="Sonraki slayt"
          >
            →
          </button>
        </>
      )}
    </div>
  );
}
