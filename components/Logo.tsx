'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Logo() {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href="/" className="flex items-center">
      {!logoError ? (
        <div className="relative h-40 md:h-52 w-auto">
          <Image 
            src="/logo.png" 
            alt="TuruYakala Logo" 
            width={500}
            height={170}
            className="h-40 md:h-52 w-auto object-contain"
            priority
            onError={() => setLogoError(true)}
          />
        </div>
      ) : (
        <h1 className="text-4xl md:text-5xl font-bold">TuruYakala</h1>
      )}
    </Link>
  );
}

