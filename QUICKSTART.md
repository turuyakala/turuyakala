# 🚀 Hızlı Başlangıç - LastMinuteTour

Bu rehber sizi 2 dakikada çalıştıracak!

## ⚡ 3 Adımda Başlat

### 1️⃣ Bağımlılıkları Yükle
```bash
npm install
```

### 2️⃣ Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

### 3️⃣ Tarayıcıda Aç
```
http://localhost:3000
```

🎉 **Hazır!** Platform çalışıyor.

---

## 📱 Ne Göreceksiniz?

### Ana Sayfa
✅ 20 son dakika fırsatı  
✅ Filtreleme (kategori, şehir, tarih, fiyat)  
✅ Kalkışa kalan süre göstergeleri  
✅ "Son Koltuklar", "Acil" etiketleri  
✅ Tam mobil uyumlu  

### Detay Sayfası
✅ Tüm fırsat bilgileri  
✅ WhatsApp rezervasyon  
✅ İptal ve iade koşulları  
✅ Tedarikçi iletişim  

---

## 🧪 Test Et

### Kategorilere Göz At
- 🏞️ Turlar
- 🚌 Otobüs
- ✈️ Uçak
- 🚢 Gemi

### Filtreleme Dene
```
/?cat=tour&from=istanbul
/?window=24&maxPrice=2000
/?cat=flight&to=ankara
```

---

## 📝 Veri Ekle

`data/items.json` dosyasını düzenle:

```json
{
  "id": "21",
  "category": "tour",
  "title": "Yeni Tur",
  "from": "İstanbul",
  "to": "Bursa",
  "startAt": "2025-10-03T10:00:00.000Z",
  "seatsLeft": 2,
  "price": 1500,
  "currency": "TRY",
  "supplier": "Örnek Turizm",
  "contact": {
    "whatsapp": "+905551234567"
  }
}
```

---

## 🎨 Özelleştir

### Tasarım
- `src/app/globals.css` - Stiller
- `components/` - Bileşenler

### Veri
- `data/items.json` - Fırsatlar
- `public/images/` - Görseller

---

## 🚀 Deploy Et

### Vercel (Önerilen)
1. GitHub'a push et
2. [Vercel](https://vercel.com)'e import et
3. Deploy!

### Build Al
```bash
npm run build
npm run start
```

---

## 📚 Daha Fazla

- `README.md` - Detaylı dokümantasyon
- `lib/` - Utility fonksiyonları
- `components/` - React bileşenleri

---

**İyi geliştirmeler! 🎯**
