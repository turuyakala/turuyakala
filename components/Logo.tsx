'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Logo() {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href="/" className="flex items-center">
      {!logoError ? (
        <div className="relative h-28 md:h-32 w-auto">
          <Image 
            src="/logo.png" 
            alt="TuruYakala Logo" 
            width={350}
            height={120}
            className="h-28 md:h-32 w-auto object-contain"
            priority
            onError={() => setLogoError(true)}
          />
        </div>
      ) : (
        <h1 className="text-2xl md:text-3xl font-bold">TuruYakala</h1>
      )}
    </Link>
  );
}

