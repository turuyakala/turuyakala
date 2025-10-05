import Link from 'next/link';

export default function HakkimizdaPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Hakkımızda</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong className="text-[#563C5C]">TuruYakala</strong>, seyahat tutkunlarını 
              avantajlı fırsatlarla buluşturmak için kurulmuş yenilikçi bir platformdur.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Amacımız, turizm firmalarının boş kalan koltuklarını değerlendirmesini sağlamak 
              ve kullanıcılarımıza son dakikada bile uygun fiyatlarla seyahat etme imkânı sunmaktır.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Biz Kimiz?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Biz bir seyahat acentesi değiliz; TÜRSAB'a kayıtlı acentelerin son dakika 
              fırsatlarını tek çatı altında toplayan bağımsız bir aracı sistemiz.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Yani sitemizde gördüğünüz her tur, yasal ve kayıtlı tedarikçi firmalar 
              tarafından düzenlenmektedir.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Sorun ve Çözümümüz</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Her gün binlerce kişi uygun fiyatlı bir tatil fırsatını kaçırıyor çünkü 
              turların son koltukları genellikle boş kalıyor. Biz bu sorunu çözmek için varız.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              Kullanıcılarımız birkaç tıklamayla, en güncel son dakika fırsatlarına ulaşabiliyor.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Neden Bizi Tercih Etmelisiniz?</h2>
            <ul className="text-gray-700 leading-relaxed space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-[#563C5C] font-bold">✅</span>
                <span>Gerçek zamanlı güncellenen fırsatlar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#563C5C] font-bold">✅</span>
                <span>Güvenilir acentelerle çalışıyoruz</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#563C5C] font-bold">✅</span>
                <span>Kolay filtreleme ve hızlı rezervasyon</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#563C5C] font-bold">✅</span>
                <span>Aracı komisyonu yok, şeffaf fiyat politikası</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#563C5C] font-bold">✅</span>
                <span>Türkiye'de ilk ve tek "son dakika fırsat" platformu</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Felsefemiz</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Biz, <strong>"boş koltuk kalmasın, kimse fırsatı kaçırmasın"</strong> anlayışıyla hareket ediyoruz.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              <strong className="text-[#563C5C]">TuruYakala</strong>, seyahatin son dakikasına kadar 
              fırsatın var olduğunu hatırlatır.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
