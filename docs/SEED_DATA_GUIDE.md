# 🌱 Seed Data Kılavuzu

Database'e örnek veri ekleme kılavuzu.

## 🎯 Komutlar

### Database'i Seed Et
```bash
npm run db:seed
```

### Database'i Sıfırla ve Seed Et
```bash
npm run db:push    # Schema'yı database'e push et
npm run db:seed    # Örnek verileri ekle
```

### Prisma Studio ile Kontrol Et
```bash
npm run db:studio
```

## 📊 Eklenen Veriler

### 1. Kullanıcılar (3 adet)

| Rol | Email | Şifre | Açıklama |
|-----|-------|-------|----------|
| **Admin** | admin@lastminutetour.com | Admin123! | Tam yetki |
| **User** | test@lastminutetour.com | Test123! | Normal kullanıcı |
| **Seller** | seller@lastminutetour.com | Test123! | Satıcı hesabı |

### 2. Tedarikçiler (3 adet)

| Ad | Mod | Açıklama |
|----|-----|----------|
| **TourVision Travel** | Pull | Premium tur ve tatil paketleri |
| **QuickTrip Agency** | Pull | Son dakika uçak ve otobüs biletleri |
| **DreamVacations** | Pull | Lüks tatil ve cruise turları |

### 3. Offerlar (6 adet)

#### 🎁 Sürpriz Turlar (3 adet)

| ID | Başlık | Kalkış | Fiyat | Süre |
|----|--------|--------|-------|------|
| TOUR-KAPA-001 | Kapadokya Balon Turu - Sürpriz Paket | 48 saat | 2.800 ₺ | - |
| CRUSE-BOD-001 | Akdeniz Cruise Turu - Sürpriz Rota | 60 saat | 5.500 ₺ | 3g 4g |
| TOUR-PAM-999 | Sürpriz Termal Tur Paketi | 54 saat | 1.800 ₺ | 1g 2g |

**Özellikler:**
- ✅ `isSurprise: true`
- ✅ Destinasyon gizli
- ✅ Kırmızı çerçeve ile gösterilir
- ✅ Ana sayfada en üstte

#### ✈️ Uçak Biletleri (2 adet)

| ID | Rota | Kalkış | Fiyat | Koltuk |
|----|------|--------|-------|--------|
| FLT-IST-AYT-2024 | İstanbul → Antalya | 30 saat | 450 ₺ | 12/180 |
| FLT-IZM-BJV-789 | İzmir → Bodrum | 24 saat | 650 ₺ | 2/75 |

#### 🚌 Otobüs Biletleri (1 adet)

| ID | Rota | Kalkış | Fiyat | Koltuk |
|----|------|--------|-------|--------|
| BUS-IST-ANK-456 | İstanbul - Ankara | 36 saat | 350 ₺ | 5/45 |

## 🎨 Kategorilere Göre Dağılım

```
Tour    : 2 adet (1 normal + 2 sürpriz)
Flight  : 2 adet
Bus     : 1 adet
Cruise  : 1 adet (sürpriz)
───────────────────────
TOPLAM  : 6 adet
```

## ⏰ Kalkış Zamanları

Tüm offerlar **24-72 saat** içinde kalkış yapacak şekilde oluşturulur:

```typescript
const hoursFromNow = (hours: number) => 
  new Date(now.getTime() + hours * 60 * 60 * 1000);

// Örnekler
hoursFromNow(24)  // 24 saat sonra
hoursFromNow(48)  // 48 saat sonra (2 gün)
hoursFromNow(72)  // 72 saat sonra (3 gün)
```

| Offer | Kalkış Zamanı | Saat |
|-------|---------------|------|
| İzmir → Bodrum | Şimdiden 24 saat sonra | 24h |
| İstanbul → Antalya | Şimdiden 30 saat sonra | 30h |
| İstanbul - Ankara | Şimdiden 36 saat sonra | 36h |
| Kapadokya Sürpriz | Şimdiden 48 saat sonra | 48h |
| Pamukkale Sürpriz | Şimdiden 54 saat sonra | 54h |
| Cruise Sürpriz | Şimdiden 60 saat sonra | 60h |

