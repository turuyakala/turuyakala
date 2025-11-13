import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#E7E393] py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Slogan */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-bold font-montserrat mb-2 text-[#854D27]">TuruYakala</h3>
            <p className="text-[#854D27] text-lg mb-6">
              Son dakikada, en doğru fırsatla!
            </p>
            
            {/* Sosyal Medya İkonları */}
            <div className="flex gap-4 mb-6">
              <a 
                href="https://instagram.com/turuyakala" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Instagram"
              >
                <img 
                  src="/images/social/instagram.svg" 
                  alt="Instagram" 
                  className="w-6 h-6"
                />
              </a>
              <a 
                href="https://x.com/turuyakala" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="X (Twitter)"
              >
                <img 
                  src="/images/social/x.svg" 
                  alt="X" 
                  className="w-6 h-6"
                />
              </a>
              <a 
                href="https://tiktok.com/@turuyakala" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="TikTok"
              >
                <img 
                  src="/images/social/tiktok.svg" 
                  alt="TikTok" 
                  className="w-6 h-6"
                />
              </a>
            </div>
          </div>

          {/* Bilgi Sayfaları */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#854D27]">Bilgi</h3>
            <ul className="text-[#854D27] text-sm space-y-2">
              <li>
                <Link href="/hakkimizda" className="hover:text-[#854D27]/80 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-[#854D27]/80 transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-[#854D27]/80 transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Yasal Bilgiler */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#854D27]">Yasal Bilgiler</h3>
            <ul className="text-[#854D27] text-sm space-y-2">
              <li>
                <Link href="/kvkk" className="hover:text-[#854D27]/80 transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="hover:text-[#854D27]/80 transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/legal/mesafeli" className="hover:text-[#854D27]/80 transition-colors">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#854D27]/30 mt-10 pt-8 text-center text-[#854D27] text-sm">
          <p>&copy; {new Date().getFullYear()} TuruYakala. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}