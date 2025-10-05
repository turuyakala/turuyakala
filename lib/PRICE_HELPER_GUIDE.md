# 💰 Price Helper Kılavuzu

Price helper fonksiyonları, fiyatları doğru formatta ve para birimiyle göstermek için kullanılır.

## 🎯 Temel Konsept

### PriceMinor (Kuruş/Cents)
Veritabanında fiyatlar **minor units** (kuruş, cent) cinsinden saklanır:
- `priceMinor = 280000` → 2800 TRY
- `priceMinor = 5000` → 50 TRY
- `priceMinor = 150000` → 1500 USD

**Neden minor units?**
- ✅ Ondalık hata riski yok
- ✅ Database'de integer olarak saklanır
- ✅ Para birimi dönüşümleri kesin

## 📦 Fonksiyonlar

### 1. `formatPrice()` - Ana Formatlayıcı

Fiyatı binlik ayırıcı ve para birimi sembolü ile formatlar.

```typescript
import { formatPrice } from '@/lib/price';

formatPrice(280000, 'TRY')  // "2.800 ₺"
formatPrice(5000, 'TRY')    // "50 ₺"
formatPrice(150000, 'USD')  // "$1,500"
formatPrice(200000, 'EUR')  // "2.000 €"
```

**Parametreler:**
- `priceMinor`: Kuruş/cent cinsinden fiyat (number)
- `currency`: Para birimi ('TRY' | 'EUR' | 'USD')

**Dönüş:** Formatlanmış string

### 2. `formatPriceWithDecimals()` - Ondalıklı Format

Virgülden sonra 2 basamak gösterir.

```typescript
formatPriceWithDecimals(285000, 'TRY')  // "2.850,00 ₺"
formatPriceWithDecimals(5050, 'TRY')    // "50,50 ₺"
formatPriceWithDecimals(150050, 'USD')  // "$1,500.50"
```

### 3. `formatPriceCompact()` - Kompakt Format

Büyük sayılar için kısaltılmış format.

```typescript
formatPriceCompact(500000000, 'TRY')  // "5M ₺"
formatPriceCompact(250000000, 'TRY')  // "2,5M ₺"
formatPriceCompact(50000, 'TRY')      // "500 ₺"
```

### 4. `formatPriceRange()` - Fiyat Aralığı

Min-max fiyat aralığı gösterir.

```typescript
formatPriceRange(100000, 200000, 'TRY')  // "1.000 - 2.000 ₺"
formatPriceRange(5000, 10000, 'TRY')     // "50 - 100 ₺"
```

### 5. `getCurrencySymbol()` - Sembol

Sadece para birimi sembolünü döndürür.

```typescript
getCurrencySymbol('TRY')  // "₺"
getCurrencySymbol('USD')  // "$"
getCurrencySymbol('EUR')  // "€"
```

### 6. `minorToMajor()` - Dönüştürme

Kuruş/cent'i TRY/USD'ye çevirir.

```typescript
minorToMajor(280000)  // 2800
minorToMajor(5000)    // 50
```

## 🎨 Kullanım Örnekleri

### Offer Card'da

```tsx
import { formatPrice } from '@/lib/price';

<div className="text-3xl font-bold">
  {formatPrice(item.price * 100, item.currency)}
</div>
```

**Not:** `item.price` zaten major units'te (eski format), bu yüzden `* 100` ile kuruşa çeviriyoruz.

### Detay Sayfasında

```tsx
import { formatPrice } from '@/lib/price';

<div className="text-5xl font-bold">
  {formatPrice(item.price * 100, item.currency)}
</div>
```

### Rezervasyon Box'ında

```tsx
import { formatPrice, getCurrencySymbol } from '@/lib/price';

const totalPrice = price * guests;
const currencySymbol = getCurrencySymbol(currency);

// Fiyat gösterimi
{formatPrice(totalPrice * 100, currency)}

// WhatsApp mesajı
const message = `Toplam: ${formatPrice(totalPrice * 100, currency)}`;
```

### Fiyat Filtresi

```tsx
import { formatPriceRange } from '@/lib/price';

const priceRange = formatPriceRange(
  minPrice * 100,
  maxPrice * 100,
  'TRY'
);
// "1.000 - 5.000 ₺"
```

## 🌍 Para Birimleri

### TRY (Türk Lirası)
- **Sembol:** ₺
- **Binlik ayırıcı:** `.` (nokta)
- **Ondalık ayırıcı:** `,` (virgül)
- **Pozisyon:** Sonra
- **Örnek:** `2.800,50 ₺`

