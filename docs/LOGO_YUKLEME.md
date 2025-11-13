# Logo Yükleme Rehberi

## 📸 Logo Dosyasını Yükleme

### Adım 1: Logo Dosyanızı Hazırlayın
- Logo dosyanızı PNG, SVG veya JPG formatında hazırlayın
- Önerilen boyutlar:
  - **Navigasyon için**: 150-200px genişlik, yükseklik otomatik
  - **Favicon için**: 32x32px veya 64x64px (kare)
  - **Mobil için**: 100-150px genişlik

### Adım 2: Logo Dosyasını Public Klasörüne Kopyalayın

Logo dosyanızı `public/images/` klasörüne kopyalayın:

```bash
# Örnek: logo.png dosyasını kopyalayın
# Windows: Dosyayı sürükle-bırak ile public/images/ klasörüne kopyalayın
# veya PowerShell ile:
copy "C:\path\to\your\logo.png" "public\images\logo.png"
```

**Önerilen dosya adları:**
- `public/images/logo.png` - Ana logo (PNG)
- `public/images/logo.svg` - Ana logo (SVG - önerilen)
- `public/images/logo-mobile.png` - Mobil için küçük logo (opsiyonel)

### Adım 3: Favicon Güncelleme (Opsiyonel)

Favicon için logo dosyanızı `public/` klasörüne kopyalayın:
- `public/favicon.ico` - 32x32px ICO formatında
- `public/favicon.svg` - SVG formatında (modern tarayıcılar için)

### Adım 4: Kodda Logo Kullanımı

Logo otomatik olarak kullanılacak. Eğer manuel olarak değiştirmek isterseniz:

**Ana Sayfa Navigasyonu** (`src/app/page.tsx`):
```tsx
<div className="flex items-center">
  <Link href="/">
    <Image 
      src="/images/logo.png" 
      alt="TuruYakala Logo" 
      width={150} 
      height={50}
      className="h-10 w-auto"
    />
  </Link>
</div>
```

**Diğer Sayfalarda** (header bileşenlerinde):
```tsx
<Image 
  src="/images/logo.png" 
  alt="TuruYakala Logo" 
  width={150} 
  height={50}
  className="h-10 w-auto"
/>
```

## 🎨 Logo Stilleri

### Koyu Arka Plan İçin (Navigasyon)
Logo dosyanız beyaz veya açık renkli olmalıdır çünkü navigasyon koyu renkli (#E7E393).

### Açık Arka Plan İçin
Logo dosyanız koyu renkli olabilir.

## 📝 Notlar

- SVG formatı önerilir çünkü her boyutta net görünür
- Logo dosyası `public/images/` klasöründe olmalıdır
- Dosya adı `logo.png` veya `logo.svg` olmalıdır
- Logo yüklendikten sonra sayfayı yenileyin (Ctrl+F5 veya Cmd+Shift+R)

## 🔄 Logo Değiştirme

Logo dosyanızı değiştirmek için:
1. Yeni logo dosyasını `public/images/logo.png` (veya `.svg`) olarak kaydedin
2. Eski dosyayı silin veya üzerine yazın
3. Tarayıcı önbelleğini temizleyin (Ctrl+F5)

## ✅ Kontrol Listesi

- [ ] Logo dosyası hazırlandı
- [ ] Logo `public/images/` klasörüne kopyalandı
- [ ] Dosya adı `logo.png` veya `logo.svg`
- [ ] Sayfa yenilendi ve logo görünüyor
- [ ] Mobil görünümde logo düzgün görünüyor

