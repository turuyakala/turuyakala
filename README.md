# 🎫 TuruYakala - Son Dakika Fırsatları Platformu

**Son dakikada, en doğru fırsatla!** Tur, otobüs, uçak ve gemi biletlerinde en iyi son dakika fırsatları.

## ✨ Özellikler

### 🏠 Ana Sayfa
- ✅ Son dakika fırsatları (72 saat içinde)
- ✅ Kategori bazlı filtreleme (Tur, Otobüs, Uçak, Gemi)
- ✅ Nereden-Nereye arama
- ✅ Fiyat aralığı filtreleme
- ✅ Dinamik sıralama (fiyat, kalkış, koltuk)
- ✅ Canlı geriye sayım
- ✅ Kritik süre bildirimleri (kalkışa 3 saat kaldığında)
- ✅ Mobil uyumlu tasarım

### 👤 Kullanıcı Sistemi
- ✅ Kayıt olma (Ad, Soyad, E-posta, Şifre)
- ✅ Giriş yapma (NextAuth)
- ✅ Güvenli şifre (bcrypt hash)
- ✅ Form doğrulama (Zod)
- ✅ Kullanıcı profil sayfası
- ✅ Session yönetimi

### 👑 Admin Paneli
- ✅ Admin girişi (admin@turuyakala.com)
- ✅ Dashboard (istatistikler)
- ✅ Tur ekleme (JSON'a değil, panelden)
- ✅ Tur listeleme ve yönetim
- ✅ Kullanıcı yönetimi
- ✅ Güvenli erişim kontrolü

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Veritabanı Kurulumu

#### Adım 2.1: Environment Değişkenleri
`.env` dosyası zaten mevcut. Varsayılan ayarlar:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

#### Adım 2.2: Prisma Client Oluştur
```bash
npm run db:generate
```
**Ne yapar?** Prisma schema'dan TypeScript tipleri oluşturur.

#### Adım 2.3: Database Schema Uygula
```bash
npm run db:push
```
**Ne yapar?** Schema'yı SQLite database'e push eder (migration olmadan).

**Alternatif (Production için):**
```bash
npm run db:migrate
```
**Ne yapar?** Migration oluşturur ve uygular (history tutar).

#### Adım 2.4: Örnek Verileri Ekle
```bash
npm run db:seed
```
**Ne yapar?** 
- ✅ 3 kullanıcı (admin, user, seller)
- ✅ 3 tedarikçi (TourVision, QuickTrip, DreamVacations)
- ✅ 6 örnek offer (3 sürpriz tur + 3 normal)

**Çıktı:**
```
🌱 Seeding database...
✅ Created users:
   👑 Admin: admin@turuyakala.com (password: Sacmabirsey12!)
   👤 User: test@turuyakala.com (password: Test123!)
   🏢 Seller: seller@turuyakala.com (password: Test123!)

🔌 Creating suppliers...
✅ Created suppliers: TourVision Travel QuickTrip Agency DreamVacations

🎫 Creating sample offers...
✅ Created 6 sample offers:
   🎁 Sürpriz Turlar: 3 adet
   ✈️ Uçak: 2 adet
   🚌 Otobüs: 1 adet
   🚢 Cruise: 1 adet
   
✅ Database seeded successfully!
```

#### Adım 2.5: Veritabanını İncele (Opsiyonel)
```bash
npm run db:studio
```
**Ne yapar?** Prisma Studio'yu açar (http://localhost:5555)
- Database'deki tüm tabloları görüntüle
- Verileri görsel olarak düzenle
- SQL yazmadan CRUD işlemleri

### 3. Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

Site **http://localhost:3000** adresinde açılacaktır.

### 📋 Hızlı Kurulum (Tek Komut)
```bash
npm install && npm run db:push && npm run db:seed && npm run dev
```

## 🗄️ Veritabanı Komutları

| Komut | Açıklama |
|-------|----------|
| `npm run db:generate` | Prisma client oluştur |
| `npm run db:push` | Schema'yı database'e push et |
| `npm run db:migrate` | Migration oluştur ve uygula |
| `npm run db:studio` | Prisma Studio aç (GUI) |
| `npm run db:seed` | Örnek verileri ekle |

### 🔄 Yaygın Senaryolar

#### Database'i Sıfırla
```bash
# SQLite dosyasını sil
rm prisma/dev.db

# Yeniden oluştur
npm run db:push
npm run db:seed
```

#### Yeni Model Ekleme
```bash
# 1. prisma/schema.prisma'yı düzenle
# 2. Migration oluştur
npm run db:migrate

# 3. Seed ekle (opsiyonel)
# prisma/seed.ts'i güncelle
npm run db:seed
```

#### Production Deployment
```bash
# 1. Environment değişkenlerini ayarla
DATABASE_URL="postgresql://..."

# 2. Migration uygula
npx prisma migrate deploy

# 3. Prisma client oluştur
npx prisma generate
```

## 🔑 Giriş Bilgileri

### 👑 Admin
- **E-posta:** `admin@turuyakala.com`
- **Şifre:** `Sacmabirsey12!`
- **Panel:** http://localhost:3000/admin

### 👤 Test Kullanıcı
- **E-posta:** `test@turuyakala.com`
- **Şifre:** `Test123!`

## 📁 Proje Yapısı

```
lastminutetour/
├── src/app/                    # Next.js App Router
│   ├── page.tsx               # Ana sayfa
│   ├── item/[id]/             # Detay sayfası
│   ├── auth/                  # Giriş/Kayıt sayfaları
│   │   ├── login/
│   │   └── register/
│   ├── admin/                 # Admin paneli
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard
│   │   ├── tours/            # Tur yönetimi
│   │   └── users/            # Kullanıcı yönetimi
│   ├── profile/              # Kullanıcı profili
│   └── api/                  # API routes
│       ├── auth/             # NextAuth endpoints
│       └── admin/            # Admin API
├── components/               # React bileşenleri
│   ├── FilterBar.tsx
│   ├── OfferCard.tsx
│   ├── CountdownTimer.tsx
│   ├── AuthButtons.tsx
│   └── ...
├── lib/                      # Utility fonksiyonlar
│   ├── prisma.ts            # Prisma client
│   ├── auth.ts              # NextAuth config
│   ├── middleware/          # Auth middleware
│   ├── validations/         # Zod schemas
│   ├── time.ts
│   ├── filter.ts
│   └── sort.ts
├── prisma/
│   ├── schema.prisma        # Database şeması
│   └── seed.ts              # Seed script
├── data/
│   └── items.json           # Örnek veriler (opsiyonel)
└── .env                     # Ortam değişkenleri
```

## 🗄️ Database

### SQLite (Development)
Geliştirme için SQLite kullanılıyor (`dev.db` dosyası).

### PostgreSQL (Production)
Production için `.env` dosyasını güncelleyin:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lastminutetour?schema=public"
```

Sonra migration çalıştırın:
```bash
npm run db:migrate
```

## 🔧 Ortam Değişkenleri

`.env` dosyası:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Application
DEFAULT_WINDOW_HOURS=72
```

## 📝 Kullanım Senaryoları

### Admin Olarak Tur Ekleme
1. **Giriş Yap:** http://localhost:3000/auth/login
2. **Admin Paneline Git:** Sağ üst köşeden "👑 Admin Panel"
3. **Yeni Tur Ekle:** "Turları Yönet" > "Yeni Tur Ekle"
4. **Formu Doldur:** Kategori, başlık, nereden, nereye, tarih, koltuk, fiyat
5. **Kaydet:** Tur anında ana sayfada görünür

### Kullanıcı Olarak Kayıt Olma
1. **Ana Sayfa:** http://localhost:3000
2. **Kayıt Ol:** Sağ üst köşeden "Kayıt Ol"
3. **Form Doldur:** Ad Soyad, E-posta, Şifre (min 6 karakter, büyük/küçük harf, rakam)
4. **Hesap Oluştur:** Giriş sayfasına yönlendirilir
5. **Giriş Yap:** E-posta ve şifre ile giriş

## 🛠️ Scriptler

```bash
# Geliştirme
npm run dev              # Next.js dev server
npm run type-check       # TypeScript kontrolü
npm run lint             # ESLint

# Database
npm run db:generate      # Prisma client oluştur
npm run db:push          # Schema'yı DB'ye push et
npm run db:migrate       # Migration oluştur
npm run db:studio        # Prisma Studio (GUI)
npm run db:seed          # Test verilerini ekle

# Build
npm run build            # Production build
npm start                # Production server
```

## 🎨 Teknolojiler

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Authentication:** NextAuth.js v5
- **Database:** Prisma + SQLite (dev) / PostgreSQL (prod)
- **Validation:** Zod
- **Security:** bcrypt

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Admin (Protected)
- `POST /api/admin/tours` - Yeni tur ekle
- Middleware ile admin kontrolü yapılır

## 🔐 Güvenlik

- ✅ Şifreler bcrypt ile hash'lenir
- ✅ NextAuth ile session yönetimi
- ✅ Admin route'lar middleware ile korunur
- ✅ Form validasyonu (Zod)
- ✅ SQL injection koruması (Prisma)
- ✅ XSS koruması (React)

## 📱 Responsive Design

- ✅ Mobil (< 768px): 1 sütun, collapsible filtreler
- ✅ Tablet (768px - 1024px): 2 sütun
- ✅ Desktop (> 1024px): 3 sütun

## 🚧 Gelecek Özellikler

- [ ] E-posta doğrulama
- [ ] Şifre sıfırlama
- [ ] Sipariş/rezervasyon sistemi
- [ ] Ödeme entegrasyonu (iyzico/PayTR)
- [ ] E-posta bildirimleri
- [ ] Satıcı paneli
- [ ] Çoklu dil desteği

## 🐛 Sorun Giderme

### Problem: "Prisma Client" hatası
```bash
# Çözüm
npm run db:generate
```

### Problem: "Table does not exist"
```bash
# Çözüm
npm run db:push
```

### Problem: Ana sayfada veri görünmüyor
```bash
# Çözüm
npm run db:seed
```

### Problem: Windows dosya kilidi (EPERM)
```
# Çözüm
1. Dev server'ı kapat (Ctrl+C)
2. Komutu tekrar çalıştır
3. Veya bilgisayarı yeniden başlat
```

### Problem: Port 3000 kullanımda
```bash
# Farklı port kullan
PORT=3001 npm run dev
```

## 📚 Dokümantasyon

| Dosya | Açıklama |
|-------|----------|
| `AWS_DEPLOYMENT.md` | **AWS Amplify deployment kılavuzu** |
| `SEED_DATA_GUIDE.md` | Database seed kılavuzu |
| `OFFER_TABLE_MIGRATION.md` | Offer tablosu geçişi |
| `PRICE_FORMATTING_UPDATE.md` | Fiyat formatlama sistemi |
| `lib/PRICE_HELPER_GUIDE.md` | Price helper fonksiyonları |
| `lib/integrations/INTEGRATION_README.md` | Tedarikçi entegrasyon sistemi |
| `lib/integrations/mappers/SYNC_GUIDE.md` | Senkronizasyon kılavuzu |

## 🚀 Production Deployment

**Detaylı kılavuz için:** [`AWS_DEPLOYMENT.md`](./AWS_DEPLOYMENT.md) 📖

### Hızlı Özet

1. **AWS RDS PostgreSQL** database oluştur
2. **AWS Amplify Console**'da repository'yi bağla
3. **Environment variables** ayarla (DATABASE_URL, NEXTAUTH_SECRET, vb.)
4. **Deploy!** (otomatik build başlar)
5. **AWS EventBridge** ile cron jobs kur (opsiyonel)

### Required Environment Variables
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
NEXTAUTH_URL="https://your-app.amplifyapp.com"
NEXTAUTH_SECRET="production-secret-key"
ENCRYPTION_KEY="your-32-char-encryption-key"
CRON_SECRET="your-cron-secret"
```

Detaylar için [`AWS_DEPLOYMENT.md`](./AWS_DEPLOYMENT.md) dosyasına bakın.

## 📄 Lisans

Bu proje eğitim amaçlıdır.

---

**Geliştirici:** LastMinuteTour Team  
**Versiyon:** 2.0.0  
**Son Güncelleme:** Ekim 2025  
**Database:** SQLite (dev), PostgreSQL (prod)
