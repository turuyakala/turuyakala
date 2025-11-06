# 📊 Offer Tablosu Geçişi - Ana Sayfa Güncellemesi

Ana sayfa artık **Offer** tablosundan veri okuyor (eskiden InventoryItem'den okuyordu).

## 🔄 Değişiklikler

### 1. Database Değişiklikleri

**Offer modeline eklenen alanlar:**
```prisma
model Offer {
  // ... mevcut alanlar
  
  // Flags (YENİ)
  isSurprise        Boolean  @default(false)  // Sürpriz tur mu?
  requiresVisa      Boolean  @default(false)  // Vize gerekli mi?
  requiresPassport  Boolean  @default(false)  // Pasaport gerekli mi?
  
  // Status (güncellendi)
  status            String   @default("new") // new, imported, ignored, expired, active
  
  // Indexes (yeni)
  @@index([isSurprise])
  @@index([category])
}
```

**Migration:** `20251004031614_add_flags_to_offer`

### 2. Ana Sayfa Değişiklikleri (`src/app/page.tsx`)

#### Önceki Davranış:
```typescript
// InventoryItem tablosundan oku
const tours = await prisma.inventoryItem.findMany({
  where: { 
    category: 'tour',
    status: 'active',
    ...
  }
});
```

#### Yeni Davranış:
```typescript
// Offer tablosundan oku
const tours = await prisma.offer.findMany({
  where: {
    category: 'tour',
    status: 'active', // ✅ Sadece active offerler
    startAt: {
      gte: now,        // ✅ Şimdiden sonra
      lte: windowEnd,  // ✅ 72 saat içinde
    }
  }
});
```

### 3. Sürpriz Turlar

**Özellikler:**
- ✅ İlk 3 sürpriz tur (`isSurprise: true`) üstte gösterilir
- ✅ Kırmızı çerçeveli (`ring-4 ring-red-500`)
- ✅ Ana sorgudan hariç tutulur (filtrelerde görünmez)
- ✅ Destinasyon gizli (from/to gösterilmez)

```typescript
// Sürpriz turları getir (ilk 3)
const surpriseTours = await prisma.offer.findMany({
  where: {
    category: 'tour',
    isSurprise: true,
    status: 'active',
    startAt: { gte: now, lte: windowEnd },
  },
  take: 3,
});

// Normal turları getir (sürpriz hariç)
const regularTours = await prisma.offer.findMany({
  where: {
    ...where,
    isSurprise: false, // ✅ Sürpriz turları hariç tut
  },
});

// Birleştir: Sürpriz turlar önce
const allTours = [...surpriseTours, ...regularTours];
```

### 4. Fiyat Filtresi Uyumlandırması

**Önceki:** `price` alanı (TRY cinsinden)
```typescript
where.price = {
  gte: parseFloat(params.minPrice),
  lte: parseFloat(params.maxPrice),
};
```

**Yeni:** `priceMinor` alanı (kuruş cinsinden)
```typescript
where.priceMinor = {
  gte: parseFloat(params.minPrice) * 100, // TRY → kuruş
  lte: parseFloat(params.maxPrice) * 100, // TRY → kuruş
};
```

### 5. Sıralama Uyumlandırması

**Önceki:**
```typescript
case 'price-asc':
  orderBy = { price: 'asc' };
```

**Yeni:**
```typescript
case 'price-asc':
  orderBy = { priceMinor: 'asc' }; // ✅ priceMinor kullan
```

## 🧪 Test Senaryosu

### Adım 1: Mock Tedarikçi Oluştur

```
Admin Panel → Tedarikçiler → + Yeni Tedarikçi Ekle

Tedarikçi Adı: Test Supplier
Entegrasyon Modu: Pull (Çek)
API URL: http://localhost:3000/api/test/mock-supplier
Durum: Aktif ✓
```

### Adım 2: Senkronize Et

1. Tedarikçiler listesinde **🔄 Şimdi Senkronize Et** butonuna tıklayın
2. Toast bildirimi:
   ```
   Test Supplier senkronize edildi!
   ✅ Eklenen: 50
   🔄 Güncellenen: 0
   ❌ Başarısız: 0
   ```

### Adım 3: Ana Sayfayı Kontrol Et

Ana sayfada görmelisiniz:
- **Üstte 3 sürpriz tur** (kırmızı çerçeveli, 🎁 simgeli)
- **Altında normal turlar** (fiyat/tarih sıralaması ile)

### Adım 4: Filtreleri Test Et

#### Fiyat Filtresi:
```
Min: 1000 TRY
Max: 2000 TRY
```
→ Sadece 1000-2000 TRY arası turlar görünmeli
→ Sürpriz turlar üstte kalmalı (fiyatları aralıkta ise)

#### Sıralama:
```
Fiyat (Artan)
```
→ Sürpriz turlar en üstte
→ Normal turlar fiyata göre sıralı

## 📊 Veritabanı Kontrolü

```bash
npm run db:studio
```

**Offer tablosunu açın:**
- `status = 'active'` olan kayıtları kontrol edin
- `isSurprise = true` olan 3 kayıt olmalı
- `priceMinor` alanı dolu olmalı (kuruş cinsinden)

## 🔍 SQL Query Örnekleri

### Active Offerler:
```sql
SELECT * FROM Offer 
WHERE status = 'active' 
  AND category = 'tour'
  AND startAt >= datetime('now')
ORDER BY startAt ASC;
```

### Sürpriz Turlar:
```sql
SELECT * FROM Offer 
WHERE status = 'active' 
  AND isSurprise = true
ORDER BY startAt ASC 
LIMIT 3;
```

### Fiyat Aralığı:
```sql
SELECT * FROM Offer 
WHERE status = 'active'
  AND priceMinor >= 100000  -- 1000 TRY * 100
  AND priceMinor <= 200000  -- 2000 TRY * 100
ORDER BY priceMinor ASC;
```

## 🎯 Karşılaştırma

| Özellik | Önceki (InventoryItem) | Yeni (Offer) |
|---------|------------------------|--------------|
| Veri Kaynağı | Manuel/İşlenmiş | Tedarikçi API |
| Senkronizasyon | Manuel | Otomatik (Pull) |
| Fiyat Alanı | `price` (TRY) | `priceMinor` (kuruş) |
| Status | 'active', 'inactive' | 'active', 'new', 'expired' |
| Sürpriz Tur | ✅ | ✅ (yeni eklendi) |
| Filtreler | ✅ | ✅ (uyumlandı) |

## 🚀 Production Deployment

### 1. Migration Uygula
```bash
npx prisma migrate deploy
```

### 2. Mevcut Verileri Migrate Et (Opsiyonel)

Eğer InventoryItem'deki veriler Offer'a taşınacaksa:
```typescript
// scripts/migrate-inventory-to-offer.ts
import { prisma } from '@/lib/prisma';

async function migrateInventoryToOffer() {
  const items = await prisma.inventoryItem.findMany({
    where: { status: 'active' },
    include: { supplier: true },
  });

  for (const item of items) {
    await prisma.offer.create({
      data: {
        supplierId: item.supplierId || 'default-supplier-id',
        vendorOfferId: item.id, // Use existing ID as vendorOfferId
        category: item.category,
        title: item.title,
        from: item.from,
        to: item.to,
        startAt: item.startAt,
        seatsTotal: item.seatsTotal,
        seatsLeft: item.seatsLeft,
        priceMinor: item.priceMinor,
        currency: item.currency,
        image: item.image,
        terms: item.terms,
        transport: item.transport,
        isSurprise: item.isSurprise,
        requiresVisa: item.requiresVisa,
        requiresPassport: item.requiresPassport,
        rawJson: JSON.stringify(item),
        status: 'active',
      },
    });
  }

  console.log(`Migrated ${items.length} items`);
}

migrateInventoryToOffer();
```

### 3. Test Production

```bash
# Production ortamında test et
curl https://yourdomain.com/api/test/mock-supplier
```

## ⚠️ Önemli Notlar

1. **Status:** Offerler senkronize edildiğinde otomatik olarak `status = 'active'` olur
2. **Fiyat:** Tüm fiyatlar `priceMinor` (kuruş) cinsinden saklanır
3. **Sürpriz Turlar:** Maximum 3 sürpriz tur ana sayfada gösterilir
4. **Filtreler:** Sürpriz turlar filtrelenmez, her zaman en üstte kalır
5. **Pencere:** Sadece 72 saat içindeki turlar gösterilir

## 🐛 Sorun Giderme

### Problem: Ana sayfada hiç tur görünmüyor
**Çözüm:**
```sql
-- Offer tablosunda veri var mı?
SELECT COUNT(*) FROM Offer WHERE status = 'active';

-- Yoksa mock supplier'dan senkronize et
```

### Problem: Sürpriz turlar görünmüyor
**Çözüm:**
```sql
-- isSurprise true olan kayıt var mı?
SELECT * FROM Offer WHERE isSurprise = true AND status = 'active';

-- Yoksa manuel ekle veya mock supplier'dan çek
```

### Problem: Fiyat filtresi çalışmıyor
**Çözüm:**
- URL'de fiyat kuruş değil TRY cinsinden olmalı
- Örnek: `?minPrice=1000&maxPrice=2000`
- Backend otomatik olarak kuruşa çevirir

## 📚 İlgili Dosyalar

- `src/app/page.tsx` - Ana sayfa (Offer query)
- `src/app/api/test/mock-supplier/route.ts` - Test endpoint
- `src/app/api/admin/suppliers/[id]/sync-now/route.ts` - Senkronizasyon
- `lib/integrations/mappers/mapToOffer.ts` - Mapper
- `prisma/schema.prisma` - Database schema
- `components/OfferCard.tsx` - Sürpriz tur UI

---

**Son Güncelleme:** Ekim 4, 2025  
**Version:** 2.0.0

