'use client';

import { useState } from 'react';
import Image from 'next/image';

type ImageGalleryProps = {
  images: string[];
  title: string;
};

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl h-96 flex items-center justify-center">
        <div className="text-9xl opacity-30">🏞️</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Ana Fotoğraf */}
      <div className="relative h-96 md:h-[500px] bg-gray-100">
        <img
          src={images[selectedImage]}
          alt={`${title} - Fotoğraf ${selectedImage + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Fotoğraf Sayacı */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
          {selectedImage + 1} / {images.length}
        </div>

        {/* Ok Tuşları (1'den fazla fotoğraf varsa) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
              aria-label="Önceki fotoğraf"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
              aria-label="Sonraki fotoğraf"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Listesi */}
      {images.length > 1 && (
        <div className="p-4 bg-gray-50">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? 'border-[#91A8D0] ring-2 ring-[#91A8D0]/30 scale-105'
                    : 'border-gray-300 hover:border-[#91A8D0] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}







