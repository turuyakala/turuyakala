'use client';

import { useState } from 'react';

type MobileFilterToggleProps = {
  children: React.ReactNode;
};

export default function MobileFilterToggle({ children }: MobileFilterToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Mobile Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full mb-4 px-4 py-3 bg-[#563C5C] text-white font-medium rounded-lg hover:bg-[#563C5C]/90 transition-colors flex items-center justify-between"
      >
        <span>🔍 Filtreleri {isOpen ? 'Gizle' : 'Göster'}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        {children}
      </div>
    </div>
  );
}