### USD (Amerikan Doları)
- **Sembol:** $
- **Binlik ayırıcı:** `,` (virgül)
- **Ondalık ayırıcı:** `.` (nokta)
- **Pozisyon:** Önce
- **Örnek:** `$2,800.50`

### EUR (Euro)
- **Sembol:** €
- **Binlik ayırıcı:** `.` (nokta)
- **Ondalık ayırıcı:** `,` (virgül)
- **Pozisyon:** Sonra
- **Örnek:** `2.800,50 €`

## 🔄 Migration: Eski Koddan Yeni Koda

### Önceki (Eski Format)

```tsx
// ❌ Eski kod
<div>
  {item.price.toLocaleString('tr-TR')}
  <span>{item.currency === 'TRY' ? '₺' : item.currency}</span>
</div>
```

**Sorunlar:**
- Para birimi desteği eksik
- Binlik ayırıcı tutarsız
- Hard-coded semboller

### Yeni (Helper ile)

```tsx
// ✅ Yeni kod
<div>
  {formatPrice(item.price * 100, item.currency)}
</div>
```

**Avantajlar:**
- ✅ Tüm para birimleri desteklenir
- ✅ Otomatik binlik ayırıcı
- ✅ Doğru sembol pozisyonu
- ✅ Tutarlı format

## 📊 Performans

Price helper fonksiyonları `Intl.NumberFormat` API'sini kullanır:
- ⚡ Hızlı ve optimize
- 🌍 Locale-aware
- 🎯 Browser desteği %99.5+

## 🧪 Test Örnekleri

### Senaryo 1: Tur Fiyatı
```typescript
const tourPrice = 280000; // 2800 TRY
formatPrice(tourPrice, 'TRY') // "2.800 ₺"
```

### Senaryo 2: Çoklu Kişi
```typescript
const singlePrice = 280000; // 2800 TRY
const guests = 3;
const total = (singlePrice / 100) * guests * 100; // 840000
formatPrice(total, 'TRY') // "8.400 ₺"
```

### Senaryo 3: USD Fiyat
```typescript
const flightPrice = 150000; // 1500 USD
formatPrice(flightPrice, 'USD') // "$1,500"
```

### Senaryo 4: EUR Fiyat
```typescript
const tourPrice = 200000; // 2000 EUR
formatPrice(tourPrice, 'EUR') // "2.000 €"
```

## ⚠️ Yaygın Hatalar

### Hata 1: Major units'i unuttuk
```typescript
// ❌ Yanlış
formatPrice(2800, 'TRY') // "28 ₺" (Hatalı!)

// ✅ Doğru
formatPrice(280000, 'TRY') // "2.800 ₺"
```

### Hata 2: Currency type hatası
```typescript
// ❌ Yanlış
formatPrice(280000, 'try') // Type error

// ✅ Doğru
formatPrice(280000, 'TRY') // "2.800 ₺"
```

### Hata 3: Eski formattan dönüşüm
```typescript
// Eğer item.price zaten major units'te ise (eski format)
const priceMinor = item.price * 100; // ✅ Kuruşa çevir
formatPrice(priceMinor, item.currency);

// Eğer item.priceMinor zaten kuruşta ise (yeni format)
formatPrice(item.priceMinor, item.currency); // ✅ Direkt kullan
```

## 📝 Checklist: Helper Kullanımı

Fiyat gösterirken:
- [ ] `formatPrice()` kullanıldı mı?
- [ ] PriceMinor (kuruş) cinsinden mi?
- [ ] Currency doğru mu? (TRY/USD/EUR)
- [ ] Binlik ayırıcı doğru mu?
- [ ] Sembol pozisyonu doğru mu?

## 🔮 Gelecek Geliştirmeler

- [ ] Daha fazla para birimi (GBP, JPY, etc.)
- [ ] Özel format şablonları
- [ ] Animasyonlu fiyat değişimi
- [ ] Crypto currency desteği

## 📚 Kaynaklar

- [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [ISO 4217 Currency Codes](https://en.wikipedia.org/wiki/ISO_4217)
- [Price Minor Units](https://stripe.com/docs/currencies#zero-decimal)

---

**Version:** 1.0.0  
**Last Updated:** Ekim 4, 2025  
**Maintainer:** LastMinuteTour Dev Team

