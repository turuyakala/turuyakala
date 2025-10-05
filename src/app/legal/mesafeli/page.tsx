import Link from 'next/link';

export default function MesafeliPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#563C5C] text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-white hover:text-white/80 mb-3">
            ← Ana Sayfaya Dön
          </Link>
          <h1 className="text-3xl font-bold">Mesafeli Satış Sözleşmesi</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">MESAFELİ SATIŞ SÖZLEŞMESİ</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Taraflar</h2>
                <p className="text-gray-700 leading-relaxed">
                  Bu Mesafeli Satış Sözleşmesi ("Sözleşme"), <strong className="text-[#563C5C]">LastMinuteTour</strong> internet sitesi 
                  ("Platform") üzerinden hizmet sağlayan tedarikçi firma ile ("Satıcı") bu hizmeti satın alan kullanıcı 
                  ("Alıcı") arasında, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği 
                  hükümlerine uygun olarak düzenlenmiştir.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong className="text-[#563C5C]">LastMinuteTour</strong>, yalnızca aracı platformdur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Sözleşmenin Konusu</h2>
                <p className="text-gray-700 leading-relaxed">
                  Bu sözleşme, Alıcı'nın Platform üzerinden Satıcı'ya ait tur/hizmet/ulaşım bileti satın almasıyla 
                  ilgili hak ve yükümlülüklerin belirlenmesini kapsar.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Satıcı Bilgileri</h2>
                <ul className="text-gray-700 leading-relaxed space-y-2">
                  <li>• Satıcı bilgileri, her tur sayfasında açıkça belirtilir.</li>
                  <li>• Her satış, ilgili tedarikçi (TÜRSAB kayıtlı firma) tarafından gerçekleştirilmektedir.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Alıcı Bilgileri</h2>
                <p className="text-gray-700 leading-relaxed">
                  Alıcı, üyelik veya rezervasyon formunda belirttiği iletişim bilgileri üzerinden tanımlanır.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Ürün ve Hizmet Bilgileri</h2>
                <ul className="text-gray-700 leading-relaxed space-y-2">
                  <li>• Hizmetin türü, süresi, kalkış ve varış noktaları tur sayfasında belirtilmiştir.</li>
                  <li>• Fiyat, vergiler dâhil olmak üzere açıkça gösterilir.</li>
                  <li>• Rezervasyon onayı sonrası kullanıcıya e-posta veya SMS ile bilgi gönderilir.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Ödeme ve Faturalandırma</h2>
                <ul className="text-gray-700 leading-relaxed space-y-2">
                  <li>• Ödemeler ilgili tedarikçi firmanın sisteminde gerçekleşir.</li>
                  <li>• <strong className="text-[#563C5C]">LastMinuteTour</strong> bu süreçte yalnızca yönlendirme yapar.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cayma Hakkı</h2>
                <ul className="text-gray-700 leading-relaxed space-y-2">
                  <li>• Tüketici, hizmetin başlamasından en az 24 saat öncesine kadar cayma hakkını kullanabilir.</li>
                  <li>• Ancak bazı turlar "iade edilemez" olarak işaretlenmiş olabilir. Bu bilgi tur sayfasında açıkça yer alır.</li>
            </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. İptal, İade ve Değişiklik</h2>
                <p className="text-gray-700 leading-relaxed">
                  İptal son dakika turlarında mümkün değildir.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Veri Koruma</h2>
                <p className="text-gray-700 leading-relaxed">
                  Kullanıcı bilgileri KVKK ve Gizlilik Politikası kapsamında korunur.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Uyuşmazlık Çözümü</h2>
                <p className="text-gray-700 leading-relaxed">
                  Bu sözleşmeden doğacak uyuşmazlıklarda Alıcı, ikamet ettiği yerdeki Tüketici Hakem Heyeti 
                  veya Tüketici Mahkemesi'ne başvurabilir.
                </p>
              </section>

              <div className="border-t border-gray-200 pt-8 mt-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-[#563C5C] mb-2">LastMinuteTour</h3>
                  <p className="text-gray-700 mb-2">
                    TÜRSAB'a kayıtlı acentelerle iş birliği yapan aracı platform.
                  </p>
                  <p className="text-gray-700">
                    <strong>E-posta:</strong> info@turuyakala.com<br />
                    <strong>Telefon:</strong> +90 543 629 41 26
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}