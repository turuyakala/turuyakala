import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function SSSPage() {
  const faqs = [
    {
      id: 1,
      question: "Turu Yakala Nedir?",
      answer: "Turu Yakala, TÜRSAB'a kayıtlı turizm acentelerinin son dakika fırsatlarını tek bir platformda toplayan aracı bir sistemdir. Amacımız, boş kalan koltukların değerlendirilmesini ve kullanıcıların avantajlı fiyatlarla seyahat etmesini sağlamaktır."
    },
    {
      id: 2,
      question: "Tur düzenleyen siz misiniz?",
      answer: "Hayır. Biz tur düzenlemiyoruz; yalnızca yasal acentelerin ilanlarını yayınlıyor ve kullanıcıyla buluşturuyoruz."
    },
    {
      id: 3,
      question: "Tur fiyatları neden bu kadar indirimli?",
      answer: "Turu Yakala yalnızca tedarikçi acentelerin son kalan koltuklarını yayınlar.\n\nTedarikçiler, boş koltukların hiç satılmamasındansa düşük fiyata da olsa dolmasını tercih ettikleri için indirim uygulanır."
    },
    {
      id: 4,
      question: "Son dakika tur satın almak güvenli mi?",
      answer: "Evet. Turu Yakala'da yalnızca TÜRSAB'a kayıtlı ve yasal olarak faaliyet gösteren acentelerin turları yayınlanır."
    },
    {
      id: 5,
      question: "Fırsatlar ne kadar güncel?",
      answer: "Tüm fırsatlar sistemimizde son 72 saat içinde güncellenmektedir. Kalan koltuk sayısı gerçek zamanlı olarak tedarikçilerden çekilmektedir."
    },
    {
      id: 6,
      question: "Ödeme işlemleri nasıl yapılıyor?",
      answer: "Satın alma işlemleri, ilgili tedarikçi firmanın güvenli ödeme sayfası üzerinden gerçekleşir. Turu Yakala yalnızca yönlendirme sağlar."
    },
    {
      id: 7,
      question: "İptal ve iade koşulları nasıl işler?",
      answer: "Turu Yakala üzerinden satın alınan tüm turlar, tur tedarikçileri tarafından \"Son Dakika – Son Koltuk\" statüsünde satışa sunulur.\n\nBu kategoride sunulan koltuklar özel fiyatlandırmaya tabi olduğu ve tedarikçi tarafından anında kesin rezervasyon olarak işlendiği için, satın alma işlemi tamamlandıktan sonra:\n\n• İptal yapılamaz\n• İade yapılamaz\n• Tarih veya katılımcı değişikliği yapılamaz\n\nRezervasyon işlemi ödeme anında kesinleşir ve tedarikçiye otomatik olarak aktarılır."
    },
    {
      id: 8,
      question: "Tur programı değişir mi?",
      answer: "Tur programları tamamen tedarikçi firmaya aittir. Program değişikliği olduğunda bilgi doğrudan kullanıcıya iletilir."
    },
    {
      id: 9,
      question: "Uçak bileti fiyatına dahil mi?",
      answer: "Bu bilgi, tur ilanının açıklama kısmında açıkça belirtilir.\n\nHer turda içerikler değişebilir — bazıları uçaklı, bazıları karadan ulaşım ile olabilir."
    },
    {
      id: 10,
      question: "Yeme içme, müze girişleri, ekstra harcamalar dahil mi?",
      answer: "Dahil/değil kısmı tur sayfasında detaylı şekilde listelenir."
    },
    {
      id: 11,
      question: "Satın aldıktan sonra bilgilerimi nasıl göreceğim?",
      answer: "Üyeliğiniz varsa, \"Hesabım\" bölümünden tüm satın alımlarınızı, rezervasyon durumunuzu ve tur detaylarınızı görebilirsiniz."
    },
    {
      id: 12,
      question: "Satın alma işlemi sırasında hata oluşursa ne yapmalıyım?",
      answer: "Ödeme sırasında bağlantı sorunu veya hata oluşursa, destek ekibimizle iletişime geçebilirsiniz."
    },
    {
      id: 13,
      question: "Üye olmadan tur satın alabilir miyim?",
      answer: "Evet, bilgilerinizi tek tek girerek satın alma işlemini uygulamanız mümkün. Ancak üyelik oluşturursanız bir sonraki satın alımınızda bilgilerinizi tekrar girmenize gerek kalmayarak bir profil oluşturabilir, geçmiş turlarınızı ve rezervasyon durumlarınızı görebilirsiniz."
    },
    {
      id: 14,
      question: "Komisyon ödüyor muyum?",
      answer: "Hayır, sizden ek ücret alınmaz."
    },
    {
      id: 15,
      question: "Kişisel bilgilerim güvende mi?",
      answer: "Evet. KVKK kapsamında verileriniz şifreli olarak saklanır ve 3. kişilerle asla paylaşılmaz."
    },
    {
      id: 16,
      question: "Yurt dışı turlarda vize işlemleri kime ait?",
      answer: "Vize işlemleri ilgili tedarikçi tarafından yürütülür. Gerekli belgeler tur açıklamasında belirtilir."
    },
    {
      id: 17,
      question: "Tur kalkmazsa ne olur?",
      answer: "Tedarikçi firmadan alınan bilgi doğrultusunda kullanıcıya ücret iadesi yapılır veya alternatif bir tarih sunulur."
    },
    {
      id: 18,
      question: "Tur yorumlarını kimler yazabilir?",
      answer: "Yalnızca o turu satın almış üyeler yorum yapabilir. Böylece sahte yorumlar engellenir."
    },
    {
      id: 19,
      question: "Fırsatlar ne zaman güncelleniyor?",
      answer: "Sistemimiz her saat başı bir yeni fırsatları kontrol eder. Bu yüzden sık sık siteyi ziyaret etmeniz önerilir."
    },
    {
      id: 20,
      question: "Tur dolmuşsa ne oluyor?",
      answer: "Koltuk sayısı gerçek zamanlı güncellendiği için, son kalan koltuk bir başka kullanıcı tarafından satın alındıysa sistem otomatik olarak \"Tükendi\" ibaresini gösterir."
    },
    {
      id: 21,
      question: "Faturayı kim kesiyor?",
      answer: "Faturayı doğrudan TuruYakala keser.\n\nTedarikçi ile müşteri arasında herhangi bir ticari ilişki bulunmaz."
    },
    {
      id: 22,
      question: "Kredi kartım neden onaylanmadı?",
      answer: "Banka sınırlamaları\nYetersiz bakiye\n3D Secure doğrulaması\nGünlük harcama limiti\n\ngibi nedenlerle ödeme başarısız olabilir."
    },
    {
      id: 23,
      question: "Turda sorun yaşarsam kimi arayacağım?",
      answer: "Tur boyunca tüm iletişim, acil durum ve operasyon desteği Turu Yakala Destek Hattı üzerinden sağlanabilir."
    },
    {
      id: 24,
      question: "Toplu rezervasyon yapabilir miyim?",
      answer: "Evet. Kalan koltuk sayısı yeterliyse birden fazla kişi için rezervasyon yapabilirsiniz."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-secondary mb-8 text-center">Sıkça Sorulan Sorular</h1>
          
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h2 className="text-xl font-bold text-primary mb-3">
                  {faq.id}) {faq.question}
                </h2>
                <div className="text-primary leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
            <h3 className="text-xl font-semibold text-primary mb-3 text-center">
              Sorunuzun cevabını bulamadınız mı?
            </h3>
            <p className="text-primary mb-6 text-center">
              İletişim sayfamızdan bize ulaşın, size yardımcı olmaktan mutluluk duyarız.
            </p>
            <div className="flex justify-center">
              <Link
                href="/iletisim"
                className="inline-block px-8 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                İletişime Geç
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
