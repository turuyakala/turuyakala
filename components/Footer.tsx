import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Slogan */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-bold font-montserrat mb-2 text-[#1A2A5A]">TuruYakala</h3>
            <p className="text-[#1A2A5A] text-lg mb-6">
              Son dakikada, en doğru fırsatla!
            </p>
            
            {/* Sosyal Medya İkonları */}
            <div className="flex gap-4 mb-6">
              <a 
                href="https://instagram.com/turuyakala" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#E63946] rounded-full flex items-center justify-center hover:bg-[#E63946]/90 transition-colors shadow-md"
                aria-label="Instagram"
              >
                <img 
                  src="/images/social/instagram.svg" 
                  alt="Instagram" 
                  className="w-6 h-6 brightness-0 invert"
                />
              </a>
              <a 
                href="https://x.com/turuyakala" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#E63946] rounded-full flex items-center justify-center hover:bg-[#E63946]/90 transition-colors shadow-md"
                aria-label="X (Twitter)"
              >
                <img 
                  src="/images/social/x.svg" 
                  alt="X" 
                  className="w-6 h-6 brightness-0 invert"
                />
              </a>
              <a 
                href="https://tiktok.com/@turuyakala" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#E63946] rounded-full flex items-center justify-center hover:bg-[#E63946]/90 transition-colors shadow-md"
                aria-label="TikTok"
              >
                <img 
                  src="/images/social/tiktok.svg" 
                  alt="TikTok" 
                  className="w-6 h-6 brightness-0 invert"
                />
              </a>
            </div>
          </div>

          {/* Bilgi Sayfaları */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#1A2A5A]">Bilgi</h3>
            <ul className="text-[#1A2A5A] text-sm space-y-2">
              <li>
                <Link href="/hakkimizda" className="hover:text-[#1A2A5A]/70 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-[#1A2A5A]/70 transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-[#1A2A5A]/70 transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Yasal Bilgiler */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#1A2A5A]">Yasal Bilgiler</h3>
            <ul className="text-[#1A2A5A] text-sm space-y-2">
              <li>
                <Link href="/kvkk" className="hover:text-[#1A2A5A]/70 transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="hover:text-[#1A2A5A]/70 transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/legal/mesafeli" className="hover:text-[#1A2A5A]/70 transition-colors">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-6 text-center text-[#1A2A5A] text-sm">
          <p>&copy; {new Date().getFullYear()} TuruYakala. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}