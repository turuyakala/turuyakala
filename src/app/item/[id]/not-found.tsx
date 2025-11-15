import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tur Bulunamadı</h1>
        <p className="text-gray-600 mb-8">Aradığınız tur bulunamadı veya artık mevcut değil.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#DD7230] text-white rounded-lg hover:bg-[#DD7230]/90 transition-colors"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

