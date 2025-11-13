'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (session?.user) {
    const userRole = (session.user as any).role;
    
    return (
      <div className="flex items-center gap-3">
        <span className="text-gray-900 text-sm hidden sm:inline">
          Merhaba, <span className="font-semibold">{session.user.name}</span>
        </span>
        
        {userRole === 'admin' && (
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
          >
            👑 Admin Panel
          </Link>
        )}
        
        <Link
          href="/profile"
          className="px-4 py-2 bg-white/80 hover:bg-white text-gray-900 text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          👤 Profil
        </Link>
        
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
        >
          Çıkış
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="px-4 py-2 bg-white/80 hover:bg-white text-gray-900 text-sm font-medium rounded-lg transition-colors shadow-sm"
      >
        Giriş Yap
      </Link>
      <Link
        href="/auth/register"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
      >
        Kayıt Ol
      </Link>
    </div>
  );
}


