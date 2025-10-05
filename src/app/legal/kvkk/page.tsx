import Link from 'next/link';

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-[#563C5C] hover:text-[#563C5C]/80 mb-3">
            ← Ana Sayfaya Dön
          </Link>
          <h1 className="text-3xl font-bold">KVKK Aydınlatma Metni</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Kişisel Verilerin Korunması</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, LastMinuteTour 
              olarak kişisel verilerinizin güvenliği konusunda azami hassasiyeti göstermekteyiz.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Veri Sorumlusu</h3>
            <p>
              [Şirket Adı]<br />
              E-posta: info@turuyakala.com
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Toplanan Kişisel Veriler</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Ad, soyad</li>
              <li>E-posta adresi</li>
              <li>Telefon numarası</li>
              <li>Rezervasyon bilgileri</li>
              <li>İşlem geçmişi</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Verilerin İşlenme Amacı</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Rezervasyon işlemlerinin gerçekleştirilmesi</li>
              <li>Müşteri hizmetlerinin sağlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>İletişim faaliyetlerinin yürütülmesi</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Haklarınız</h3>
            <p>KVKK Kanunu kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Kişisel verilerin yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
              <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm">
                <strong>Not:</strong> Bu metin örnek amaçlı hazırlanmıştır. Gerçek bir uygulamada 
                hukuk danışmanınızla birlikte detaylı bir KVKK Aydınlatma Metni hazırlanmalıdır.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

