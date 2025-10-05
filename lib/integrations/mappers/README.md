# Supplier Integration - Mappers

Bu modül, tedarikçi (supplier) sistemlerinden gelen farklı formatlardaki verileri, veritabanımızdaki normalize edilmiş `Offer` modeline dönüştürür.

## Temel Özellikler

- ✅ **Tip Güvenliği**: TypeScript ile tam tip desteği
- ✅ **Fiyat Normalizasyonu**: Otomatik olarak major units → minor units (TRY → kuruş)
- ✅ **Tarih Normalizasyonu**: ISO 8601 formatına dönüştürme
- ✅ **Hata Yönetimi**: Detaylı validasyon ve hata mesajları
- ✅ **Esnek Input**: Farklı tedarikçi formatlarını destekler
- ✅ **Batch İşlem**: Çoklu kayıt dönüştürme desteği

## Kullanım

### Temel Kullanım

```typescript
import { mapToOffer } from '@/lib/integrations/mappers';

// Tedarikçiden gelen veri
const supplierData = {
  vendorOfferId: "TOUR-2024-001",
  category: "tour",
  title: "Kapadokya Balon Turu",
  from: "İstanbul",
  to: "Kapadokya",
  startAt: "2025-10-15T06:00:00Z",
  seatsTotal: 20,
  seatsLeft: 5,
  price: 2800,        // TRY (major units)
  currency: "TRY",
  image: "/images/kapadokya.jpg",
  terms: "İptal koşulları...",
  transport: "Uçak ile"
};

try {
  const normalizedOffer = mapToOffer(supplierData, "supplier-abc-123");
  
  console.log(normalizedOffer);
  // {
  //   supplierId: "supplier-abc-123",
  //   vendorOfferId: "TOUR-2024-001",
  //   category: "tour",
  //   title: "Kapadokya Balon Turu",
  //   from: "İstanbul",
  //   to: "Kapadokya",
  //   startAt: Date(2025-10-15T06:00:00.000Z),
  //   seatsTotal: 20,
  //   seatsLeft: 5,
  //   priceMinor: 280000,  // ✅ Otomatik dönüşüm: 2800 TRY → 280000 kuruş
  //   currency: "TRY",
  //   image: "/images/kapadokya.jpg",
  //   terms: "İptal koşulları...",
  //   transport: "Uçak ile",
  //   rawJson: "{...}",    // Orijinal veri JSON string olarak
  //   status: "new",
  //   importedToInventory: false
  // }
  
  // Veritabanına kaydet
  await prisma.offer.create({ data: normalizedOffer });
  
} catch (error) {
  if (error instanceof MappingValidationError) {
    console.error('Validasyon hataları:', error.errors);
    // [{ field: 'title', message: 'Required field missing', received: undefined }]
  }
}
```

### Batch İşlem

```typescript
import { mapToOfferBatch } from '@/lib/integrations/mappers';

const supplierOffers = [
  { vendorOfferId: "001", category: "tour", ... },
  { vendorOfferId: "002", category: "bus", ... },
  { vendorOfferId: "003", category: "flight", ... },
];

const result = mapToOfferBatch(supplierOffers, "supplier-id");

console.log(`Başarılı: ${result.successful.length}`);
console.log(`Başarısız: ${result.failed.length}`);

// Başarılı olanları kaydet
await prisma.offer.createMany({
  data: result.successful,
  skipDuplicates: true,
});

// Hataları logla
result.failed.forEach(({ input, error }) => {
  console.error(`Offer ${input.vendorOfferId} hatası:`, error);
});
```

## Fiyat Normalizasyonu

Farklı fiyat formatları desteklenir:

```typescript
// Format 1: Major units (TRY, EUR, USD)
{ price: 2800 }           → priceMinor: 280000 kuruş

// Format 2: Zaten minor units
{ priceMinor: 280000 }    → priceMinor: 280000 kuruş

// Format 3: Alternatif alan adları
{ amount: 2800 }          → priceMinor: 280000 kuruş
{ cost: 2800 }            → priceMinor: 280000 kuruş
```

## Tarih Normalizasyonu

Farklı tarih formatları kabul edilir:

