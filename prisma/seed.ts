import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user (change email and password as needed)
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@turuyakala.com' },
    update: {},
    create: {
      email: 'admin@turuyakala.com',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Create test users
  const userPassword = await bcrypt.hash('Test123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@turuyakala.com' },
    update: {},
    create: {
      email: 'test@turuyakala.com',
      name: 'Test User',
      password: userPassword,
      role: 'user',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@turuyakala.com' },
    update: {},
    create: {
      email: 'seller@turuyakala.com',
      name: 'Test Seller',
      password: userPassword,
      role: 'seller',
      sellerProfile: {
        create: {
          companyName: 'Örnek Tur Şirketi',
          phone: '+90 555 123 4567',
          verified: true,
        },
      },
    },
  });

  console.log('✅ Created users:');
  console.log('   👑 Admin:', admin.email, '(password: Admin123!)');
  console.log('   👤 User:', user.email, '(password: Test123!)');
  console.log('   🏢 Seller:', seller.email, '(password: Test123!)');

  // Create suppliers
  console.log('\n🔌 Creating suppliers...');
  
  const supplier1 = await prisma.supplier.upsert({
    where: { name: 'TourVision Travel' },
    update: {},
    create: {
      name: 'TourVision Travel',
      description: 'Premium tur ve tatil paketleri',
      integrationMode: 'pull',
      apiUrl: 'https://api.tourvision.com/v1/offers',
      isActive: true,
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { name: 'QuickTrip Agency' },
    update: {},
    create: {
      name: 'QuickTrip Agency',
      description: 'Son dakika uçak ve otobüs biletleri',
      integrationMode: 'pull',
      apiUrl: 'https://api.quicktrip.com/offers',
      isActive: true,
    },
  });

  const supplier3 = await prisma.supplier.upsert({
    where: { name: 'DreamVacations' },
    update: {},
    create: {
      name: 'DreamVacations',
      description: 'Lüks tatil ve cruise turları',
      integrationMode: 'pull',
      apiUrl: 'https://api.dreamvacations.com/api/offers',
      isActive: true,
    },
  });

  console.log('✅ Created suppliers:', supplier1.name, supplier2.name, supplier3.name);

  // Create sample offers (24-72 hours from now)
  console.log('\n🎫 Creating sample offers...');
  
  const now = new Date();
  const hoursFromNow = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);

  // Offer 1: Kapadokya Tour (48 hours, surprise tour)
  const offer1 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'TOUR-KAPA-001',
        supplierId: supplier1.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier1.id,
      vendorOfferId: 'TOUR-KAPA-001',
      category: 'tour',
      title: 'Kapadokya Balon Turu - Sürpriz Paket',
      from: 'İstanbul',
      to: 'Kapadokya',
      startAt: hoursFromNow(48),
      seatsTotal: 20,
      seatsLeft: 3,
      priceMinor: 1000000, // 10000 TRY
      currency: 'TRY',
      image: '/images/hero-1.jpg',
      terms: 'Kalkıştan 24 saat önce iptal edilirse %80 iade. Sonrasında iade yok.',
      transport: 'Uçak + Transfer',
      isSurprise: true,
      requiresPassport: true,
      rawJson: JSON.stringify({ type: 'surprise_tour', destination: 'hidden' }),
      status: 'active',
    },
  });

  // Offer 2: İstanbul-Antalya Flight (30 hours)
  const offer2 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'FLT-IST-AYT-2024',
        supplierId: supplier2.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier2.id,
      vendorOfferId: 'FLT-IST-AYT-2024',
      category: 'flight',
      title: 'İstanbul → Antalya Direkt Uçuş',
      from: 'İstanbul (IST)',
      to: 'Antalya (AYT)',
      startAt: hoursFromNow(30),
      seatsTotal: 180,
      seatsLeft: 12,
      priceMinor: 45000, // 450 TRY
      currency: 'TRY',
      image: '/images/hero-2.jpg',
      terms: 'Son dakika bileti - İade ve değişiklik yapılamaz.',
      rawJson: JSON.stringify({ flight_number: 'TK123', aircraft: 'A320' }),
      status: 'active',
    },
  });

  // Offer 3: Bodrum Cruise (60 hours, surprise)
  const offer3 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'CRUSE-BOD-001',
        supplierId: supplier3.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier3.id,
      vendorOfferId: 'CRUSE-BOD-001',
      category: 'tour',
      title: 'Akdeniz Cruise Turu - Sürpriz Rota',
      from: 'Bodrum',
      to: 'Gizli Destinasyon',
      startAt: hoursFromNow(60),
      seatsTotal: 50,
      seatsLeft: 8,
      priceMinor: 1000000, // 10000 TRY
      currency: 'TRY',
      image: '/images/hero-3.jpg',
      terms: '3 gece 4 gün - Tam pansiyon dahil.',
      transport: 'Lüks Cruise Gemisi',
      isSurprise: true,
      requiresPassport: true,
      requiresVisa: true,
      rawJson: JSON.stringify({ ship: 'MSC Fantasia', class: 'premium' }),
      status: 'active',
    },
  });

  // Offer 4: İstanbul-Ankara Bus (36 hours)
  const offer4 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'BUS-IST-ANK-456',
        supplierId: supplier2.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier2.id,
      vendorOfferId: 'BUS-IST-ANK-456',
      category: 'bus',
      title: 'İstanbul - Ankara VIP Otobüs',
      from: 'İstanbul',
      to: 'Ankara',
      startAt: hoursFromNow(36),
      seatsTotal: 45,
      seatsLeft: 5,
      priceMinor: 35000, // 350 TRY
      currency: 'TRY',
      image: '/images/hero-1.jpg',
      terms: 'Kalkıştan 6 saat önce iptal edilirse %50 iade.',
      transport: '2+1 VIP Koltuk',
      rawJson: JSON.stringify({ company: 'Metro Turizm', bus_type: 'VIP' }),
      status: 'active',
    },
  });

  // Offer 5: Pamukkale Tour (54 hours, surprise)
  const offer5 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'TOUR-PAM-999',
        supplierId: supplier1.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier1.id,
      vendorOfferId: 'TOUR-PAM-999',
      category: 'tour',
      title: 'Sürpriz Termal Tur Paketi',
      from: 'İzmir',
      to: 'Gizli Termal Bölge',
      startAt: hoursFromNow(54),
      seatsTotal: 30,
      seatsLeft: 4,
      priceMinor: 1000000, // 10000 TRY
      currency: 'TRY',
      image: '/images/hero-2.jpg',
      terms: '1 gece 2 gün - Otel ve ulaşım dahil.',
      transport: 'Otobüs ile',
      isSurprise: true,
      requiresPassport: false,
      rawJson: JSON.stringify({ includes: ['hotel', 'meals', 'guide'] }),
      status: 'active',
    },
  });

  // Offer 6: İzmir-Bodrum Flight (24 hours)
  const offer6 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'FLT-IZM-BJV-789',
        supplierId: supplier2.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier2.id,
      vendorOfferId: 'FLT-IZM-BJV-789',
      category: 'flight',
      title: 'İzmir → Bodrum Havaalanı',
      from: 'İzmir (ADB)',
      to: 'Bodrum (BJV)',
      startAt: hoursFromNow(24),
      seatsTotal: 75,
      seatsLeft: 2,
      priceMinor: 65000, // 650 TRY
      currency: 'TRY',
      image: '/images/hero-3.jpg',
      terms: 'Son 2 koltuk! İade ve değişiklik yapılamaz.',
      rawJson: JSON.stringify({ flight_number: 'PC789', duration: '45min' }),
      status: 'active',
    },
  });

  // Offer 7: Paris Tour (42 hours)
  const offer7 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'TOUR-PARIS-777',
        supplierId: supplier1.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier1.id,
      vendorOfferId: 'TOUR-PARIS-777',
      category: 'tour',
      title: 'Paris Romantik Şehir Turu',
      from: 'İstanbul',
      to: 'Paris',
      startAt: hoursFromNow(42),
      seatsTotal: 40,
      seatsLeft: 15,
      priceMinor: 1000000, // 10000 TRY
      currency: 'TRY',
      image: '/images/hero-4.jpg',
      terms: '3 gece 4 gün - Otel ve kahvaltı dahil.',
      transport: 'Uçak + Transfer',
      isSurprise: false,
      requiresPassport: true,
      rawJson: JSON.stringify({ includes: ['hotel', 'breakfast', 'guide', 'museum'] }),
      status: 'active',
    },
  });

  // Offer 8: Roma Tour (28 hours)
  const offer8 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'TOUR-ROMA-888',
        supplierId: supplier2.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier2.id,
      vendorOfferId: 'TOUR-ROMA-888',
      category: 'tour',
      title: 'Roma Antik Şehir Turu',
      from: 'İstanbul',
      to: 'Roma',
      startAt: hoursFromNow(28),
      seatsTotal: 50,
      seatsLeft: 8,
      priceMinor: 1000000, // 10000 TRY
      currency: 'TRY',
      image: '/images/hero-1.jpg',
      terms: '4 gece 5 gün - Otel ve yarım pansiyon dahil.',
      transport: 'Uçak + Transfer',
      isSurprise: false,
      requiresPassport: true,
      rawJson: JSON.stringify({ includes: ['hotel', 'meals', 'guide', 'museum'] }),
      status: 'active',
    },
  });

  // Offer 9: Antalya-Alanya Flight (50 hours)
  const offer9 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'FLT-AYT-ALN-999',
        supplierId: supplier2.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier2.id,
      vendorOfferId: 'FLT-AYT-ALN-999',
      category: 'flight',
      title: 'Antalya → Alanya Transfer Uçuşu',
      from: 'Antalya (AYT)',
      to: 'Alanya (GZP)',
      startAt: hoursFromNow(50),
      seatsTotal: 90,
      seatsLeft: 6,
      priceMinor: 85000, // 850 TRY
      currency: 'TRY',
      image: '/images/hero-2.jpg',
      terms: 'Transfer dahil - İade yapılamaz.',
      transport: 'Uçak + Transfer',
      isSurprise: false,
      requiresPassport: false,
      rawJson: JSON.stringify({ flight_number: 'PC999', includes_transfer: true }),
      status: 'active',
    },
  });

  // Offer 10: Dubai Tour (38 hours)
  const offer10 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'TOUR-DUBAI-101',
        supplierId: supplier1.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier1.id,
      vendorOfferId: 'TOUR-DUBAI-101',
      category: 'tour',
      title: 'Dubai Lüks Şehir Turu',
      from: 'İstanbul',
      to: 'Dubai',
      startAt: hoursFromNow(38),
      seatsTotal: 35,
      seatsLeft: 12,
      priceMinor: 1000000, // 10000 TRY
      currency: 'TRY',
      image: '/images/hero-3.jpg',
      terms: '3 gece 4 gün - 5 yıldızlı otel ve kahvaltı dahil.',
      transport: 'Uçak + Lüks Transfer',
      isSurprise: false,
      requiresPassport: true,
      requiresVisa: true,
      rawJson: JSON.stringify({ includes: ['hotel', 'breakfast', 'guide', 'desert_safari'] }),
      status: 'active',
    },
  });

  // Offer 11: İzmir-Çeşme Bus (32 hours)
  const offer11 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'BUS-IZM-CES-202',
        supplierId: supplier2.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier2.id,
      vendorOfferId: 'BUS-IZM-CES-202',
      category: 'bus',
      title: 'İzmir - Çeşme Plaj Turu',
      from: 'İzmir',
      to: 'Çeşme',
      startAt: hoursFromNow(32),
      seatsTotal: 25,
      seatsLeft: 3,
      priceMinor: 45000, // 450 TRY
      currency: 'TRY',
      image: '/images/hero-4.jpg',
      terms: 'Günübirlik - Plaj girişi dahil.',
      transport: 'Klimalı Minibüs',
      isSurprise: false,
      requiresPassport: false,
      rawJson: JSON.stringify({ includes: ['beach_entry', 'transfer'] }),
      status: 'active',
    },
  });

  // Offer 12: Marmaris Cruise (66 hours)
  const offer12 = await prisma.offer.upsert({
    where: {
      vendor_offer_unique: {
        vendorOfferId: 'CRUISE-MAR-303',
        supplierId: supplier3.id,
      },
    },
    update: {},
    create: {
      supplierId: supplier3.id,
      vendorOfferId: 'CRUISE-MAR-303',
      category: 'cruise',
      title: 'Marmaris - Datça - Bodrum Cruise',
      from: 'Marmaris',
      to: 'Bodrum',
      startAt: hoursFromNow(66),
      seatsTotal: 60,
      seatsLeft: 18,
      priceMinor: 420000, // 4200 TRY
      currency: 'TRY',
      image: '/images/hero-4.jpg',
      terms: '2 gece 3 gün - Tam pansiyon dahil.',
      transport: 'Lüks Yacht',
      isSurprise: false,
      requiresPassport: false,
      rawJson: JSON.stringify({ ship: 'Ocean Dream', includes: ['all_meals', 'drinks'] }),
      status: 'active',
    },
  });

  console.log('✅ Created 12 sample offers:');
  console.log('   🎁 Sürpriz Turlar: 3 adet (isSurprise: true)');
  console.log('      - Kapadokya Balon Turu - Sürpriz Paket (10.000 ₺)');
  console.log('      - Akdeniz Cruise Turu - Sürpriz Rota (10.000 ₺)');
  console.log('      - Sürpriz Termal Tur Paketi (10.000 ₺)');
  console.log('   🌍 Yurtdışı Turlar: 3 adet');
  console.log('      - Paris Romantik Şehir Turu (10.000 ₺)');
  console.log('      - Roma Antik Şehir Turu (10.000 ₺)');
  console.log('      - Dubai Lüks Şehir Turu (10.000 ₺)');
  console.log('   ✈️ Uçak Biletleri: 3 adet');
  console.log('   🚌 Otobüs Biletleri: 3 adet');
  console.log('   🚢 Cruise Turları: 2 adet');
  console.log('   ⏰ Tümü 24-72 saat arasında kalkış yapacak');
  console.log('   💰 Tüm turlar: 10.000 ₺');

  // Create sample reviews
  console.log('\n💬 Creating sample reviews...');
  
  // Create additional test users for reviews
  const user2 = await prisma.user.upsert({
    where: { email: 'ahmet.yilmaz@example.com' },
    update: {},
    create: {
      email: 'ahmet.yilmaz@example.com',
      name: 'Ahmet Yılmaz',
      password: userPassword,
      role: 'user',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'ayse.demir@example.com' },
    update: {},
    create: {
      email: 'ayse.demir@example.com',
      name: 'Ayşe Demir',
      password: userPassword,
      role: 'user',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'mehmet.kaya@example.com' },
    update: {},
    create: {
      email: 'mehmet.kaya@example.com',
      name: 'Mehmet Kaya',
      password: userPassword,
      role: 'user',
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'fatma.ozturk@example.com' },
    update: {},
    create: {
      email: 'fatma.ozturk@example.com',
      name: 'Fatma Öztürk',
      password: userPassword,
      role: 'user',
    },
  });

  // Create sample reviews directly (without orders for now)
  const review1 = await prisma.review.create({
    data: {
      userId: user.id,
      orderId: null, // No order ID for sample reviews
      rating: 5,
      comment: 'Muhteşem bir deneyimdi! Sürpriz destinasyon Kapadokya çıktı ve balon turu unutulmazdı. Rehberimiz çok bilgiliydi.',
      tourName: 'Kapadokya Balon Turu - Sürpriz Paket',
      isApproved: true,
      isPublished: true,
    },
  });

  const review2 = await prisma.review.create({
    data: {
      userId: user2.id,
      orderId: null,
      rating: 4,
      comment: 'Efes Antik Kenti gerçekten büyüleyici. Rehberimiz çok bilgiliydi ve tarihi çok güzel anlattı.',
      tourName: 'Efes Antik Kenti ve Meryem Ana Evi Turu',
      isApproved: true,
      isPublished: true,
    },
  });

  const review3 = await prisma.review.create({
    data: {
      userId: user3.id,
      orderId: null,
      rating: 5,
      comment: 'Çanakkale\'de tarihi yerleri gezmek çok duygusal bir deneyimdi. Rehberimiz çok detaylı anlattı.',
      tourName: 'Çanakkale Şehitlikleri ve Truva Atı Turu',
      isApproved: true,
      isPublished: true,
    },
  });

  const review4 = await prisma.review.create({
    data: {
      userId: user4.id,
      orderId: null,
      rating: 5,
      comment: 'Efes Antik Kenti gerçekten etkileyici. Rehberimiz tarihi çok güzel anlattı. Meryem Ana Evi de çok huzurluydu.',
      tourName: 'Efes Antik Kenti ve Meryem Ana Evi Turu',
      isApproved: true,
      isPublished: true,
    },
  });

  const review5 = await prisma.review.create({
    data: {
      userId: user5.id,
      orderId: null,
      rating: 4,
      comment: 'Bursa\'nın tarihi yerlerini gördük. İskender kebabı harikaydı! Otobüs konforluydu.',
      tourName: 'İstanbul - Bursa Günübirlik Tur',
      isApproved: true,
      isPublished: true,
    },
  });

  // Test review - pending approval
  const testReview = await prisma.review.create({
    data: {
      userId: user.id,
      orderId: null,
      rating: 3,
      comment: 'Tur güzeldi ama rehber biraz hızlı konuşuyordu. Genel olarak memnun kaldım.',
      tourName: 'Efes Antik Kenti ve Meryem Ana Evi Turu',
      isApproved: false, // Pending approval
      isPublished: false,
    },
  });

  console.log('✅ Created 6 sample reviews (TUR ONLY):');
  console.log('   ⭐ Kapadokya Sürpriz Tur: 5/5 yıldız (Yayında)');
  console.log('   ⭐ Efes Antik Kenti Turu: 4/5 yıldız (Yayında)');
  console.log('   ⭐ Çanakkale Şehitlikleri: 5/5 yıldız (Yayında)');
  console.log('   ⭐ Efes Antik Kenti Turu: 5/5 yıldız (Yayında)');
  console.log('   ⭐ Bursa Günübirlik Tur: 4/5 yıldız (Yayında)');
  console.log('   ⭐ Efes Test Yorumu: 3/5 yıldız (Onay Bekliyor)');
  console.log('   📝 5 yayında, 1 onay bekliyor');

  console.log('\n✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
