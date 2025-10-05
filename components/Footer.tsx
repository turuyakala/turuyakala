import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#563C5C] text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Slogan */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-bold font-montserrat mb-2">TuruYakala</h3>
            <p className="text-gray-300 text-lg mb-6">
              Son dakikada, en doğru fırsatla!
            </p>
            
            {/* Sosyal Medya İkonları */}
            <div className="flex gap-4 mb-6">
              <a 
                href="https://instagram.com/lastminutetours" 
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
                href="https://facebook.com/lastminutetours" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Facebook"
              >
                <img 
                  src="/images/social/facebook.svg" 
                  alt="Facebook" 
                  className="w-6 h-6"
                />
              </a>
              <a 
                href="https://twitter.com/lastminutetours" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Twitter"
              >
                <img 
                  src="/images/social/twitter.svg" 
                  alt="Twitter" 
                  className="w-6 h-6"
                />
              </a>
            </div>
          </div>

          {/* Bilgi Sayfaları */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Bilgi</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>
                <Link href="/hakkimizda" className="hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-white transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Yasal Bilgiler */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Yasal Bilgiler</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>
                <Link href="/kvkk" className="hover:text-white transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/gizlilik-politikasi" className="hover:text-white transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/legal/mesafeli" className="hover:text-white transition-colors">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} TuruYakala. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}