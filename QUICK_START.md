# ⚡ Quick Start Guide - LastMinuteTours

Projeyi hızlıca çalıştırmak için step-by-step kılavuz.

## 🚀 5 Dakikada Başla

### 1. Repository Clone & Install (1 dk)
```bash
git clone <repo-url>
cd lastminutetour
npm install
```

### 2. Database Kurulumu (2 dk)
```bash
# Prisma client oluştur
npm run db:generate

# Database schema uygula
npm run db:push

# Örnek verileri ekle
npm run db:seed
```

**Beklenen Çıktı:**
```
✅ Created users:
   👑 Admin: admin@lastminutetour.com
✅ Created suppliers: TourVision Travel...
✅ Created 6 sample offers
```

### 3. Dev Server Başlat (1 dk)
```bash
npm run dev
```

### 4. Test Et (1 dk)
```
✅ Ana Sayfa: http://localhost:3000
✅ Admin Panel: http://localhost:3000/admin
   Email: admin@lastminutetour.com
   Şifre: Admin123!
```

## 🎯 İlk Bakışta Ne Göreceksiniz?

### Ana Sayfa
```
┌────────────────────────────────┐
│ 🎁 Kapadokya Sürpriz (48h)     │ ← Kırmızı çerçeve
│    2.800 ₺                     │
└────────────────────────────────┘
┌────────────────────────────────┐
│ 🎁 Termal Sürpriz (54h)        │
│    1.800 ₺                     │
└────────────────────────────────┘
┌────────────────────────────────┐
│ 🎁 Cruise Sürpriz (60h)        │
│    5.500 ₺                     │
└────────────────────────────────┘
──────────────────────────────────
┌────────────────────────────────┐
│ İzmir → Bodrum (24h)           │
│    650 ₺                       │
└────────────────────────────────┘
┌────────────────────────────────┐
│ İstanbul → Antalya (30h)       │
│    450 ₺                       │
└────────────────────────────────┘
┌────────────────────────────────┐
│ İstanbul - Ankara (36h)        │
│    350 ₺                       │
└────────────────────────────────┘
```

## 📊 Seed Data Özeti

| Kategori | Adet | Örnekler |
|----------|------|----------|
| **Sürpriz Tur** | 3 | Kapadokya, Pamukkale, Cruise |
| **Uçak** | 2 | İstanbul-Antalya, İzmir-Bodrum |
| **Otobüs** | 1 | İstanbul-Ankara |
| **Toplam** | 6 | Tümü 24-72 saat içinde |

## 🔑 Test Hesapları

| Rol | Email | Şifre | Panel |
|-----|-------|-------|-------|
| Admin | admin@lastminutetour.com | Admin123! | /admin |
| User | test@lastminutetour.com | Test123! | / |
| Seller | seller@lastminutetour.com | Test123! | / |

## 🧪 Hızlı Test Senaryoları

### Senaryo 1: Sürpriz Turları Gör
1. Ana sayfayı aç
2. Üstte 3 kırmızı çerçeveli kart gör
3. Destinasyonlar gizli olmalı

### Senaryo 2: Admin Panel
1. Admin olarak giriş yap
2. Dashboard → Tedarikçiler
3. "Şimdi Senkronize Et" butonunu test et

### Senaryo 3: Fiyat Formatı
1. Kartlarda fiyatlar: "2.800 ₺" formatında
2. Binlik ayırıcı nokta
3. Para birimi sembolü sonra

### Senaryo 4: Veritabanı
```bash
npm run db:studio
```
1. Offer tablosunu aç
2. 6 kayıt olduğunu gör
3. isSurprise kolonunu kontrol et

## 🐛 Sorun mu Var?

### Problem: Hiç tur görünmüyor
```bash
npm run db:seed
```

### Problem: Prisma hatası
```bash
npm run db:generate
npm run db:push
```

### Problem: Port 3000 kullanımda
```bash
PORT=3001 npm run dev
```

## 📚 Sonraki Adımlar

1. **Dokümantasyonu Oku**
   - `README.md` - Ana dokümantasyon
   - `SEED_DATA_GUIDE.md` - Database kılavuzu
   - `OFFER_TABLE_MIGRATION.md` - Schema geçişi

2. **Kod İncele**
   - `src/app/page.tsx` - Ana sayfa (Offer query)
   - `prisma/seed.ts` - Seed script
   - `lib/price.ts` - Fiyat formatı

3. **Özelleştir**
   - Yeni offer ekle (seed.ts)
   - Fiyat değiştir
   - Kalkış zamanlarını ayarla

## 🎓 Öğrenme Hedefleri

✅ Next.js 15 App Router  
✅ Prisma ORM kullanımı  
✅ Server Components  
✅ TypeScript best practices  
✅ Database seeding  
✅ API entegrasyonları  

---

**Kurulum süresi:** ~5 dakika  
**Zorluk seviyesi:** Kolay  
**Gereksinimler:** Node.js 20+, npm

