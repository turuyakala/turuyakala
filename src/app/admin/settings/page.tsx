'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Slide = {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description?: string;
};

export default function SiteSettingsPage() {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/site-settings/hero-slides');
      if (response.ok) {
        const data = await response.json();
        setSlides(data.slides || []);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      setError('Slides yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now(),
      image: '/images/hero-1.jpg',
      title: 'Yeni Slayt',
      subtitle: 'Alt başlık',
      description: ''
    };
    setSlides([...slides, newSlide]);
  };

  const handleRemoveSlide = (id: number) => {
    if (slides.length <= 1) {
      setError('En az bir slayt olmalıdır');
      return;
    }
    setSlides(slides.filter(slide => slide.id !== id));
  };

  const handleSlideChange = (id: number, field: keyof Slide, value: string) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    ));
  };

  const handleImageUpload = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        handleSlideChange(id, 'image', data.url);
        setSuccess('Fotoğraf yüklendi');
      } else {
        setError('Fotoğraf yüklenemedi');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Fotoğraf yüklenemedi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/site-settings/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });

      if (response.ok) {
        setSuccess('Ayarlar başarıyla kaydedildi');
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        const data = await response.json();
        setError(data.error || 'Ayarlar kaydedilemedi');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Ayarlar kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900">Site İçi Ayarlar</h1>
        </div>
        <p className="text-gray-600 mt-2">Hero slider ve site ayarlarını yönetin</p>
      </div>

      {/* Hero Slider Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">Hero Slider Ayarları</h2>
          </div>
          <button
            onClick={handleAddSlide}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Yeni Slayt Ekle
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {slides.map((slide, index) => (
            <div key={slide.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Slayt {index + 1}</h3>
                {slides.length > 1 && (
                  <button
                    onClick={() => handleRemoveSlide(slide.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Sil
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fotoğraf
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(slide.id, e)}
                        disabled={isSaving}
                        className="hidden"
                      />
                      <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors text-center flex items-center justify-center gap-2">
                        {isSaving ? (
                          <>
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Yükleniyor...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Fotoğraf Yükle</span>
                          </>
                        )}
                      </div>
                    </label>
                    <input
                      type="text"
                      value={slide.image}
                      onChange={(e) => handleSlideChange(slide.id, 'image', e.target.value)}
                      placeholder="/images/hero-1.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt="Preview"
                      className="mt-2 w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Başlık
                  </label>
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={(e) => handleSlideChange(slide.id, 'subtitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama (Opsiyonel)
                  </label>
                  <textarea
                    value={slide.description || ''}
                    onChange={(e) => handleSlideChange(slide.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Ayarları Kaydet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