```typescript
{ startAt: "2025-10-15T06:00:00Z" }      // ISO 8601 ✅
{ startAt: "2025-10-15" }                 // ISO Date ✅
{ startAt: 1728972000000 }                // Unix timestamp ✅
{ startAt: new Date() }                   // Date object ✅
```

## Hata Yönetimi

### Validasyon Hataları

```typescript
import { 
  MappingValidationError,
  RequiredFieldError,
  PriceConversionError,
  DateConversionError 
} from '@/lib/integrations/mappers';

try {
  mapToOffer(invalidData, supplierId);
} catch (error) {
  if (error instanceof MappingValidationError) {
    // Tüm validasyon hatalarını içerir
    error.errors.forEach(({ field, message, received }) => {
      console.error(`${field}: ${message}`, received);
    });
  }
  
  if (error instanceof RequiredFieldError) {
    // Eksik zorunlu alan
    console.error('Eksik alan:', error.message);
  }
  
  if (error instanceof PriceConversionError) {
    // Fiyat dönüşüm hatası
    console.error('Geçersiz fiyat:', error.message);
  }
  
  if (error instanceof DateConversionError) {
    // Tarih dönüşüm hatası
    console.error('Geçersiz tarih:', error.message);
  }
}
```

## Zorunlu Alanlar

| Alan | Tip | Açıklama |
|------|-----|----------|
| `vendorOfferId` | string/number | Tedarikçinin teklifine verdiği benzersiz ID |
| `category` | string | tour, bus, flight, cruise |
| `title` | string | Teklifin başlığı |
| `from` | string | Kalkış yeri |
| `to` | string | Varış yeri |
| `startAt` | string/Date | Başlangıç tarihi (ISO formatına çevrilir) |
| `seatsTotal` | number | Toplam koltuk sayısı |
| `seatsLeft` | number | Kalan koltuk sayısı |
| `price` veya `priceMinor` | number | Fiyat (minor units'e çevrilir) |

## Opsiyonel Alanlar

| Alan | Tip | Açıklama |
|------|-----|----------|
| `currency` | string | Para birimi (varsayılan: TRY) |
| `image` | string | Ana görsel URL |
| `terms` | string | İptal koşulları |
| `transport` | string | Ulaşım şekli |

## Test Senaryoları

```typescript
// ✅ Geçerli veri
mapToOffer({
  vendorOfferId: "123",
  category: "tour",
  title: "Test Tour",
  from: "A",
  to: "B",
  startAt: "2025-10-15T06:00:00Z",
  seatsTotal: 20,
  seatsLeft: 5,
  price: 100
}, "supplier-id");

// ❌ Eksik zorunlu alan
mapToOffer({
  vendorOfferId: "123",
  category: "tour",
  // title eksik!
  from: "A",
  to: "B",
  ...
}, "supplier-id");
// Throws: RequiredFieldError

// ❌ Geçersiz fiyat
mapToOffer({
  ...
  price: "invalid"
}, "supplier-id");
// Throws: PriceConversionError

// ❌ Geçersiz tarih
mapToOffer({
  ...
  startAt: "not-a-date"
}, "supplier-id");
// Throws: DateConversionError
```

## API Entegrasyonu Örneği

```typescript
// API route: /api/admin/suppliers/[id]/sync

import { mapToOfferBatch } from '@/lib/integrations/mappers';

export async function POST(req: Request) {
  const { supplierId } = await req.json();
  
  // Tedarikçi API'sinden veri çek
  const supplierData = await fetchSupplierAPI(supplierId);
  
  // Batch dönüştürme
  const { successful, failed } = mapToOfferBatch(
    supplierData.offers,
    supplierId
  );
  
  // Başarılı olanları kaydet
  await prisma.offer.createMany({
    data: successful,
    skipDuplicates: true,
  });
  
  return Response.json({
    imported: successful.length,
    failed: failed.length,
    errors: failed,
  });
}
```

## Geliştirme Notları

- Fiyat heuristiği: 100'ün altındaki değerler major units, üstü minor units kabul edilir
- Desteklenmeyen para birimleri otomatik olarak TRY'ye çevrilir (warning ile)
- rawJson alanı debugging için orijinal veriyi saklar
- Tüm string alanları otomatik olarak trim edilir

