# Tedarikçi Senkronizasyon Kılavuzu

Bu kılavuz, tedarikçi entegrasyonlarının nasıl kurulup senkronize edileceğini açıklar.

## 📋 İçindekiler

1. [Tedarikçi Ekleme](#tedarikçi-ekleme)
2. [API Senkronizasyonu](#api-senkronizasyonu)
3. [Mapper Sistemi](#mapper-sistemi)
4. [Hata Yönetimi](#hata-yönetimi)
5. [Test ve Debug](#test-ve-debug)

## 1. Tedarikçi Ekleme

### Admin Panelinden Ekleme

1. Admin Paneline giriş yapın (`/admin`)
2. **Tedarikçiler** sayfasına gidin (`/admin/suppliers`)
3. **+ Yeni Tedarikçi Ekle** butonuna tıklayın
4. Formu doldurun:

```
Tedarikçi Adı: TourVision API
Açıklama: TourVision tedarikçi entegrasyonu
Entegrasyon Modu: Pull (Çek)
API URL: https://api.tourvision.com/v1/offers
API Key: your-api-key-here
Healthcheck URL: https://api.tourvision.com/v1/health
Durum: Aktif ✓
```

### Entegrasyon Modları

| Mod | Açıklama | Kullanım |
|-----|----------|----------|
| **Pull** | Sistemimiz tedarikçi API'sinden veri çeker | Otomatik senkronizasyon |
| **Push** | Tedarikçi sistemimize veri gönderir | Webhook ile |
| **CSV** | CSV dosyası ile manuel import | Manuel yükleme |

## 2. API Senkronizasyonu

### Manuel Senkronizasyon

Tedarikçiler listesinde **🔄 Şimdi Senkronize Et** butonuna tıklayın.

### Senkronizasyon Süreci

```
1. Tedarikçi API'sine bağlan
   ├─ Credential'ları çöz (decrypt)
   ├─ Authorization header ekle
   └─ GET request gönder

2. Verileri al (pagination desteği)
   ├─ Sayfa 1, 2, 3... (maksimum 10 sayfa)
   ├─ Her sayfada 100 kayıt
   └─ Toplam veri topla

3. Mapper'dan geçir
   ├─ Her offer için mapToOffer() çağır
   ├─ Başarılı olanları kaydet
   └─ Hatalı olanları logla

4. Veritabanına upsert et
   ├─ Yeni offer → INSERT
   ├─ Mevcut offer → UPDATE
   └─ Eski offerler → status='expired'

5. Sonuçları raporla
   ├─ ✅ Eklenen: X
   ├─ 🔄 Güncellenen: Y
   └─ ❌ Başarısız: Z
```

### API Response Formatları

Sistem farklı tedarikçi response formatlarını destekler:

#### Format 1: Direkt Array
```json
[
  {
    "vendorOfferId": "TOUR-001",
    "category": "tour",
    "title": "Kapadokya Turu",
    ...
  }
]
```

#### Format 2: Nested Object
```json
{
  "offers": [
    { "vendorOfferId": "TOUR-001", ... }
  ],
  "total": 50,
  "hasMore": false
}
```

#### Format 3: Data Wrapper
```json
{
  "data": {
    "results": [
      { "vendorOfferId": "TOUR-001", ... }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "hasNext": false
    }
  }
}
```

## 3. Mapper Sistemi

### Gerekli Alanlar

Tedarikçi API'sinden gelen her offer şu alanları **içermeli**:

| Alan | Tip | Örnek | Açıklama |
|------|-----|-------|----------|
| `vendorOfferId` | string/number | "TOUR-001" | Tedarikçinin benzersiz ID'si |
| `category` | string | "tour" | tour, bus, flight, cruise |
| `title` | string | "Kapadokya Turu" | Teklif başlığı |
| `from` | string | "İstanbul" | Kalkış yeri |
| `to` | string | "Kapadokya" | Varış yeri |
| `startAt` | string/Date | "2025-10-15T06:00:00Z" | ISO tarih |
| `seatsTotal` | number | 20 | Toplam koltuk |
| `seatsLeft` | number | 5 | Kalan koltuk |
| `price` | number | 2800 | Fiyat (TRY) |

### Opsiyonel Alanlar

| Alan | Tip | Açıklama |
|------|-----|----------|
| `currency` | string | Para birimi (varsayılan: TRY) |
| `image` | string | Ana görsel URL |
| `terms` | string | İptal koşulları |
| `transport` | string | Ulaşım şekli |

### Fiyat Normalizasyonu

Sistem otomatik olarak fiyatları **minor units** (kuruş) cinsine çevirir:

```typescript
// Tedarikçiden gelen veri
{
  "price": 2800,         // 2800 TRY
  "currency": "TRY"
}

// Mapper çıktısı
{
  "priceMinor": 280000,  // 280000 kuruş (2800 TRY * 100)
  "currency": "TRY"
}
```

### Tarih Normalizasyonu

Farklı tarih formatları kabul edilir:

```typescript
"2025-10-15T06:00:00Z"    → Date object ✅
"2025-10-15"              → Date object ✅
1728972000000             → Date object ✅
```

## 4. Hata Yönetimi

### Yaygın Hatalar ve Çözümleri

#### ❌ "Tedarikçi için API URL tanımlanmamış"
**Çözüm:** Tedarikçi ayarlarından API URL ekleyin.

#### ❌ "API returned 401: Unauthorized"
**Çözüm:** API Key veya authentication bilgilerini kontrol edin.

#### ❌ "Mapping validation failed: title: Required field missing"
**Çözüm:** Tedarikçi API'si gerekli alanları göndermiyor. API response'u kontrol edin.

#### ❌ "Failed to convert price: invalid"
**Çözüm:** Fiyat alanı geçersiz. Tedarikçi API'sinde fiyat formatını kontrol edin.

### Hata Loglama

Başarısız mappingler console'a loglanır:

```
Fetched 150 offers from TourVision API (2 pages)
Failed to upsert offer TOUR-123: Validation error
```

Toast bildiriminde ilk 5 hata gösterilir.

## 5. Test ve Debug

### Bağlantı Testi

1. Tedarikçiler sayfasında **🔍 Bağlantı Testi** butonuna tıklayın
2. Sistem `healthcheckUrl`'e istek gönderir
3. Sonuç: ✅ Başarılı veya ❌ Başarısız

### Manuel API Testi

```bash
# Terminal'den test
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.tourvision.com/v1/offers?page=1&limit=10
```

### Debug Modu

API route'da console.log'lar ekleyerek debug yapabilirsiniz:

```typescript
// src/app/api/admin/suppliers/[id]/sync-now/route.ts
console.log('Fetched data:', data);
console.log('Successful mappings:', successful.length);
console.log('Failed mappings:', failed);
```

### Test Tedarikçisi Oluşturma

Gerçek bir tedarikçi API'si yoksa, mock bir endpoint oluşturabilirsiniz:

```typescript
// src/app/api/test/mock-supplier/route.ts
export async function GET() {
  return Response.json([
    {
      vendorOfferId: "TEST-001",
      category: "tour",
      title: "Test Tour",
      from: "Istanbul",
      to: "Antalya",
      startAt: new Date(Date.now() + 86400000).toISOString(),
      seatsTotal: 20,
      seatsLeft: 5,
      price: 1500,
      currency: "TRY"
    }
  ]);
}
```

## 📊 Performans

### Senkronizasyon Süreleri

| Veri Miktarı | Tahmini Süre |
|--------------|--------------|
| 100 offer | ~2-5 saniye |
| 500 offer | ~10-15 saniye |
| 1000 offer | ~20-30 saniye |

### Optimizasyon İpuçları

1. **Pagination**: API'den her seferde 100 kayıt çekin
2. **Timeout**: 30 saniye timeout ayarlayın
3. **Retry**: Hata durumunda 3 kez deneyin
4. **Cron Job**: Otomatik senkronizasyon için cron job kurun

## 🔄 Otomatik Senkronizasyon

### Cron Job Kurulumu

```typescript
// lib/cron/sync-suppliers.ts
export async function syncAllSuppliers() {
  const suppliers = await prisma.supplier.findMany({
    where: { 
      isActive: true,
      integrationMode: 'pull'
    }
  });

  for (const supplier of suppliers) {
    await fetch(`/api/admin/suppliers/${supplier.id}/sync-now`, {
      method: 'POST'
    });
  }
}

// Her 6 saatte bir çalıştır
// 0 */6 * * * (cron expression)
```

## 📝 Checklist

Yeni bir tedarikçi eklerken:

- [ ] Tedarikçi bilgilerini admin panelden ekle
- [ ] API credentials doğru mu kontrol et
- [ ] Bağlantı testini çalıştır
- [ ] Manuel senkronizasyon yap
- [ ] Toast bildirimini kontrol et
- [ ] Offers sayfasından yeni kayıtları gör
- [ ] Veritabanında `Offer` tablosunu kontrol et

## 🚨 Sorun Giderme

### Problem: Senkronizasyon başlamıyor
- Tedarikçinin `isActive` true mu?
- `integrationMode` "pull" mu?
- API URL tanımlı mı?

### Problem: Tüm offerler başarısız
- API response formatını kontrol edin
- Mapper'ın beklediği alanlar mevcut mu?
- Console log ile ham veriyi inceleyin

### Problem: Bazı offerler başarısız
- Toast'ta hata mesajını okuyun
- Eksik veya geçersiz alanları düzeltin
- Tedarikçi API'sini iyileştirmesini isteyin

## 📞 Destek

Sorun yaşıyorsanız:
1. Console log'ları inceleyin
2. Network tab'de API requestleri kontrol edin
3. Veritabanını prisma studio ile inceleyin: `npm run db:studio`

