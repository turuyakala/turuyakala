# 🔌 Tedarikçi Entegrasyon Sistemi

Lastminutetour platformunun tedarikçi entegrasyon altyapısı. Farklı tedarikçilerden gelen verileri normalize edip tek bir formatta depolar.

## 📁 Dizin Yapısı

```
lib/integrations/
├── mappers/
│   ├── types.ts              # Tip tanımları
│   ├── errors.ts             # Hata sınıfları
│   ├── normalizers.ts        # Normalizasyon fonksiyonları
│   ├── mapToOffer.ts         # Ana mapper fonksiyonu
│   ├── index.ts              # Export
│   ├── examples.ts           # Kullanım örnekleri
│   ├── README.md             # Mapper dokümantasyonu
│   ├── SYNC_GUIDE.md         # Senkronizasyon kılavuzu
│   └── __tests__/
│       └── mapToOffer.test.ts
└── INTEGRATION_README.md     # Bu dosya
```

## 🚀 Hızlı Başlangıç

### 1. Yeni Tedarikçi Ekleme

```typescript
// Admin Panel → Tedarikçiler → Yeni Tedarikçi Ekle

Tedarikçi Adı: TourVision API
Entegrasyon Modu: Pull (Çek)
API URL: https://api.tourvision.com/v1/offers
API Key: your-api-key-here
Durum: Aktif ✓
```

### 2. Senkronizasyon

Admin panelde **🔄 Şimdi Senkronize Et** butonuna tıklayın.

### 3. Sonuçları Görüntüle

Toast bildirimi:
```
TourVision API senkronize edildi!
✅ Eklenen: 45
🔄 Güncellenen: 12
❌ Başarısız: 3
```

## 🎯 Özellikler

### ✅ Otomatik Normalizasyon
- Fiyat: TRY → kuruş (minor units)
- Tarih: Herhangi bir format → ISO Date
- Para birimi: Büyük/küçük harf → Normalize

### ✅ Esnek Input
- Farklı alan adları (`price`, `amount`, `cost`)
- Farklı response formatları (array, nested object)
- Pagination desteği

### ✅ Güvenli Credential Yönetimi
- Şifrelenmiş saklama (AES-256)
- Authorization header desteği
- Basic Auth / Bearer Token / API Key

### ✅ Hata Yönetimi
- Detaylı validasyon mesajları
- Toast bildirimleri
- Partial success (bazı kayıtlar başarılı, bazıları değil)

## 🔄 API Flow

```
┌─────────────────┐
│ Admin Paneli    │
│ "Senkronize Et" │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ POST /api/admin/suppliers/:id/  │
│      sync-now                    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 1. Fetch from Supplier API      │
│    - Decrypt credentials         │
│    - Add auth headers            │
│    - Handle pagination           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 2. Map to Normalized Format     │
│    mapToOfferBatch()             │
│    - Validate required fields    │
│    - Normalize price/date        │
│    - Return success/failed       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 3. Upsert to Database           │
│    - INSERT new offers           │
│    - UPDATE existing offers      │
│    - Mark old offers expired     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 4. Return Results               │
│    { inserted, updated, failed } │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Toast Bildirimi │
│ ✅ 45 eklendi   │
│ 🔄 12 güncellendi│
│ ❌ 3 başarısız  │
└─────────────────┘
```

## 📊 Veri Modelleri

### Supplier (Tedarikçi)
```typescript
{
  id: string
  name: string
  integrationMode: 'pull' | 'push' | 'csv'
  apiUrl: string
  apiKey: string (encrypted)
  isActive: boolean
}
```

### Offer (Ham Teklif)
```typescript
{
  id: string
  supplierId: string
  vendorOfferId: string
  category: 'tour' | 'bus' | 'flight' | 'cruise'
  title: string
  from: string
  to: string
  startAt: Date
  seatsTotal: number
  seatsLeft: number
  priceMinor: number (kuruş cinsinden)
  currency: 'TRY' | 'EUR' | 'USD'
  rawJson: string (orijinal veri)
  status: 'new' | 'imported' | 'ignored' | 'expired'
}
```

### InventoryItem (İşlenmiş Teklif)
```typescript
{
  id: string
  supplierId: string
  sellerId: string
  // Offer alanlarının hepsi +
  isSurprise: boolean
  requiresVisa: boolean
  requiresPassport: boolean
}
```

