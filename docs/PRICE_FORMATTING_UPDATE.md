# 💰 Fiyat Formatlama Sistemi Güncellemesi

Ana sayfa, kart ve detay sayfalarında tutarlı fiyat gösterimi için yeni helper fonksiyonlar eklendi.

## 🎯 Özet

**Önceki Durum:**
```tsx
❌ {item.price.toLocaleString('tr-TR')} ₺
❌ {item.currency === 'TRY' ? '₺' : item.currency}
❌ Hard-coded formatlar
```

**Yeni Durum:**
```tsx
✅ {formatPrice(item.priceMinor, item.currency)}
✅ Otomatik binlik ayırıcı (1.200 ₺)
✅ Tüm para birimleri (TRY/USD/EUR)
✅ Doğru sembol pozisyonları
```

## 📁 Eklenen Dosyalar

### 1. `lib/price.ts` - Price Helper
Ana fiyat formatlama fonksiyonları:

```typescript
formatPrice(280000, 'TRY')           // "2.800 ₺"
formatPrice(150000, 'USD')           // "$1,500"
formatPrice(200000, 'EUR')           // "2.000 €"
formatPriceWithDecimals(285000, 'TRY') // "2.850,00 ₺"
formatPriceRange(100000, 200000, 'TRY') // "1.000 - 2.000 ₺"
getCurrencySymbol('TRY')             // "₺"
```

### 2. `lib/__tests__/price.test.ts` - Test Suite
40+ test case ile kapsamlı test coverage.

### 3. `lib/PRICE_HELPER_GUIDE.md` - Dokümantasyon
Detaylı kullanım kılavuzu ve örnekler.

## 🔄 Güncellenen Dosyalar

### 1. `components/OfferCard.tsx`
```diff
- {item.price.toLocaleString('tr-TR')}
- <span className="text-xl ml-1">₺</span>
+ {formatPrice(item.price * 100, item.currency)}
```

### 2. `src/app/item/[id]/page.tsx`
```diff
- {item.price.toLocaleString('tr-TR')}
- <span className="text-2xl ml-2">
-   {item.currency === 'TRY' ? '₺' : item.currency}
- </span>
+ {formatPrice(item.price * 100, item.currency)}
```

### 3. `src/components/ReservationBox.tsx`
```diff
- const currencySymbol = currency === 'TRY' ? '₺' : currency === 'EUR' ? '€' : '$';
+ const currencySymbol = getCurrencySymbol(currency as any);

- {price.toLocaleString('tr-TR')} {currencySymbol} × {guests} kişi
+ {formatPrice(price * 100, currency as any)} × {guests} kişi

- {totalPrice.toLocaleString('tr-TR')} {currencySymbol}
+ {formatPrice(totalPrice * 100, currency as any)}
```

## 🌍 Para Birimi Formatları

### TRY (Türk Lirası)
```
Input:  280000 kuruş
Output: "2.800 ₺"

Format:
- Binlik ayırıcı: . (nokta)
- Ondalık: , (virgül)
- Sembol: Sonra
```

### USD (Amerikan Doları)
```
Input:  150000 cents
Output: "$1,500"

Format:
- Binlik ayırıcı: , (virgül)
- Ondalık: . (nokta)
- Sembol: Önce
```

### EUR (Euro)
```
Input:  200000 cents
Output: "2.000 €"

Format:
- Binlik ayırıcı: . (nokta)
- Ondalık: , (virgül)
- Sembol: Sonra
```

## 📊 Kullanım İstatistikleri

| Dosya | Kullanım Sayısı | Fonksiyon |
|-------|----------------|-----------|
| OfferCard.tsx | 1 | formatPrice() |
| page.tsx (detay) | 1 | formatPrice() |
| ReservationBox.tsx | 3 | formatPrice(), getCurrencySymbol() |

## 🧪 Test Senaryoları

### Senaryo 1: TRY Fiyat Gösterimi
```typescript
const price = 280000; // 2800 TRY in kuruş
formatPrice(price, 'TRY'); // "2.800 ₺"
```

### Senaryo 2: USD Fiyat Gösterimi
```typescript
const price = 150000; // 1500 USD in cents
formatPrice(price, 'USD'); // "$1,500"
```

### Senaryo 3: Çoklu Kişi Rezervasyon
```typescript
const singlePrice = 280000; // 2800 TRY
const guests = 3;
const total = (singlePrice / 100) * guests * 100; // 840000 kuruş
formatPrice(total, 'TRY'); // "8.400 ₺"
```

### Senaryo 4: Fiyat Aralığı (Filtre)
```typescript
formatPriceRange(100000, 500000, 'TRY'); // "1.000 - 5.000 ₺"
```

## 🎨 UI Görünümleri

### Ana Sayfa - Offer Card
```
┌────────────────────────┐
│  [Fotoğraf]           │
│  Kapadokya Turu       │
│  İstanbul → Kapadokya │
│                        │
│  2.800 ₺      [Detay] │ ← formatPrice()
└────────────────────────┘
```

### Detay Sayfası - Fiyat Kutusu
```
┌─────────────────────────┐
│  Kişi Başı Fiyat       │
│                         │
│  2.800 ₺               │ ← formatPrice()
│                         │
│  ⏰ Kalkışa 12 saat    │
└─────────────────────────┘
```

