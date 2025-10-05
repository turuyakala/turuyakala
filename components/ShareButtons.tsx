'use client';

import { useState } from 'react';

type ShareButtonsProps = {
  title: string;
};

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    instagram: `https://www.instagram.com/`, // Instagram doğrudan paylaşım desteklemiyor, profil linki
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
        aria-label="Bu turu paylaş"
      >
        <span className="text-lg">↗</span>
        Bu turu paylaş
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="font-medium text-gray-800">Facebook</span>
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <span className="font-medium text-gray-800">X (Twitter)</span>
            </a>
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <span className="font-medium text-gray-800">WhatsApp</span>
            </a>
            <a
              href={shareLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <span className="font-medium text-gray-800">Instagram</span>
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <span className="font-medium text-gray-800">LinkedIn</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}