## 🧪 Test Etme

### Mock API Kullanımı

Test için gerçek bir tedarikçi API'sine ihtiyaç duymadan test edebilirsiniz:

```typescript
// Test tedarikçisi oluştur
API URL: http://localhost:3000/api/test/mock-supplier
API Key: test-key (opsiyonel)
Integration Mode: Pull
```

Bu endpoint 50 adet mock offer döndürür ve pagination destekler.

### Manuel Test

```bash
# Mock API'yi test et
curl http://localhost:3000/api/test/mock-supplier?page=1&limit=10

# Senkronizasyonu test et
curl -X POST http://localhost:3000/api/admin/suppliers/[supplier-id]/sync-now \
  -H "Cookie: next-auth.session-token=..."
```

## 📝 Kullanım Örnekleri

### Programatik Senkronizasyon

```typescript
import { mapToOfferBatch } from '@/lib/integrations/mappers';

// Tedarikçiden veri al
const supplierData = await fetchSupplierAPI();

// Normalize et
const { successful, failed } = mapToOfferBatch(
  supplierData,
  supplierId
);

// Veritabanına kaydet
await prisma.offer.createMany({
  data: successful,
  skipDuplicates: true
});

console.log(`✅ ${successful.length} kayıt eklendi`);
console.log(`❌ ${failed.length} kayıt başarısız`);
```

### Tek Kayıt İşleme

```typescript
import { mapToOffer } from '@/lib/integrations/mappers';

try {
  const offer = mapToOffer(supplierOffer, supplierId);
  await prisma.offer.create({ data: offer });
} catch (error) {
  if (error instanceof MappingValidationError) {
    console.error('Validasyon hataları:', error.errors);
  }
}
```

## 🔒 Güvenlik

### Credential Encryption

Tüm hassas bilgiler (API Key, Secret, Password) AES-256 ile şifrelenir:

```typescript
// Şifreleme
const encrypted = encrypt(apiKey);
await prisma.supplier.create({ 
  data: { apiKey: encrypted } 
});

// Şifre çözme (sadece senkronizasyon sırasında)
const decrypted = decrypt(supplier.apiKey);
```

### Authorization

Sadece admin kullanıcılar senkronizasyon yapabilir:

```typescript
const session = await getServerSession(authOptions);
if (!session || session.user.role !== 'admin') {
  return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
}
```

## 📚 Dokümantasyon

- **[Mapper README](./mappers/README.md)** - Mapper sistem detayları
- **[Sync Guide](./mappers/SYNC_GUIDE.md)** - Senkronizasyon kılavuzu
- **[Examples](./mappers/examples.ts)** - Kod örnekleri
- **[Tests](./mappers/__tests__/mapToOffer.test.ts)** - Test senaryoları

## 🐛 Sorun Giderme

### Yaygın Hatalar

| Hata | Sebep | Çözüm |
|------|-------|-------|
| API URL tanımlanmamış | Tedarikçi ayarlarında API URL yok | API URL ekle |
| 401 Unauthorized | Yanlış credentials | API Key kontrol et |
| Validation failed | Gerekli alanlar eksik | API response'u kontrol et |
| Timeout | API çok yavaş | Timeout süresini artır |

### Debug Modu

```typescript
// route.ts içinde
console.log('Fetched data:', data);
console.log('Mapped offers:', successful);
console.log('Failed offers:', failed);
```

## 🔮 Gelecek Geliştirmeler

- [ ] Webhook desteği (Push mode)
- [ ] CSV import/export
- [ ] Otomatik senkronizasyon (cron job)
- [ ] Rate limiting
- [ ] Retry mechanism
- [ ] Offer diff tracking (değişiklik takibi)
- [ ] Multi-supplier search
- [ ] Price comparison

## 📞 Destek

Sorun yaşıyorsanız:
1. `lib/integrations/mappers/SYNC_GUIDE.md` dökümanını inceleyin
2. Console log'ları kontrol edin
3. `npm run db:studio` ile veritabanını inceleyin
4. Mock API ile test edin

---

**Version:** 1.0.0  
**Last Updated:** Ekim 2025

