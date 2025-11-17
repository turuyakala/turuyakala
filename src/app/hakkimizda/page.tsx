import Navigation from '@/components/Navigation';
import HeroSlider from '@/components/HeroSlider';

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-background rounded-lg shadow-md p-8">
          {/* Başlıklar */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">Hakkımızda</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Kaçıran Değil, Yakalayanlardan Olanların Adresi
            </h2>
            <p className="text-xl md:text-2xl font-semibold text-secondary mb-8">
              Turu Yakala
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-primary leading-relaxed mb-6">
              <strong className="text-primary">Turu Yakala</strong>, seyahat tutkunlarını 
              avantajlı fırsatlarla buluşturmak için kurulmuş yenilikçi bir platformdur.
            </p>

            <p className="text-primary leading-relaxed mb-6">
              Amacımız, turizm firmalarının boş kalan koltuklarını değerlendirmesini sağlamak 
              ve kullanıcılarımıza son dakikada bile uygun fiyatlarla seyahat etme imkânı sunmaktır.
            </p>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Biz Kimiz?</h2>
            <p className="text-primary leading-relaxed mb-6">
              Biz bir seyahat acentesi değiliz; TÜRSAB'a kayıtlı acentelerin son dakika 
              fırsatlarını tek çatı altında toplayan bağımsız bir aracı sistemiz.
            </p>

            <p className="text-primary leading-relaxed mb-6">
              Yani sitemizde gördüğünüz her tur, yasal ve kayıtlı tedarikçi firmalar 
              tarafından düzenlenmektedir.
            </p>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Sorun ve Çözümümüz</h2>
            <p className="text-primary leading-relaxed mb-6">
              Her gün binlerce kişi uygun fiyatlı bir tatil fırsatını kaçırıyor çünkü 
              turların son koltukları genellikle boş kalıyor. Biz bu sorunu çözmek için varız.
            </p>

            <p className="text-primary leading-relaxed mb-6">
              Kullanıcılarımız birkaç tıklamayla, en güncel son dakika fırsatlarına ulaşabiliyor.
            </p>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Neden Bizi Tercih Etmelisiniz?</h2>
            <ul className="text-primary leading-relaxed space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Gerçek zamanlı güncellenen fırsatlar</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Güvenilir acentelerle çalışıyoruz</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Kolay filtreleme ve hızlı rezervasyon</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Aracı komisyonu yok, şeffaf fiyat politikası</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Türkiye'de ilk ve tek "son dakika fırsat" platformu</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">Felsefemiz</h2>
            <p className="text-primary leading-relaxed mb-6">
              Biz, <strong>"boş koltuk kalmasın, kimse fırsatı kaçırmasın"</strong> anlayışıyla hareket ediyoruz.
            </p>

            <p className="text-primary leading-relaxed mb-6">
              <strong className="text-primary">Turu Yakala</strong>, seyahatin son dakikasına kadar 
              fırsatın var olduğunu hatırlatır.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
