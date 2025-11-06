# ⚡ Supabase Kurulum - Hızlı Başlangıç

## ✅ Durum Kontrolü

Şu an elinizde:
- ✅ DATABASE_URL (Supabase'den aldınız)
- ⚠️ Diğer key'ler eksik (şimdi oluşturacağız)

---

## 🔑 Adım 1: Environment Variables Oluştur

### .env Dosyanızı Açın

Proje kök dizininde `.env` dosyası zaten mevcut. Şu anki içeriği:

```env
DATABASE_URL="postgresql://..."  # ✅ Var
```

### Eksik Key'leri Ekleyin

Terminal'de şu komutları çalıştırın:

```bash
# Windows PowerShell için:
$Env:NEXTAUTH_SECRET = (openssl rand -base64 32)
$Env:ENCRYPTION_KEY = (openssl rand -hex 32)
$Env:CRON_SECRET = (openssl rand -base64 32)

echo "NEXTAUTH_SECRET=$Env:NEXTAUTH_SECRET"
echo "ENCRYPTION_KEY=$Env:ENCRYPTION_KEY"
echo "CRON_SECRET=$Env:CRON_SECRET"
```

### Çıktıları .env Dosyasına Ekleyin

```env
# Mevcut (zaten var)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Yeni ekleyecekleriniz
DIRECT_URL="postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres"
NEXTAUTH_SECRET="XyZ123abc456..."  # Yukarıdaki komuttan kopyala
ENCRYPTION_KEY="a1b2c3d4e5f6..."   # Yukarıdaki komuttan kopyala
CRON_SECRET="AbC123dEf456..."      # Yukarıdaki komuttan kopyala
NODE_ENV="development"
```

**ÖNEMLİ:** DIRECT_URL'i de Supabase Dashboard'dan alın:
- Settings > Database > Connection String
- Mode: **Session (port 5432)** seçin

---

## 📦 Adım 2: Prisma Setup

```bash
# Prisma Client oluştur
npm run db:generate
```

**Çıktı:**
```
✔ Generated Prisma Client (v6.5.0)
```

---

## 🗄️ Adım 3: Tabloları Oluştur

```bash
# Migration çalıştır (Supabase'de tabloları oluşturur)
npx prisma migrate deploy
```

**Çıktı:**
```
13 migrations found in prisma/migrations
Applying migration `20241021_init`
Applying migration `20241021_add_suppliers`
...
Database migrations applied successfully! ✅
```

**Ne olur:** Supabase'de şu tablolar oluşur:
- User, Account, Session, VerificationToken
- Supplier, Offer, InventoryItem
- Order, Review, ContactMessage
- FetchJob, JobRun, AuditLog
- SellerProfile

---

## 🌱 Adım 4: Mock Data Ekle

```bash
# Örnek verileri ekle
npm run db:seed
```

**Çıktı:**
```
🌱 Seeding database...

✅ Created users:
   👑 Admin: admin@turuyakala.com (password: Admin123!)
   👤 User: test@turuyakala.com (password: Test123!)
   🏢 Seller: seller@turuyakala.com (password: Test123!)

🔌 Creating suppliers...
✅ Created suppliers: TourVision Travel, QuickTrip Agency, DreamVacations

🎫 Creating sample offers...
✅ Created 12 sample offers:
   🎁 Sürpriz Turlar: 3 adet
      - Kapadokya Balon Turu - Sürpriz Paket (10.000 ₺)
      - Akdeniz Cruise Turu - Sürpriz Rota (10.000 ₺)
      - Sürpriz Termal Tur Paketi (10.000 ₺)
   🌍 Yurtdışı Turlar: 3 adet
      - Paris Romantik Şehir Turu (10.000 ₺)
      - Roma Antik Şehir Turu (10.000 ₺)
      - Dubai Lüks Şehir Turu (10.000 ₺)
   ✈️ Uçak Biletleri: 3 adet
   🚌 Otobüs Biletleri: 2 adet
   🚢 Cruise Turları: 2 adet
   ⏰ Tümü 24-72 saat arasında kalkış yapacak

💬 Creating sample reviews...
✅ Created 6 sample reviews

✅ Database seeded successfully!
```

**Ne olur:** 
- 3 kullanıcı (admin, user, seller)
- 3 tedarikçi
- 12 mock tur/uçak/otobüs/cruise teklifi
- 6 örnek yorum (5 yayında, 1 onay bekliyor)

---

## 🚀 Adım 5: Development Server Başlat

```bash
npm run dev
```

**Çıktı:**
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.5s
```

---

## ✅ Adım 6: Test Et

### Ana Sayfa
```
http://localhost:3000
```

**Göreceksiniz:**
- 12 adet tur/teklif
- 3 sürpriz tur (üstte)
- Filtreleme ve sıralama
- Countdown timer (kalkışa kalan süre)

### Admin Girişi
```
http://localhost:3000/auth/login
```

**Giriş Bilgileri:**
```
Email: admin@turuyakala.com
Şifre: Admin123!
```

**Admin Panel:**
```
http://localhost:3000/admin
```

**Göreceksiniz:**
- Dashboard (istatistikler)
- Turları Yönet
- Teklifler (tedarikçiden gelen ham data)
- Tedarikçiler
- Kullanıcılar
- Yorumlar
- İletişim Mesajları

---

## 🔍 Database'i İncele

```bash
# Prisma Studio aç (GUI)
npm run db:studio
```

**Açılacak:** http://localhost:5555

**Göreceksiniz:**
- Tüm tablolar
- Veri browse etme
- Kayıt ekleme/düzenleme/silme

---

## 📊 Mock Data Detayları

### Kullanıcılar
| Email | Şifre | Rol |
|-------|-------|-----|
| admin@turuyakala.com | Admin123! | admin |
| test@turuyakala.com | Test123! | user |
| seller@turuyakala.com | Test123! | seller |

### Tedarikçiler
1. TourVision Travel
2. QuickTrip Agency
3. DreamVacations

### Teklifler (12 adet)
| Kategori | Adet | Kalkış Süresi |
|----------|------|---------------|
| Sürpriz Turlar | 3 | 24-72 saat |
| Normal Turlar | 3 | 24-72 saat |
| Uçak | 3 | 24-72 saat |
| Otobüs | 2 | 24-72 saat |
| Cruise | 1 | 24-72 saat |

**Tüm turlar:** 10.000 ₺

### Yorumlar (6 adet)
- 5 yayında (isPublished: true)
- 1 onay bekliyor (isPublished: false)

---

## 🐛 Sorun Giderme

### Hata: "Can't reach database server"
**Çözüm:**
```bash
# DATABASE_URL'i kontrol et (.env dosyasında)
# Supabase project aktif mi kontrol et (Dashboard'da)
```

### Hata: "Migration failed"
**Çözüm:**
```bash
# Schema'yı push et (alternatif)
npm run db:push
```

### Hata: "Seed failed - Unique constraint"
**Çözüm:**
```bash
# Database'i temizle ve tekrar seed et
npx prisma migrate reset --force
npm run db:seed
```

### Turlar Ana Sayfada Görünmüyor
**Çözüm:**
```bash
# Database'de veri var mı kontrol et
npm run db:studio
# Offer tablosunu aç, status: 'active' olanları gör
```

---

## 📝 Özet Komutlar

```bash
# 1. Key'leri oluştur (PowerShell)
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -hex 32     # ENCRYPTION_KEY
openssl rand -base64 32  # CRON_SECRET

# 2. .env dosyasına ekle

# 3. Prisma setup
npm run db:generate

# 4. Tabloları oluştur
npx prisma migrate deploy

# 5. Mock data ekle
npm run db:seed

# 6. Başlat
npm run dev

# 7. Test et
http://localhost:3000
Login: admin@turuyakala.com / Admin123!
```

---

## 🎉 Tamamlandı!

Artık projeniz Supabase ile çalışıyor ve 12 mock tur ile test edebilirsiniz!

**Sonraki adımlar:**
- Admin panelden yeni turlar ekleyin
- Tedarikçi entegrasyonu yapın
- Production'a deploy edin

---

**Sorular için:** `docs/ENV_VARIABLES.md` dosyasına bakın.