## 💰 Fiyat Aralıkları

| Kategori | Min | Max |
|----------|-----|-----|
| Bus | 350 ₺ | 350 ₺ |
| Flight | 450 ₺ | 650 ₺ |
| Tour | 1.800 ₺ | 2.800 ₺ |
| Cruise | 5.500 ₺ | 5.500 ₺ |

**Not:** Tüm fiyatlar `priceMinor` (kuruş) cinsinden database'de saklanır:
- 350 ₺ → 35000 kuruş
- 2.800 ₺ → 280000 kuruş

## 🎯 Ana Sayfada Görünüm

### Sıralama

```
┌────────────────────────────────┐
│ 🎁 Kapadokya Sürpriz (48h)     │ ← Sürpriz 1
└────────────────────────────────┘
┌────────────────────────────────┐
│ 🎁 Pamukkale Sürpriz (54h)     │ ← Sürpriz 2
└────────────────────────────────┘
┌────────────────────────────────┐
│ 🎁 Cruise Sürpriz (60h)        │ ← Sürpriz 3
└────────────────────────────────┘
──────────────────────────────────
┌────────────────────────────────┐
│ İzmir → Bodrum (24h)           │ ← Normal 1 (en yakın)
└────────────────────────────────┘
┌────────────────────────────────┐
│ İstanbul → Antalya (30h)       │ ← Normal 2
└────────────────────────────────┘
┌────────────────────────────────┐
│ İstanbul - Ankara (36h)        │ ← Normal 3
└────────────────────────────────┘
```

## 🔧 Teknik Detaylar

### Upsert Kullanımı

```typescript
await prisma.offer.upsert({
  where: {
    vendor_offer_unique: {
      vendorOfferId: 'TOUR-KAPA-001',
      supplierId: supplier1.id,
    },
  },
  update: {},  // Varsa güncelleme (boş = güncelleme yok)
  create: {    // Yoksa oluştur
    supplierId: supplier1.id,
    vendorOfferId: 'TOUR-KAPA-001',
    // ... diğer alanlar
  },
});
```

**Avantajları:**
- ✅ Script birden fazla çalıştırılabilir
- ✅ Mevcut veriler korunur
- ✅ Yeni veriler eklenir

### Unique Constraint

```prisma
@@unique([vendorOfferId, supplierId], name: "vendor_offer_unique")
```

Aynı tedarikçiden aynı vendorOfferId ile iki teklif olamaz.

## 🧪 Test Senaryoları

### Senaryo 1: İlk Seed
```bash
npm run db:seed
```
**Sonuç:**
- ✅ 3 kullanıcı oluşturuldu
- ✅ 3 tedarikçi oluşturuldu
- ✅ 6 offer oluşturuldu

### Senaryo 2: Tekrar Seed
```bash
npm run db:seed
```
**Sonuç:**
- ✅ Kullanıcılar zaten var (update yok)
- ✅ Tedarikçiler zaten var (update yok)
- ✅ Offerlar zaten var (update yok)
- ✅ Hata yok, duplicate oluşmadı

### Senaryo 3: Database Sıfırlama
```bash
# SQLite dosyasını sil
rm prisma/dev.db

# Yeniden oluştur
npm run db:push
npm run db:seed
```
**Sonuç:**
- ✅ Temiz database
- ✅ Yeni veriler

## 📝 Özelleştirme

### Yeni Offer Eklemek

