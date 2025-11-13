'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Logo() {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href="/" className="flex items-center">
      {!logoError ? (
        <div className="relative h-36 md:h-44 w-auto">
          <Image 
            src="/logo.png" 
            alt="TuruYakala Logo" 
            width={450}
            height={150}
            className="h-36 md:h-44 w-auto object-contain"
            priority
            onError={() => setLogoError(true)}
          />
        </div>
      ) : (
        <h1 className="text-3xl md:text-4xl font-bold">TuruYakala</h1>
      )}
    </Link>
  );
}

