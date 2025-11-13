'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Logo() {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href="/" className="flex items-center">
      {!logoError ? (
        <div className="relative h-20 w-auto">
          <Image 
            src="/logo.png" 
            alt="TuruYakala Logo" 
            width={250}
            height={80}
            className="h-20 w-auto object-contain"
            priority
            onError={() => setLogoError(true)}
          />
        </div>
      ) : (
        <h1 className="text-xl font-bold">TuruYakala</h1>
      )}
    </Link>
  );
}

