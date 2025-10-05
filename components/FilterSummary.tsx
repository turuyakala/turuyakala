'use client';

import { useSearchParams } from 'next/navigation';

export default function FilterSummary() {
  const searchParams = useSearchParams();
  const category = searchParams.get('cat');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const window = searchParams.get('window') || '72';

  const parts: string[] = [];
  
  if (category && category !== 'all' && category === 'tour') {
    parts.push('Turlar');
  }
  
  if (from) {
    parts.push(`${from} çıkışlı`);
  }
  
  if (to) {
    parts.push(`${to} varışlı`);
  }
  
  parts.push(`${window} saat içinde`);

  return (
    <div className="text-sm text-gray-600 mt-1">
      {parts.join(' • ')}
    </div>
  );
}

