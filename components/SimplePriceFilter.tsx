'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type SimplePriceFilterProps = {
  priceRange: { min: number; max: number };
};

export default function SimplePriceFilter({ priceRange }: SimplePriceFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    
    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder={`Min ${priceRange.min}₺`}
          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E7E393] text-gray-900 text-sm bg-white placeholder-gray-400"
          aria-label="Minimum fiyat"
        />
        <span className="text-gray-500">-</span>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder={`Max ${priceRange.max}₺`}
          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E7E393] text-gray-900 text-sm bg-white placeholder-gray-400"
          aria-label="Maksimum fiyat"
        />
      </div>
      
      <button
        onClick={handleApply}
        className="px-4 py-2 bg-[#E7E393] text-white text-sm font-medium rounded-md hover:bg-[#E7E393]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E7E393]/50"
        aria-label="Fiyat filtresini uygula"
      >
        Uygula
      </button>
      
      {(minPrice || maxPrice) && (
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
          aria-label="Fiyat filtresini temizle"
        >
          Temizle
        </button>
      )}
    </div>
  );
}




