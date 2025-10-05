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
        <span className="text-white text-sm hidden sm:inline">
          Merhaba, <span className="font-semibold">{session.user.name}</span>
        </span>
        
        {userRole === 'admin' && (
          <Link
            href="/admin"
            className="px-4 py-2 bg-[#563C5C] hover:bg-[#563C5C]/90 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
          >
            👑 Admin Panel
          </Link>
        )}
        
        <Link
          href="/profile"
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
        >
          👤 Profil
        </Link>
        
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 bg-[#563C5C] hover:bg-[#563C5C]/90 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
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
        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Giriş Yap
      </Link>
      <Link
        href="/auth/register"
            className="px-4 py-2 bg-white hover:bg-gray-100 text-[#563C5C] text-sm font-medium rounded-lg transition-colors shadow-md"
      >
        Kayıt Ol
      </Link>
    </div>
  );
}


