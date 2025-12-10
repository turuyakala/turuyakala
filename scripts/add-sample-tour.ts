import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Örnek tur ekleniyor...');

  // Önce bir supplier ve seller bulalım veya oluşturalım
  let supplier = await prisma.supplier.findFirst();
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: 'Kapadokya Premium Turizm',
        apiEndpoint: 'https://api.example.com',
        apiKey: 'sample-key',
      },
    });
    console.log('✅ Supplier oluşturuldu:', supplier.name);
  }

  let seller = await prisma.sellerProfile.findFirst();
  if (!seller) {
    // Önce bir seller user oluştur
    const sellerUser = await prisma.user.create({
      data: {
        email: 'seller@example.com',
        name: 'Örnek Satıcı',
        password: 'hashed-password',
        role: 'seller',
        sellerProfile: {
          create: {
            companyName: 'Örnek Tur Şirketi',
            phone: '+90 555 123 4567',
            verified: true,
          },
        },
      },
      include: {
        sellerProfile: true,
      },
    });
    seller = sellerUser.sellerProfile!;
    console.log('✅ Seller oluşturuldu:', seller.companyName);
  }

  // Gelecek 48 saat içinde bir tarih oluştur
  const startDate = new Date();
  startDate.setHours(startDate.getHours() + 48);

  // Örnek tur oluştur
  const sampleTour = await prisma.inventoryItem.create({
    data: {
      category: 'tour',
      title: 'Kapadokya Balon Turu - Son Dakika Fırsatı',
      from: 'İstanbul',
      to: 'Kapadokya',
      startAt: startDate,
      seatsTotal: 20,
      seatsLeft: 5,
      priceMinor: 350000, // 3500 TRY (indirimli fiyat)
      originalPriceMinor: 500000, // 5000 TRY (asıl fiyat)
      discountPercentage: 30, // %30 indirim
      currency: 'TRY',
      sellerId: seller.id,
      supplierId: supplier.id,
      transport: 'Uçak + Transfer',
      image: '/images/hero-1.jpg',
      images: JSON.stringify([
        '/images/hero-1.jpg',
        '/images/hero-2.jpg',
        '/images/hero-3.jpg',
      ]),
      description: `Kapadokya'nın eşsiz peri bacalarını havadan keşfetmek için muhteşem bir fırsat! Gün doğumu ile birlikte gökyüzüne yükselin ve bu büyülü deneyimi yaşayın. Profesyonel pilotlar eşliğinde güvenli bir şekilde uçun ve unutulmaz anılar biriktirin.

Kapadokya bölgesi, Türkiye'nin en önemli turizm merkezlerinden biridir. Peri bacaları, yeraltı şehirleri ve eşsiz manzaraları ile dünya çapında ünlüdür. Bu tur sayesinde bu büyülü bölgeyi havadan görme şansı yakalayacaksınız.`,
      program: JSON.stringify([
        'Sabah 05:30 - Otel transferi',
        'Sabah 06:00 - Balon kalkış alanına varış, kahvaltı ikramı',
        'Sabah 06:30 - Balon şişirme gösterisi ve güvenlik briefingi',
        'Sabah 07:00 - Balon kalkışı (yaklaşık 1 saat sürecek)',
        'Sabah 08:00 - Balon inişi ve şampanya töreni',
        'Sabah 08:30 - Uçuş sertifikası dağıtımı',
        'Sabah 09:00 - Otele dönüş',
      ]),
      included: JSON.stringify([
        'Otel karşılama ve transfer hizmeti',
        'Profesyonel pilot eşliğinde balon turu',
        'Uçuş öncesi kahvaltı ikramı',
        'Uçuş sonrası şampanya töreni',
        'Uçuş sertifikası',
        'Uçuş sigortası',
        'Tüm güvenlik ekipmanları',
      ]),
      excluded: JSON.stringify([
        'Kişisel harcamalar',
        'Uçak bileti (İstanbul-Kayseri)',
        'Ekstra içecekler',
        'Fotoğraf ve video çekimi (opsiyonel)',
        'Öğle yemeği',
      ]),
      importantInfo: JSON.stringify([
        'Hava koşulları uygun değilse tur iptal edilebilir',
        'Hamile kadınlar ve 6 yaşından küçük çocuklar katılamaz',
        'Balon kapasitesi maksimum 20 kişidir',
        'Rahat kıyafet ve spor ayakkabı önerilir',
        'Uçuş süresi hava koşullarına göre değişebilir',
        'Pasaport gerekli değildir',
      ]),
      departureLocation: JSON.stringify({
        address: 'Kapadokya Balon Kalkış Alanı, Göreme, Nevşehir',
        lat: 38.6431,
        lng: 34.8286,
      }),
      destinationLocation: JSON.stringify({
        address: 'Göreme Açık Hava Müzesi, Göreme, Nevşehir',
        lat: 38.6425,
        lng: 34.8361,
      }),
      contact: JSON.stringify({
        phone: '+90 555 123 4567',
        whatsapp: '905551234567',
      }),
      terms: 'Kalkıştan 24 saat önce iptal edilirse %80 iade. Sonrasında iade yok.',
      languages: JSON.stringify(['Türkçe', 'İngilizce']),
      paymentMethods: JSON.stringify(['Nakit', 'Kredi Kartı', 'Banka Transferi']),
      tourCompanyInfo: JSON.stringify({
        name: 'Kapadokya Premium Turizm',
        phone: '+90 555 123 4567',
        email: 'info@kapadokyaturizm.com',
        address: 'Göreme, Nevşehir, Türkiye',
        website: 'https://www.kapadokyaturizm.com',
        description: 'Kapadokya bölgesinde 15 yıllık deneyime sahip profesyonel tur operatörü.',
      }),
      isSurprise: false,
      requiresVisa: false,
      requiresPassport: false,
      status: 'active',
    },
  });

  console.log('✅ Örnek tur başarıyla eklendi!');
  console.log('   Tur ID:', sampleTour.id);
  console.log('   Tur Başlığı:', sampleTour.title);
  console.log('   Fiyat:', sampleTour.priceMinor / 100, 'TRY');
  console.log('   Asıl Fiyat:', sampleTour.originalPriceMinor ? sampleTour.originalPriceMinor / 100 : 'Yok', 'TRY');
  console.log('   İndirim Oranı:', sampleTour.discountPercentage ? `%${sampleTour.discountPercentage}` : 'Yok');
  console.log('   Tur Detay Sayfası: http://localhost:3000/item/' + sampleTour.id);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


