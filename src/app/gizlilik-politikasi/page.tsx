import Link from 'next/link';

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#563C5C] shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-white hover:text-white/80 font-semibold transition-colors"
            >
              ← Ana Sayfaya Dön
            </Link>
            <h1 className="text-xl font-bold font-montserrat text-white hidden md:block">
              TuruYakala
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Gizlilik Politikası</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>TuruYakala</strong> olarak, gizliliğinize saygı duyuyor ve kişisel verilerinizin 
              güvenliğini sağlamak için gerekli önlemleri alıyoruz.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">1. Bilgi Toplama</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Web sitemizi kullanırken, hizmetlerimizden yararlanırken veya bizimle iletişim kurduğunuzda 
              belirli kişisel bilgilerinizi toplayabiliriz. Bu bilgiler şunları içerebilir:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2 mb-6">
              <li>• Ad, soyad ve iletişim bilgileri</li>
              <li>• Rezervasyon ve seyahat tercihleri</li>
              <li>• Web sitesi kullanım verileri</li>
              <li>• Çerez bilgileri</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Bilgi Kullanımı</h2>
            <p className="text-gray-700 leading-relaxed mb-4">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
            <ul className="text-gray-700 leading-relaxed space-y-2 mb-6">
              <li>• Hizmetlerimizi sunmak ve iyileştirmek</li>
              <li>• Rezervasyonlarınızı işlemek</li>
              <li>• Müşteri desteği sağlamak</li>
              <li>• Yasal yükümlülüklerimizi yerine getirmek</li>
              <li>• Pazarlama ve iletişim faaliyetleri</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Bilgi Paylaşımı</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Kişisel bilgilerinizi, yasal zorunluluklar dışında üçüncü taraflarla paylaşmayız. 
              Rezervasyonlarınız için gerekli olan durumlarda, sadece tedarikçilerimizle gerekli 
              bilgileri paylaşırız.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Veri Güvenliği</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Kişisel verilerinizi korumak için uygun teknik ve idari güvenlik önlemleri alırız. 
              SSL şifreleme, güvenli ödeme sistemleri ve düzenli güvenlik denetimleri kullanırız.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Çerezler</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Web sitemizde deneyiminizi iyileştirmek için çerezler kullanırız. Bu çerezler 
              zorunlu çerezler, performans çerezleri ve pazarlama çerezleri olarak sınıflandırılır. 
              Çerez ayarlarınızı tarayıcınızdan yönetebilirsiniz.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Değişiklikler</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler 
              durumunda size bildirim göndereceğiz.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. İletişim</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Gizlilik politikamız hakkında sorularınız için bize ulaşabilirsiniz:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>E-posta:</strong> info@turuyakala.com<br />
                <strong>Telefon:</strong> +90 543 629 41 26
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
