import Link from 'next/link';

export default function SSSPage() {
  const faqs = [
    {
      question: "TuruYakala nedir?",
      answer: "TuruYakala, TÜRSAB'a kayıtlı turizm acentelerinin son dakika fırsatlarını tek bir platformda toplayan aracı bir sistemdir. Amacımız, boş kalan koltukların değerlendirilmesini ve kullanıcıların avantajlı fiyatlarla seyahat etmesini sağlamaktır."
    },
    {
      question: "Tur düzenleyen siz misiniz?",
      answer: "Hayır. Biz tur düzenlemiyoruz; yalnızca yasal acentelerin ilanlarını yayınlıyor ve kullanıcıyla buluşturuyoruz."
    },
    {
      question: "Fırsatlar ne kadar güncel?",
      answer: "Tüm fırsatlar sistemimizde son 72 saat içinde güncellenmektedir. Kalan koltuk sayısı gerçek zamanlı olarak tedarikçilerden çekilmektedir."
    },
    {
      question: "Ödeme işlemleri nasıl yapılıyor?",
      answer: "Satın alma işlemleri, ilgili tedarikçi firmanın güvenli ödeme sayfası üzerinden gerçekleşir. TuruYakala yalnızca yönlendirme sağlar."
    },
    {
      question: "İptal ve iade koşulları nasıl işler?",
      answer: "Her turun iptal/iade politikası tedarikçi firmaya göre değişir. Detayları tur sayfasındaki \"Koşullar\" alanında bulabilirsiniz."
    },
    {
      question: "Üye olmadan tur satın alabilir miyim?",
      answer: "Evet, bazı tedarikçiler için mümkündür. Ancak üyelik açarsanız fırsat geçmişinizi ve rezervasyon durumlarınızı görebilirsiniz."
    },
    {
      question: "Komisyon ödüyor muyum?",
      answer: "Hayır, sizden ek ücret alınmaz. Komisyon, tedarikçi firma tarafından ödenir."
    },
    {
      question: "Kişisel bilgilerim güvende mi?",
      answer: "Evet. KVKK kapsamında verileriniz şifreli olarak saklanır ve 3. kişilerle paylaşılmaz."
    },
    {
      question: "Yurt dışı turlarda vize işlemleri kime ait?",
      answer: "Vize işlemleri ilgili tedarikçi tarafından yürütülür. Gerekli belgeler tur açıklamasında belirtilir."
    },
    {
      question: "Tur kalkmazsa ne olur?",
      answer: "Tedarikçi firmadan alınan bilgi doğrultusunda kullanıcıya ücret iadesi yapılır veya alternatif bir tarih sunulur."
    },
    {
      question: "Tur yorumlarını kimler yazabilir?",
      answer: "Yalnızca o turu satın almış üyeler yorum yapabilir. Böylece sahte yorumlar engellenir."
    },
    {
      question: "Fırsatlar ne zaman güncelleniyor?",
      answer: "Sistemimiz her saat başı bir yeni fırsatları kontrol eder. Bu yüzden sık sık siteyi ziyaret etmeniz önerilir."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#E7E393] shadow-sm sticky top-0 z-40">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Sıkça Sorulan Sorular</h1>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h2 className="text-xl font-semibold text-[#E7E393] mb-3">
                  {faq.question}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sorunuzun cevabını bulamadınız mı?
            </h3>
            <p className="text-gray-700 mb-4">
              İletişim sayfamızdan bize ulaşın, size yardımcı olmaktan mutluluk duyarız.
            </p>
            <Link
              href="/iletisim"
              className="inline-block px-6 py-2 bg-[#E7E393] text-white rounded-lg hover:bg-[#E7E393]/90 transition-colors"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