```typescript
// prisma/seed.ts dosyasına ekle

const offer7 = await prisma.offer.upsert({
  where: {
    vendor_offer_unique: {
      vendorOfferId: 'UNIQUE-ID-HERE',
      supplierId: supplier1.id,
    },
  },
  update: {},
  create: {
    supplierId: supplier1.id,
    vendorOfferId: 'UNIQUE-ID-HERE',
    category: 'tour', // tour, bus, flight, cruise
    title: 'Antalya Kemer Turu',
    from: 'Antalya',
    to: 'Kemer',
    startAt: hoursFromNow(42), // 42 saat sonra
    seatsTotal: 25,
    seatsLeft: 10,
    priceMinor: 150000, // 1500 TRY
    currency: 'TRY',
    image: '/images/hero-1.jpg',
    terms: 'İptal koşulları...',
    transport: 'Otobüs ile',
    isSurprise: false,
    requiresPassport: false,
    requiresVisa: false,
    rawJson: JSON.stringify({ custom: 'data' }),
    status: 'active',
  },
});
```

### Kalkış Zamanını Değiştirme

```typescript
// Bugünden itibaren
startAt: new Date()  // Şimdi

// X gün sonra
startAt: new Date(Date.now() + X * 24 * 60 * 60 * 1000)

// Belirli bir tarih
startAt: new Date('2025-10-10T14:00:00Z')
```

## 🔍 Veritabanı Kontrolü

### Prisma Studio
```bash
npm run db:studio
```
Tarayıcıda açılır: `http://localhost:5555`

### SQL Query
```sql
-- Tüm offerları listele
SELECT * FROM Offer WHERE status = 'active';

-- Sürpriz turları listele
SELECT * FROM Offer WHERE isSurprise = true;

-- Fiyata göre sırala
SELECT * FROM Offer ORDER BY priceMinor ASC;

-- Kategoriye göre say
SELECT category, COUNT(*) as count 
FROM Offer 
GROUP BY category;
```

## 🎓 Öğrenme Noktaları

### 1. Upsert Pattern
```typescript
// Eğer varsa güncelle, yoksa oluştur
prisma.model.upsert({
  where: { unique_field },
  update: { /* güncelleme */ },
  create: { /* oluşturma */ },
})
```

### 2. Dinamik Tarihler
```typescript
// Sabit tarih yerine dinamik tarih kullan
const now = new Date();
const future = new Date(now.getTime() + hours * 3600000);
```

### 3. PriceMinor Format
```typescript
// Major → Minor
2800 TRY → 280000 kuruş (* 100)

// Minor → Major
280000 kuruş → 2800 TRY (/ 100)
```

## 📋 Checklist

Seed script'i çalıştırmadan önce:
- [ ] Prisma client oluşturuldu mu? (`npm run db:generate`)
- [ ] Database schema güncel mi? (`npm run db:push`)
- [ ] .env dosyası var mı?
- [ ] DATABASE_URL doğru mu?

Seed sonrası kontrol:
- [ ] Kullanıcılar oluşturuldu mu?
- [ ] Tedarikçiler oluşturuldu mu?
- [ ] 6 offer oluşturuldu mu?
- [ ] Ana sayfada offerlar görünüyor mu?
- [ ] Sürpriz turlar kırmızı çerçeveli mi?

## 🚨 Sorun Giderme

### Problem: "Unique constraint failed"
**Sebep:** Aynı vendorOfferId + supplierId zaten var.
**Çözüm:** Normal davranış, upsert olduğu için sorun yok.

### Problem: "Table does not exist"
**Sebep:** Migration yapılmamış.
**Çözüm:** 
```bash
npm run db:push
npm run db:seed
```

### Problem: Tarihler geçmişte
**Sebep:** Seed eskiden çalıştırıldı, tarihler dinamik.
**Çözüm:**
```bash
# Offerleri temizle
# Prisma Studio'da Offer tablosunu temizle
# Veya
npm run db:seed  # Tekrar çalıştır
```

## 📚 İlgili Dosyalar

- **Seed Script:** `prisma/seed.ts`
- **Package.json:** `"db:seed": "tsx prisma/seed.ts"`
- **Schema:** `prisma/schema.prisma`
- **Database:** `prisma/dev.db`

---

**Version:** 1.0.0  
**Last Updated:** Ekim 4, 2025  
**Database:** SQLite (dev), PostgreSQL (prod)

