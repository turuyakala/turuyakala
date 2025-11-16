'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/lib/types';

type FilterBarProps = {
  fromOptions: string[];
  toOptions: string[];
  priceRange: { min: number; max: number };
};

const categories: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: '🏞️ Tüm Turlar' },
  { value: 'tour', label: '🏞️ Turlar' },
];

const windowOptions = [
  { value: 24, label: '24 Saat' },
  { value: 48, label: '48 Saat' },
  { value: 72, label: '72 Saat' },
];

export default function FilterBar({ fromOptions, toOptions, priceRange }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<string>(searchParams.get('cat') || 'all');
  const [from, setFrom] = useState<string>(searchParams.get('from') || '');
  const [to, setTo] = useState<string>(searchParams.get('to') || '');
  const [window, setWindow] = useState<number>(
    parseInt(searchParams.get('window') || '72', 10)
  );
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');

  const handleApply = () => {
    const params = new URLSearchParams();

    if (category && category !== 'all') params.set('cat', category);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (window) params.set('window', window.toString());
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    setCategory('all');
    setFrom('');
    setTo('');
    setWindow(72);
    setMinPrice('');
    setMaxPrice('');
    router.push('/');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-primary">🔍 Filtrele</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category */}
        <div>
          <label htmlFor="filter-category" className="block text-sm font-medium text-primary mb-2">
            Kategori
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-primary bg-white"
            aria-label="Kategori seçin"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* From */}
        <div>
          <label htmlFor="filter-from" className="block text-sm font-medium text-primary mb-2">
            Nereden
          </label>
          <input
            id="filter-from"
            type="text"
            list="from-options"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Şehir seçin veya yazın"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-primary bg-white placeholder-gray-400"
            aria-label="Nereden"
          />
          <datalist id="from-options">
            {fromOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        {/* To */}
        <div>
          <label htmlFor="filter-to" className="block text-sm font-medium text-primary mb-2">
            Nereye
          </label>
          <input
            id="filter-to"
            type="text"
            list="to-options"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Şehir seçin veya yazın"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-primary bg-white placeholder-gray-400"
            aria-label="Nereye"
          />
          <datalist id="to-options">
            {toOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        {/* Time Window */}
        <div>
          <label htmlFor="filter-window" className="block text-sm font-medium text-primary mb-2">
            Zaman Penceresi
          </label>
          <select
            id="filter-window"
            value={window}
            onChange={(e) => setWindow(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-primary bg-white"
            aria-label="Zaman penceresi seçin"
          >
            {windowOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label htmlFor="filter-min-price" className="block text-sm font-medium text-primary mb-2">
            Min Fiyat (₺)
          </label>
          <input
            id="filter-min-price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={priceRange.min.toString()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-primary bg-white placeholder-gray-400"
            aria-label="Minimum fiyat"
          />
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="filter-max-price" className="block text-sm font-medium text-primary mb-2">
            Max Fiyat (₺)
          </label>
          <input
            id="filter-max-price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={priceRange.max.toString()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-primary bg-white placeholder-gray-400"
            aria-label="Maksimum fiyat"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleApply}
          className="flex-1 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/50"
          aria-label="Filtreleri uygula"
        >
          🔍 Uygula
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-tertiary text-primary font-medium rounded-lg hover:bg-tertiary/80 transition-colors focus:outline-none focus:ring-4 focus:ring-tertiary/50"
          aria-label="Tüm filtreleri sıfırla"
        >
          🔄 Sıfırla
        </button>
      </div>
    </div>
  );
}

