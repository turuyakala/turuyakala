'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Logo() {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href="/" className="flex items-center">
      <div className="flex items-center space-x-2">
        {!logoError && (
          <div className="relative h-10 w-32 hidden sm:block">
            <Image 
              src="/logo.png" 
              alt="TuruYakala Logo" 
              width={150}
              height={50}
              className="h-10 w-auto object-contain"
              priority
              onError={() => setLogoError(true)}
            />
          </div>
        )}
        <h1 className="text-xl font-bold">TuruYakala</h1>
      </div>
    </Link>
  );
}

