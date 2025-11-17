'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
    );
  }

  if (session?.user) {
    const userRole = (session.user as any).role;
    
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-[#1A2A5A]/70 hover:bg-[#1A2A5A]/90 text-white rounded-full transition-colors shadow-sm"
          aria-label="Profil menüsü"
          aria-expanded={isOpen}
        >
          {/* Profil İkonu */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {/* Aşağı Ok */}
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menü */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-black py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-300">
              <p className="text-sm font-semibold text-black">{session.user.name}</p>
              <p className="text-xs text-gray-600 truncate">{session.user.email}</p>
            </div>
            
            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
              >
                👤 Profilim
              </Link>
              
              {userRole === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                >
                  👑 Admin Panel
                </Link>
              )}
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Giriş yapılmamışsa dropdown menü
  return (
    <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-[#1A2A5A]/70 hover:bg-[#1A2A5A]/90 text-white rounded-full transition-colors shadow-sm"
          aria-label="Giriş menüsü"
          aria-expanded={isOpen}
        >
        {/* Profil İkonu */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        {/* Aşağı Ok */}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menü */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-black py-2 z-50">
          <div className="py-1">
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
            >
              🔐 Giriş Yap
            </Link>
            
            <Link
              href="/auth/register"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
            >
              ✨ Kaydol
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


