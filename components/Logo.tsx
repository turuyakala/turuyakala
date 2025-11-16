'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Logo() {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href="/" className="flex items-center h-full">
      {!logoError ? (
        <div className="relative h-[150%] md:h-[140%] w-auto overflow-hidden flex items-center">
          <Image 
            src="/logo.png" 
            alt="TuruYakala Logo" 
            width={500}
            height={170}
            className="h-full w-auto object-cover object-center"
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