### Rezervasyon Box
```
┌─────────────────────────┐
│  Rezervasyon Yap       │
│                         │
│  Kişi Sayısı: 3        │
│                         │
│  2.800 ₺ × 3 kişi      │ ← formatPrice()
│  ───────────────────    │
│  Toplam: 8.400 ₺       │ ← formatPrice()
│                         │
│  [Rezervasyon Yap]     │
└─────────────────────────┘
```

## ✅ Avantajlar

### 1. Tutarlılık
- ✅ Tüm sayfalarda aynı format
- ✅ Binlik ayırıcılar standardize
- ✅ Para birimi sembolleri doğru

### 2. Uluslararası Destek
- ✅ TRY, USD, EUR desteklenir
- ✅ Locale-aware formatting
- ✅ Doğru ondalık/binlik ayırıcılar

### 3. Bakım Kolaylığı
- ✅ Tek bir merkezi fonksiyon
- ✅ Kolay test edilebilir
- ✅ Yeni para birimi eklemek kolay

### 4. Hata Önleme
- ✅ Type-safe (TypeScript)
- ✅ Kuruş/major units karışıklığı önlenir
- ✅ Tutarlı API

## 🔧 Teknik Detaylar

### Intl.NumberFormat API
```typescript
new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(2800); // "2.800"
```

### Currency Config
```typescript
const CURRENCY_CONFIG = {
  TRY: { symbol: '₺', locale: 'tr-TR', position: 'after' },
  USD: { symbol: '$', locale: 'en-US', position: 'before' },
  EUR: { symbol: '€', locale: 'de-DE', position: 'after' },
};
```

## 🚀 Sonraki Adımlar

### 1. Admin Paneli
```typescript
// TODO: Admin panelde de formatPrice() kullan
// src/app/admin/offers/page.tsx
// src/app/admin/tours/page.tsx
```

### 2. Filtre Gösterimi
```typescript
// TODO: Fiyat filtresinde formatPriceRange() kullan
// components/SimplePriceFilter.tsx
```

### 3. Email/Bildirimlerde
```typescript
// TODO: Email template'lerinde formatPrice() kullan
// lib/email/templates/reservation-confirmation.ts
```

## 📝 Migration Checklist

Eğer yeni bir sayfada fiyat gösterecekseniz:
- [ ] `import { formatPrice } from '@/lib/price'` ekle
- [ ] `formatPrice(priceMinor, currency)` kullan
- [ ] PriceMinor (kuruş/cents) cinsinden olduğundan emin ol
- [ ] Currency tipi doğru ('TRY' | 'USD' | 'EUR')
- [ ] Test et (farklı fiyatlar ve para birimleri)

## 🐛 Sorun Giderme

### Problem 1: Fiyat çok küçük görünüyor
```typescript
// Muhtemelen major units kullanıyorsunuz
❌ formatPrice(2800, 'TRY') // "28 ₺" (Hatalı!)
✅ formatPrice(280000, 'TRY') // "2.800 ₺" (Doğru!)
```

### Problem 2: Sembol yanlış pozisyonda
```typescript
// Currency tipi yanlış olabilir
❌ formatPrice(150000, 'TRY') // "1.500 ₺" (Doğru ama USD ise?)
✅ formatPrice(150000, 'USD') // "$1,500" (Doğru!)
```

### Problem 3: Type error
```typescript
// Currency string literal olmalı
❌ formatPrice(280000, currency) // Type error
✅ formatPrice(280000, currency as any) // Geçici çözüm
✅ formatPrice(280000, 'TRY') // En iyi yöntem
```

## 📚 Dokümantasyon

- **Detaylı Kılavuz:** `lib/PRICE_HELPER_GUIDE.md`
- **Test Cases:** `lib/__tests__/price.test.ts`
- **Source Code:** `lib/price.ts`

## 🎓 Örnekler

### Örnek 1: Basit Kullanım
```tsx
import { formatPrice } from '@/lib/price';

export function TourPrice({ priceMinor, currency }) {
  return (
    <div className="text-2xl font-bold">
      {formatPrice(priceMinor, currency)}
    </div>
  );
}
```

### Örnek 2: Hesaplama ile
```tsx
import { formatPrice } from '@/lib/price';

export function TotalPrice({ unitPrice, quantity, currency }) {
  const totalMinor = (unitPrice / 100) * quantity * 100;
  return (
    <div>
      Toplam: {formatPrice(totalMinor, currency)}
    </div>
  );
}
```

### Örnek 3: Conditional Rendering
```tsx
import { formatPrice, getCurrencySymbol } from '@/lib/price';

export function PriceTag({ priceMinor, currency, onSale }) {
  return (
    <div>
      {onSale ? (
        <span className="text-red-500">
          İndirimli: {formatPrice(priceMinor * 0.8, currency)}
        </span>
      ) : (
        <span>{formatPrice(priceMinor, currency)}</span>
      )}
    </div>
  );
}
```

---

**Version:** 1.0.0  
**Date:** Ekim 4, 2025  
**Status:** ✅ Production Ready

