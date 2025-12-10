import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-primary mb-6">KVKK Aydınlatma Metni</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-primary leading-relaxed mb-6">
              <strong className="text-secondary">TuruYakala</strong> olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu 
              ("KVKK") kapsamında kişisel verilerinizin işlenmesi konusunda aydınlatma metnimiz aşağıda yer almaktadır.
            </p>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">1. Veri Sorumlusu</h2>
            <p className="text-primary leading-relaxed mb-6">
              TuruYakala A.Ş., kişisel verilerinizin veri sorumlusu olarak, kişisel verilerinizi 
              KVKK ve ilgili mevzuat hükümlerine uygun şekilde işlemektedir.
            </p>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">2. İşlenen Kişisel Veriler</h2>
            <p className="text-primary leading-relaxed mb-4">Tarafımızca işlenen kişisel verileriniz:</p>
            <ul className="text-primary leading-relaxed space-y-2 mb-6">
              <li>• Kimlik bilgileri (ad, soyad, TC kimlik numarası)</li>
              <li>• İletişim bilgileri (telefon, e-posta)</li>
              <li>• Rezervasyon bilgileri</li>
              <li>• Ödeme bilgileri (güvenli ödeme sistemleri üzerinden)</li>
              <li>• Web sitesi kullanım verileri (çerezler dahil)</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">3. Kişisel Verilerin İşlenme Amaçları</h2>
            <ul className="text-primary leading-relaxed space-y-2 mb-6">
              <li>• Tur rezervasyonlarının yapılması ve yönetilmesi</li>
              <li>• Müşteri hizmetlerinin sunulması</li>
              <li>• Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>• Pazarlama ve iletişim faaliyetleri</li>
              <li>• Web sitesi performansının iyileştirilmesi</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">4. Haklarınız</h2>
            <p className="text-primary leading-relaxed mb-4">
              KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="text-primary leading-relaxed space-y-2 mb-6">
              <li>• Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>• İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
              <li>• Kişisel verilerinizin işlenme amacını öğrenme</li>
              <li>• Kişisel verilerinizin silinmesini veya yok edilmesini talep etme</li>
              <li>• Kişisel verilerinizin düzeltilmesini talep etme</li>
            </ul>

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8">5. İletişim</h2>
            <p className="text-primary leading-relaxed mb-6">
              KVKK kapsamındaki taleplerinizi aşağıdaki iletişim bilgileri üzerinden iletebilirsiniz:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-primary">
                <strong>E-posta:</strong> info@turuyakala.com<br />
                <strong>Telefon:</strong> +90 505 408 29 29
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
