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

  // Create sample reviews - delete existing first, then create new ones
  await prisma.review.deleteMany({});
  
  // Create more users for reviews
  const user6 = await prisma.user.upsert({
    where: { email: 'zeynep.arslan@example.com' },
    update: {},
    create: {
      email: 'zeynep.arslan@example.com',
      name: 'Zeynep Arslan',
      password: userPassword,
      role: 'user',
    },
  });

  const user7 = await prisma.user.upsert({
    where: { email: 'ali.celik@example.com' },
    update: {},
    create: {
      email: 'ali.celik@example.com',
      name: 'Ali Çelik',
      password: userPassword,
      role: 'user',
    },
  });

  const user8 = await prisma.user.upsert({
    where: { email: 'selin.yildiz@example.com' },
    update: {},
    create: {
      email: 'selin.yildiz@example.com',
      name: 'Selin Yıldız',
      password: userPassword,
      role: 'user',
    },
  });

  const user9 = await prisma.user.upsert({
    where: { email: 'can.aydin@example.com' },
    update: {},
    create: {
      email: 'can.aydin@example.com',
      name: 'Can Aydın',
      password: userPassword,
      role: 'user',
    },
  });

  const user10 = await prisma.user.upsert({
    where: { email: 'elif.sahin@example.com' },
    update: {},
    create: {
      email: 'elif.sahin@example.com',
      name: 'Elif Şahin',
      password: userPassword,
      role: 'user',
    },
  });

  // Create sample orders first (for reviews to reference)
  const sellerProfile = await prisma.sellerProfile.findFirst({
    where: { userId: seller.id },
  });

  if (!sellerProfile) {
    throw new Error('Seller profile not found');
  }

  // Create inventory items for tours (needed for orders)
  // Check if inventory item already exists
  let inventoryItem1 = await prisma.inventoryItem.findFirst({
    where: {
      vendorOfferId: offer1.vendorOfferId,
      supplierId: supplier1.id,
    },
  });

  if (!inventoryItem1) {
    inventoryItem1 = await prisma.inventoryItem.create({
      data: {
        sellerId: sellerProfile.id,
        supplierId: supplier1.id,
        vendorOfferId: offer1.vendorOfferId,
        category: 'tour',
        title: offer1.title,
        from: offer1.from,
        to: offer1.to,
        startAt: offer1.startAt,
        seatsTotal: offer1.seatsTotal,
        seatsLeft: offer1.seatsLeft,
        priceMinor: offer1.priceMinor,
        currency: offer1.currency,
        image: offer1.image,
        terms: offer1.terms,
        transport: offer1.transport,
        isSurprise: offer1.isSurprise,
        requiresPassport: offer1.requiresPassport,
        status: 'active',
      },
    });
  }

  let inventoryItem2 = await prisma.inventoryItem.findFirst({
    where: {
      vendorOfferId: offer7.vendorOfferId,
      supplierId: supplier1.id,
    },
  });

  if (!inventoryItem2) {
    inventoryItem2 = await prisma.inventoryItem.create({
      data: {
        sellerId: sellerProfile.id,
        supplierId: supplier1.id,
        vendorOfferId: offer7.vendorOfferId,
        category: 'tour',
        title: offer7.title,
        from: offer7.from,
        to: offer7.to,
        startAt: offer7.startAt,
        seatsTotal: offer7.seatsTotal,
        seatsLeft: offer7.seatsLeft,
        priceMinor: offer7.priceMinor,
        currency: offer7.currency,
        image: offer7.image,
        terms: offer7.terms,
        transport: offer7.transport,
        isSurprise: offer7.isSurprise,
        requiresPassport: offer7.requiresPassport,
        status: 'active',
      },
    });
  }

  // Helper function to create or find inventory item
  const createOrFindInventoryItem = async (offer: any, supplierId: string) => {
    let item = await prisma.inventoryItem.findFirst({
      where: {
        vendorOfferId: offer.vendorOfferId,
        supplierId: supplierId,
      },
    });

    if (!item) {
      item = await prisma.inventoryItem.create({
        data: {
          sellerId: sellerProfile.id,
          supplierId: supplierId,
          vendorOfferId: offer.vendorOfferId,
          category: offer.category,
          title: offer.title,
          from: offer.from,
          to: offer.to,
          startAt: offer.startAt,
          seatsTotal: offer.seatsTotal,
          seatsLeft: offer.seatsLeft,
          priceMinor: offer.priceMinor,
          currency: offer.currency,
          image: offer.image,
          terms: offer.terms,
          transport: offer.transport,
          isSurprise: offer.isSurprise,
          requiresPassport: offer.requiresPassport,
          status: 'active',
        },
      });
    }

    return item;
  };

  const inventoryItem3 = await createOrFindInventoryItem(offer8, supplier2.id);
  const inventoryItem4 = await createOrFindInventoryItem(offer10, supplier1.id);
  const inventoryItem5 = await createOrFindInventoryItem(offer3, supplier3.id);
  const inventoryItem6 = await createOrFindInventoryItem(offer5, supplier1.id);

  // Create sample orders
  // Test kullanıcısı için örnek orderlar - "Önceden Yakaladıklarım" bölümü için
  // 1. Yorumlu order (Paris Turu)
  const testUserOrder1 = await prisma.order.create({
    data: {
      userId: user.id,
      inventoryItemId: inventoryItem2.id,
      email: user.email!,
      fullName: user.name || 'Test User',
      phone: '+90 555 111 2233',
      seats: 2,
      totalPrice: inventoryItem2.priceMinor * 2,
      paymentStatus: 'paid',
      pnrCode: 'PNR-TEST-001',
    },
  });

  // 2. Yorumsuz order (Roma Turu) - "Değerlendir ve Yorum Yap" butonu görünsün
  const testUserOrder2 = await prisma.order.create({
    data: {
      userId: user.id,
      inventoryItemId: inventoryItem3.id,
      email: user.email!,
      fullName: user.name || 'Test User',
      phone: '+90 555 111 2233',
      seats: 1,
      totalPrice: inventoryItem3.priceMinor,
      paymentStatus: 'paid',
      pnrCode: 'PNR-TEST-002',
    },
  });

  const order1 = await prisma.order.create({
    data: {
      userId: user.id,
      inventoryItemId: inventoryItem1.id,
      email: user.email!,
      fullName: user.name || 'Test User',
      phone: '+90 555 111 2233',
      seats: 2,
      totalPrice: inventoryItem1.priceMinor * 2,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-001',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      inventoryItemId: inventoryItem2.id,
      email: user2.email!,
      fullName: user2.name || 'Ahmet Yılmaz',
      phone: '+90 555 222 3344',
      seats: 1,
      totalPrice: inventoryItem2.priceMinor,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-002',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      userId: user3.id,
      inventoryItemId: inventoryItem3.id,
      email: user3.email!,
      fullName: user3.name || 'Ayşe Demir',
      phone: '+90 555 333 4455',
      seats: 2,
      totalPrice: inventoryItem3.priceMinor * 2,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-003',
    },
  });

  const order4 = await prisma.order.create({
    data: {
      userId: user4.id,
      inventoryItemId: inventoryItem4.id,
      email: user4.email!,
      fullName: user4.name || 'Mehmet Kaya',
      phone: '+90 555 444 5566',
      seats: 1,
      totalPrice: inventoryItem4.priceMinor,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-004',
    },
  });

  const order5 = await prisma.order.create({
    data: {
      userId: user5.id,
      inventoryItemId: inventoryItem5.id,
      email: user5.email!,
      fullName: user5.name || 'Fatma Öztürk',
      phone: '+90 555 555 6677',
      seats: 2,
      totalPrice: inventoryItem5.priceMinor * 2,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-005',
    },
  });

  const order6 = await prisma.order.create({
    data: {
      userId: user6.id,
      inventoryItemId: inventoryItem6.id,
      email: user6.email!,
      fullName: user6.name || 'Zeynep Arslan',
      phone: '+90 555 666 7788',
      seats: 1,
      totalPrice: inventoryItem6.priceMinor,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-006',
    },
  });

  const order7 = await prisma.order.create({
    data: {
      userId: user7.id,
      inventoryItemId: inventoryItem5.id,
      email: user7.email!,
      fullName: user7.name || 'Ali Çelik',
      phone: '+90 555 777 8899',
      seats: 1,
      totalPrice: inventoryItem5.priceMinor,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-007',
    },
  });

  const order8 = await prisma.order.create({
    data: {
      userId: user8.id,
      inventoryItemId: inventoryItem6.id,
      email: user8.email!,
      fullName: user8.name || 'Selin Yıldız',
      phone: '+90 555 888 9900',
      seats: 2,
      totalPrice: inventoryItem6.priceMinor * 2,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-008',
    },
  });

  const order9 = await prisma.order.create({
    data: {
      userId: user9.id,
      inventoryItemId: inventoryItem1.id,
      email: user9.email!,
      fullName: user9.name || 'Can Aydın',
      phone: '+90 555 999 0011',
      seats: 1,
      totalPrice: inventoryItem1.priceMinor,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-009',
    },
  });

  const order10 = await prisma.order.create({
    data: {
      userId: user10.id,
      inventoryItemId: inventoryItem2.id,
      email: user10.email!,
      fullName: user10.name || 'Elif Şahin',
      phone: '+90 555 000 1122',
      seats: 1,
      totalPrice: inventoryItem2.priceMinor,
      paymentStatus: 'paid',
      pnrCode: 'PNR-SEED-010',
    },
  });

  const reviews = [
    // Test kullanıcısı için yorum (Paris Turu)
    {
      userId: user.id,
      orderId: testUserOrder1.id,
      rating: 5,
      comment: 'Paris turu hayalimdi ve gerçekten beklentilerimi aştı! Eyfel Kulesi, Louvre Müzesi, Notre Dame... Her yer çok güzeldi. Otelimiz merkezi bir konumdaydı ve kahvaltı harikaydı. Kesinlikle tekrar gelmek isterim.',
      tourName: 'Paris Romantik Şehir Turu',
      isApproved: true,
      isPublished: true,
    },
    {
      userId: user.id,
      orderId: order1.id,
      rating: 5,
      comment: 'Muhteşem bir deneyimdi! Sürpriz destinasyon Kapadokya çıktı ve balon turu unutulmazdı. Sabahın erken saatlerinde balonla gökyüzünde olmak harika bir histi. Rehberimiz çok bilgiliydi ve her şey mükemmel organize edilmişti.',
      tourName: 'Kapadokya Balon Turu - Sürpriz Paket',
      isApproved: true,
      isPublished: true,
    },
    {
      userId: user2.id,
      orderId: order2.id,
      rating: 5,
      comment: 'Paris turu hayalimdi ve gerçekten beklentilerimi aştı! Eyfel Kulesi, Louvre Müzesi, Notre Dame... Her yer çok güzeldi. Otelimiz merkezi bir konumdaydı ve kahvaltı harikaydı. Kesinlikle tekrar gelmek isterim.',
      tourName: 'Paris Romantik Şehir Turu',
      isApproved: true,
      isPublished: true,
    },
    {
      userId: user3.id,
      orderId: order3.id,
      rating: 5,
      comment: 'Roma\'da antik tarihi yaşamak inanılmaz bir deneyimdi. Kolezyum, Vatikan, Trevi Çeşmesi... Her yer büyüleyiciydi. Rehberimiz çok detaylı bilgi verdi ve İtalyan mutfağını da tatma fırsatı bulduk. Kesinlikle tavsiye ederim!',
      tourName: 'Roma Antik Şehir Turu',
      isApproved: true,
      isPublished: true,
    },
    {
      userId: user4.id,
      orderId: order4.id,
      rating: 4,
      comment: 'Dubai turu çok lüks ve keyifliydi. Burj Khalifa\'dan manzara muhteşemdi. Çöl safarisi de çok eğlenceliydi. Tek eksik yanı biraz daha fazla zaman olsaydı daha iyi olurdu ama genel olarak çok memnun kaldık.',
      tourName: 'Dubai Lüks Şehir Turu',
      isApproved: true,
      isPublished: true,
    },
    {
      userId: user5.id,
      orderId: order5.id,
      rating: 5,
      comment: 'Akdeniz cruise turu unutulmaz bir deneyimdi! Gemi çok lüks ve temizdi. Yemekler harikaydı ve personel çok ilgiliydi. Datça ve Bodrum\'da durduğumuz yerler çok güzeldi. Deniz suyu kristal gibiydi. Kesinlikle tekrar yapmak isterim!',
      tourName: 'Akdeniz Cruise Turu - Sürpriz Rota',
      isApproved: true,
      isPublished: true,
    },
    {
      userId: user6.id,
      orderId: order6.id,
      rating: 5,
      comment: 'Sürpriz termal tur paketi gerçekten sürprizdi! Pamukkale çıktı ve travertenler muhteşemdi. Termal havuzda yüzmek çok rahatlatıcıydı. Otel de çok güzeldi ve yemekler harikaydı. Kesinlikle tekrar gelmek isterim!',
      tourName: 'Sürpriz Termal Tur Paketi',
      isApproved: true,
      isPublished: true,
    },
    {
      userId: user7.id,
      orderId: order7.id,
      rating: 5,
      comment: 'Akdeniz cruise turu tek kelimeyle muhteşemdi! Gemi personeli çok profesyoneldi ve yemekler restoran kalitesindeydi. Özellikle gün batımını izlemek unutulmazdı. Herkese tavsiye ederim!',
      tourName: 'Akdeniz Cruise Turu - Sürpriz Rota',
      isApproved: true,
      isPublished: true,
    },
    {
      userId: user8.id,
      orderId: order8.id,
      rating: 5,
      comment: 'Pamukkale travertenleri görmek hayatımın en güzel anlarından biriydi. Termal suyun içinde yüzmek çok rahatlatıcıydı. Rehberimiz çok bilgiliydi ve her şey zamanında gerçekleşti. Teşekkürler!',
      tourName: 'Sürpriz Termal Tur Paketi',
      isApproved: true,
      isPublished: true,
    },
  ];

  // Delete all existing reviews first
  await prisma.review.deleteMany({});
  
  // Create all reviews
  for (const reviewData of reviews) {
    try {
      await prisma.review.create({ data: reviewData });
      console.log(`✅ Created review: ${reviewData.tourName}`);
    } catch (error) {
      console.error(`❌ Error creating review for ${reviewData.tourName}:`, error);
    }
  }
  
  // Add a few more reviews to ensure we have enough
  const additionalReviews = [
    {
      userId: user9.id,
      orderId: order9.id,
      rating: 5,
      comment: 'Kapadokya balon turu hayatımın en güzel deneyimlerinden biriydi! Sabahın erken saatlerinde gökyüzünde olmak, güneşin doğuşunu izlemek... Kelimelerle anlatılamaz. Kesinlikle herkese tavsiye ederim!',
      tourName: 'Kapadokya Balon Turu - Sürpriz Paket',
      isApproved: true,
      isPublished: true,
    },
    {
      userId: user10.id,
      orderId: order10.id,
      rating: 5,
      comment: 'Paris turu romantik bir rüya gibiydi! Eyfel Kulesi\'nin altında durmak, Seine Nehri\'nde tekne turu yapmak... Her şey mükemmeldi. Otelimiz çok güzeldi ve rehberimiz çok bilgiliydi.',
      tourName: 'Paris Romantik Şehir Turu',
      isApproved: true,
      isPublished: true,
    },
  ];
  
  for (const reviewData of additionalReviews) {
    try {
      await prisma.review.create({ data: reviewData });
      console.log(`✅ Created additional review: ${reviewData.tourName}`);
    } catch (error) {
      console.error(`❌ Error creating additional review:`, error);
    }
  }

  console.log('✅ Created 8 sample reviews:');
  console.log('   ⭐ Kapadokya Balon Turu: 5/5 yıldız (Yayında)');
  console.log('   ⭐ Paris Romantik Şehir Turu: 5/5 yıldız (Yayında)');
  console.log('   ⭐ Roma Antik Şehir Turu: 5/5 yıldız (Yayında)');
  console.log('   ⭐ Dubai Lüks Şehir Turu: 4/5 yıldız (Yayında)');
  console.log('   ⭐ Akdeniz Cruise Turu: 5/5 yıldız (Yayında)');
  console.log('   ⭐ İstanbul-Antalya Uçuş: 5/5 yıldız (Yayında)');
  console.log('   ⭐ Marmaris Cruise: 4/5 yıldız (Yayında)');
  console.log('   ⭐ Sürpriz Termal Tur: 5/5 yıldız (Yayında)');
  console.log('   📝 Tümü yayında ve onaylı');

  // Create detailed example tour (InventoryItem with all details)
  console.log('\n📋 Creating detailed example tour...');
  
  const adminSellerProfile = await prisma.sellerProfile.findFirst({
    where: { userId: admin.id },
  });

  if (!adminSellerProfile) {
    // Create admin seller profile if it doesn't exist
    const newAdminSellerProfile = await prisma.sellerProfile.create({
      data: {
        userId: admin.id,
        companyName: 'TuruYakala Admin',
        verified: true,
      },
    });
    
    const exampleTour = await prisma.inventoryItem.create({
      data: {
        sellerId: newAdminSellerProfile.id,
        category: 'tour',
        title: 'Kapadokya Balon Turu - Unutulmaz Deneyim',
        from: 'İstanbul',
        to: 'Kapadokya',
        startAt: hoursFromNow(48),
        seatsTotal: 20,
        seatsLeft: 5,
        priceMinor: 850000, // 8500 TRY
        currency: 'TRY',
        image: '/images/hero-1.jpg',
        images: JSON.stringify([
          '/images/hero-1.jpg',
          '/images/hero-2.jpg',
          '/images/hero-3.jpg',
          '/images/hero-4.jpg'
        ]),
        transport: 'Uçak ile',
        contact: JSON.stringify({
          phone: '+90 555 123 4567',
          whatsapp: '905551234567'
        }),
        terms: 'Kalkıştan 24 saat önce iptal edilirse %80 iade. Sonrasında iade yok.',
        description: 'Kapadokya\'nın eşsiz peri bacalarını havadan keşfetmek için muhteşem bir fırsat! Gün doğumu ile birlikte gökyüzüne yükselin ve bu büyülü deneyimi yaşayın. Profesyonel pilotlar eşliğinde güvenli bir şekilde uçun ve Kapadokya\'nın muhteşem manzarasını kuşbakışı izleyin.',
        program: JSON.stringify([
          'Sabah 05:30 - Otel transferi',
          'Sabah 06:00 - Balon kalkış alanına varış, kahvaltı ikramı',
          'Sabah 06:30 - Balon şişirme gösterisi ve güvenlik briefingi',
          'Sabah 07:00 - Balon kalkışı (yaklaşık 1 saat sürecek)',
          'Sabah 08:00 - Balon inişi ve şampanya töreni',
          'Sabah 08:30 - Uçuş sertifikası dağıtımı',
          'Sabah 09:00 - Otele dönüş'
        ]),
        included: JSON.stringify([
          'Otel karşılama ve transfer hizmeti',
          'Profesyonel pilot eşliğinde balon turu',
          'Uçuş öncesi kahvaltı ikramı',
          'Uçuş sonrası şampanya töreni',
          'Uçuş sertifikası',
          'Uçuş sigortası',
          'Tüm güvenlik ekipmanları'
        ]),
        excluded: JSON.stringify([
          'Kişisel harcamalar',
          'Uçak bileti (İstanbul-Kayseri)',
          'Ekstra içecekler',
          'Fotoğraf ve video çekimi (opsiyonel)',
          'Bahşişler'
        ]),
        importantInfo: JSON.stringify([
          'Hava koşulları uygun değilse tur iptal edilebilir',
          'Hamile kadınlar ve 6 yaşından küçük çocuklar katılamaz',
          'Balon kapasitesi maksimum 20 kişidir',
          'Rahat kıyafet ve spor ayakkabı önerilir',
          'Uçuş süresi hava koşullarına göre değişebilir',
          'Pasaport gerekli değildir (iç hat uçuşu)'
        ]),
        departureLocation: JSON.stringify({
          address: 'Kapadokya Balon Kalkış Alanı, Göreme, Nevşehir',
          lat: 38.6431,
          lng: 34.8286
        }),
        checkInTime: '05:30',
        checkOutTime: '09:00',
        roomRules: JSON.stringify([
          'Sigara içilmez',
          'Ses yapılmaz',
          'Gece 22:00\'den sonra sessizlik',
          'Çocuklar için uygun'
        ]),
        petFriendly: false,
        languages: JSON.stringify(['Türkçe', 'İngilizce']),
        paymentMethods: JSON.stringify(['Nakit', 'Kredi Kartı', 'Banka Transferi']),
        isSurprise: false,
        requiresVisa: false,
        requiresPassport: false,
        status: 'active',
      },
    });
    
    console.log('✅ Created detailed example tour:', exampleTour.title);
    console.log('   📍 Detay sayfası: /item/' + exampleTour.id);
  } else {
    // Check if example tour already exists
    const existingTour = await prisma.inventoryItem.findFirst({
      where: {
        sellerId: adminSellerProfile.id,
        title: 'Kapadokya Balon Turu - Unutulmaz Deneyim',
      },
    });

    if (!existingTour) {
      const exampleTour = await prisma.inventoryItem.create({
        data: {
          sellerId: adminSellerProfile.id,
          category: 'tour',
          title: 'Kapadokya Balon Turu - Unutulmaz Deneyim',
          from: 'İstanbul',
          to: 'Kapadokya',
          startAt: hoursFromNow(48),
          seatsTotal: 20,
          seatsLeft: 5,
          priceMinor: 850000, // 8500 TRY
          currency: 'TRY',
          image: '/images/hero-1.jpg',
          images: JSON.stringify([
            '/images/hero-1.jpg',
            '/images/hero-2.jpg',
            '/images/hero-3.jpg',
            '/images/hero-4.jpg'
          ]),
          transport: 'Uçak ile',
          contact: JSON.stringify({
            phone: '+90 555 123 4567',
            whatsapp: '905551234567'
          }),
          terms: 'Kalkıştan 24 saat önce iptal edilirse %80 iade. Sonrasında iade yok.',
          description: 'Kapadokya\'nın eşsiz peri bacalarını havadan keşfetmek için muhteşem bir fırsat! Gün doğumu ile birlikte gökyüzüne yükselin ve bu büyülü deneyimi yaşayın. Profesyonel pilotlar eşliğinde güvenli bir şekilde uçun ve Kapadokya\'nın muhteşem manzarasını kuşbakışı izleyin.',
          program: JSON.stringify([
            'Sabah 05:30 - Otel transferi',
            'Sabah 06:00 - Balon kalkış alanına varış, kahvaltı ikramı',
            'Sabah 06:30 - Balon şişirme gösterisi ve güvenlik briefingi',
            'Sabah 07:00 - Balon kalkışı (yaklaşık 1 saat sürecek)',
            'Sabah 08:00 - Balon inişi ve şampanya töreni',
            'Sabah 08:30 - Uçuş sertifikası dağıtımı',
            'Sabah 09:00 - Otele dönüş'
          ]),
          included: JSON.stringify([
            'Otel karşılama ve transfer hizmeti',
            'Profesyonel pilot eşliğinde balon turu',
            'Uçuş öncesi kahvaltı ikramı',
            'Uçuş sonrası şampanya töreni',
            'Uçuş sertifikası',
            'Uçuş sigortası',
            'Tüm güvenlik ekipmanları'
          ]),
          excluded: JSON.stringify([
            'Kişisel harcamalar',
            'Uçak bileti (İstanbul-Kayseri)',
            'Ekstra içecekler',
            'Fotoğraf ve video çekimi (opsiyonel)',
            'Bahşişler'
          ]),
          importantInfo: JSON.stringify([
            'Hava koşulları uygun değilse tur iptal edilebilir',
            'Hamile kadınlar ve 6 yaşından küçük çocuklar katılamaz',
            'Balon kapasitesi maksimum 20 kişidir',
            'Rahat kıyafet ve spor ayakkabı önerilir',
            'Uçuş süresi hava koşullarına göre değişebilir',
            'Pasaport gerekli değildir (iç hat uçuşu)'
          ]),
          departureLocation: JSON.stringify({
            address: 'Kapadokya Balon Kalkış Alanı, Göreme, Nevşehir',
            lat: 38.6431,
            lng: 34.8286
          }),
          checkInTime: '05:30',
          checkOutTime: '09:00',
          roomRules: JSON.stringify([
            'Sigara içilmez',
            'Ses yapılmaz',
            'Gece 22:00\'den sonra sessizlik',
            'Çocuklar için uygun'
          ]),
          petFriendly: false,
          languages: JSON.stringify(['Türkçe', 'İngilizce']),
          paymentMethods: JSON.stringify(['Nakit', 'Kredi Kartı', 'Banka Transferi']),
          isSurprise: false,
          requiresVisa: false,
          requiresPassport: false,
          status: 'active',
        },
      });
      
      console.log('✅ Created detailed example tour:', exampleTour.title);
      console.log('   📍 Detay sayfası: /item/' + exampleTour.id);
    } else {
      console.log('✅ Example tour already exists:', existingTour.title);
      console.log('   📍 Detay sayfası: /item/' + existingTour.id);
    }
  }

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
