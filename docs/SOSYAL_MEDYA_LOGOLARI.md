# 📱 Sosyal Medya Logo Ekleme Rehberi

## 🎯 Mevcut Durum
Footer'da sosyal medya ikonları için hazır SVG dosyaları bulunmaktadır:
- `/public/images/social/instagram.svg`
- `/public/images/social/facebook.svg`
- `/public/images/social/twitter.svg`

## 🔄 Kendi Logo Görsellerinizi Eklemek İçin

### 1. Logo Dosyalarını Hazırlayın
- **Format**: SVG (önerilen) veya PNG
- **Boyut**: 24x24px veya 48x48px
- **Stil**: Minimal, beyaz renk (Footer'da beyaz arka plan üzerinde görünecek)
- **Kalite**: Yüksek çözünürlük

### 2. Dosyaları Yerleştirin
```
public/
  images/
    social/
      instagram.svg      (mevcut)
      facebook.svg       (mevcut)
      twitter.svg        (mevcut)
      linkedin.svg       (yeni ekleyeceğiniz)
      tiktok.svg         (yeni ekleyeceğiniz)
      telegram.svg       (yeni ekleyeceğiniz)
```

### 3. Footer'ı Güncelleyin
`components/Footer.tsx` dosyasında yeni sosyal medya linkini ekleyin:

```tsx
<a 
  href="https://linkedin.com/company/lastminutetours" 
  target="_blank" 
  rel="noopener noreferrer"
  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
  aria-label="LinkedIn"
>
  <img 
    src="/images/social/linkedin.svg" 
    alt="LinkedIn" 
    className="w-6 h-6"
  />
</a>
```

## 🎨 Logo Tasarım Önerileri

### SVG Oluşturma (Önerilen)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <!-- Logo path'lerinizi buraya ekleyin -->
</svg>
```

### PNG Kullanımı
```tsx
<img 
  src="/images/social/linkedin.png" 
  alt="LinkedIn" 
  className="w-6 h-6"
/>
```

## 🌐 Ücretsiz Logo Kaynakları

### 1. **Heroicons** (Önerilen)
- URL: https://heroicons.com/
- Ücretsiz SVG ikonlar
- Minimal ve modern tasarım

### 2. **Feather Icons**
- URL: https://feathericons.com/
- Minimal çizgi ikonlar
- SVG formatında

### 3. **Tabler Icons**
- URL: https://tabler-icons.io/
- 4000+ ücretsiz SVG ikon
- Sosyal medya ikonları mevcut

### 4. **Simple Icons**
- URL: https://simpleicons.org/
- Sadece sosyal medya logoları
- Marka renklerinde

## 📝 Logo Ekleme Adımları

### Adım 1: Logo İndirin veya Oluşturun
```bash
# Örnek: LinkedIn logosu için
# 1. Simple Icons'dan LinkedIn SVG'sini indirin
# 2. public/images/social/linkedin.svg olarak kaydedin
```

### Adım 2: Footer'ı Güncelleyin
```tsx
// components/Footer.tsx dosyasında
<div className="flex gap-4 mb-6">
  {/* Mevcut ikonlar */}
  <a href="https://instagram.com/lastminutetours" ...>
    <img src="/images/social/instagram.svg" ... />
  </a>
  
  {/* Yeni ikon */}
  <a href="https://linkedin.com/company/lastminutetours" ...>
    <img src="/images/social/linkedin.svg" ... />
  </a>
</div>
```

### Adım 3: URL'leri Güncelleyin
```tsx
href="https://linkedin.com/company/lastminutetours"
// Gerçek sosyal medya hesaplarınızın URL'lerini yazın
```

## 🎯 Önerilen Sosyal Medya Hesapları

### Temel Hesaplar
- **Instagram**: @lastminutetours
- **Facebook**: LastMinuteTours
- **Twitter/X**: @lastminutetours

### Ek Hesaplar (İsteğe Bağlı)
- **LinkedIn**: LastMinuteTours Company
- **TikTok**: @lastminutetours
- **Telegram**: @lastminutetours
- **WhatsApp Business**: +90 212 555 0123

## 🔧 Teknik Detaylar

### CSS Sınıfları
```css
/* Sosyal medya ikonları için */
.social-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.social-icon:hover {
  background: rgba(255, 255, 255, 0.3);
}

.social-icon img {
  width: 24px;
  height: 24px;
}
```

### Responsive Tasarım
- Mobilde: 4 ikon yan yana
- Tablet: 4-6 ikon yan yana
- Desktop: 6+ ikon yan yana

## ✅ Kontrol Listesi

- [ ] Logo dosyaları `/public/images/social/` klasöründe
- [ ] SVG formatında (önerilen) veya PNG
- [ ] 24x24px boyutunda
- [ ] Beyaz renkte (Footer'da görünür olması için)
- [ ] Footer'da doğru URL'ler
- [ ] `aria-label` ve `alt` text'leri eklenmiş
- [ ] Responsive tasarım test edilmiş

## 🚀 Hızlı Başlangıç

1. **Simple Icons**'dan istediğiniz sosyal medya logosunu indirin
2. `public/images/social/` klasörüne kaydedin
3. `components/Footer.tsx`'i güncelleyin
4. Gerçek sosyal medya URL'lerinizi ekleyin
5. Test edin!

---

**Not**: Mevcut SVG dosyaları örnek olarak hazırlanmıştır. Kendi logo görsellerinizi kullanmanızı öneririz.
