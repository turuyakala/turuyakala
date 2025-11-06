# 📸 Fotoğrafları Nasıl Yüklerim?

## 🎯 Hero Slider Fotoğrafları

Hero slider'da **4 adet fotoğraf** gösterilmektedir. Bu fotoğrafları yüklemek için:

### Adım 1: Fotoğrafları Hazırlayın

1. **4 adet fotoğraf** hazırlayın
2. **Önerilen boyut:** 1920x500 piksel (landscape/yatay)
3. **Format:** JPG veya PNG
4. **Dosya adları:**
   - `hero-1.jpg`
   - `hero-2.jpg`
   - `hero-3.jpg`
   - `hero-4.jpg`

### Adım 2: Fotoğrafları Yükleyin

1. **Proje klasörünüzde** `public/images/` klasörünü açın
2. **4 adet fotoğrafı** bu klasöre kopyalayın
3. **Dosya adlarının** yukarıdaki gibi olduğundan emin olun

```
lastminutetour/
├── public/
│   └── images/
│       ├── hero-1.jpg  ← Fotoğraflarınızı buraya
│       ├── hero-2.jpg
│       ├── hero-3.jpg
│       └── hero-4.jpg
```

### Adım 3: Sayfayı Yenileyin

1. Tarayıcınızda sayfayı yenileyin (Ctrl + F5)
2. Fotoğraflar otomatik olarak görünecek ve 5 saniyede bir değişecek!

---

## 🏞️ Tur Fotoğrafları

Turlara özel fotoğraf eklemek için:

1. Fotoğrafı `public/images/` klasörüne koyun
2. Admin panelinden tur eklerken veya düzenlerken "Görsel URL" kısmına:
   - `/images/dosya-adi.jpg` yazın

**Örnek:**
```
Görsel URL: /images/kapadokya.jpg
```

---

## 💡 İpuçları

### Nereden Fotoğraf Bulabilirim?

1. **Ücretsiz Stok Fotoğraflar:**
   - [Unsplash](https://unsplash.com) - Türkiye, doğa, seyahat
   - [Pexels](https://pexels.com) - Ücretsiz kaliteli görseller
   - [Pixabay](https://pixabay.com) - Telif hakkı yok

2. **Arama Önerileri:**
   - "Turkey travel"
   - "Cappadocia"
   - "Turkish landscape"
   - "Adventure travel"

### Fotoğraf Optimizasyonu

Fotoğrafları yüklemeden önce:
1. Boyutlandırın (1920x500 hero için, 800x600 turlar için)
2. Sıkıştırın (JPG kalite: %80-85)
3. Dosya boyutunu küçültün (< 500KB ideal)

**Online araçlar:**
- [TinyPNG](https://tinypng.com) - Sıkıştırma
- [Squoosh](https://squoosh.app) - Optimizasyon

---

## 🎨 Slider Metinlerini Değiştirmek

`components/HeroSlider.tsx` dosyasını açın ve `slides` dizisini düzenleyin:

```tsx
const slides = [
  {
    id: 1,
    image: '/images/hero-1.jpg',
    title: 'Buraya Başlığınızı Yazın',
    subtitle: 'Buraya alt başlığınızı yazın',
    description: 'Buraya açıklamanızı yazın'
  },
  // ... diğer slaytlar
];
```

---

## ❓ Sık Sorulan Sorular

**S: Fotoğraflar görünmüyor?**
- Dosya adlarını kontrol edin (küçük harf, tire ile)
- Fotoğrafların `public/images/` klasöründe olduğunu kontrol edin
- Tarayıcınızı yenileyin (Ctrl + Shift + R)

**S: Slider hızını değiştirebilir miyim?**
- Evet! `HeroSlider.tsx` dosyasında `5000` değerini değiştirin
- `5000` = 5 saniye
- `3000` = 3 saniye

**S: Daha fazla veya daha az slayt ekleyebilir miyim?**
- Evet! `slides` dizisine yeni objeler ekleyin veya çıkarın

---

## 🚀 Hızlı Başlangıç

1. 4 fotoğraf hazırlayın
2. `public/images/` klasörüne kopyalayın
3. İsimlendirin: hero-1.jpg, hero-2.jpg, hero-3.jpg, hero-4.jpg
4. Sayfayı yenileyin!

**Hazır! 🎉**



