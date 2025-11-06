# Admin Panel Kurulum ve Kullanım Rehberi

## 🎯 Sistem Özellikleri

Artık tüm turlar **veritabanından** yönetiliyor! `data/items.json` ve `data/surprise-tours.json` dosyaları artık kullanılmıyor.

## 📋 Veritabanı Hazırlama

Veritabanı migration'ları zaten uygulandı. Şimdi admin kullanıcısı oluşturup tur eklemeye başlayabilirsiniz.

### 1. Admin Kullanıcısı Oluşturma

Önce bir admin kullanıcısı oluşturmanız gerekiyor:

```bash
npm run dev
```

Tarayıcıda şu adrese gidin:
- **Kayıt Ol**: http://localhost:3000/auth/register

Admin kullanıcısı oluşturun:
- Email: `admin@lastminutetour.com`
- İsim: `Admin`
- Şifre: `admin123` (veya istediğiniz bir şifre)

### 2. Kullanıcıyı Admin Yapma

Veritabanında kullanıcının rolünü manuel olarak `admin` yapmamız gerekiyor:

**Seçenek 1: Prisma Studio ile (Önerilen)**
```bash
npx prisma studio
```

- Tarayıcıda açılan Prisma Studio'da `User` tablosuna gidin
- Oluşturduğunuz kullanıcıyı bulun
- `role` alanını `user`'dan `admin`'e değiştirin
- Kaydet

**Seçenek 2: SQLite ile manuel**
```bash
npx prisma db execute --sql "UPDATE User SET role = 'admin' WHERE email = 'admin@lastminutetour.com'"
```

### 3. Admin Panele Giriş

- http://localhost:3000/auth/login adresine gidin
- Admin email ve şifrenizle giriş yapın
- Admin panel: http://localhost:3000/admin/tours

## ✨ Tur Ekleme

Admin panelde **"+ Yeni Tur Ekle"** butonuna tıklayın.

### Gerekli Alanlar:

#### Temel Bilgiler
- **Tur Başlığı**: Örn: "Kapadokya Balon Turu"
- **Nereden**: Örn: "İstanbul"
- **Nereye**: Örn: "Kapadokya"
- **Kalkış Tarihi ve Saati**: Örn: 2025-10-05 08:00
- **Ulaşım Şekli**: Uçak ile / Otobüs ile / vb.

#### Kapasite ve Fiyat
- **Toplam Koltuk**: Örn: 20
- **Kalan Koltuk**: Örn: 5
- **Fiyat**: Örn: 2500
- **Para Birimi**: TRY / USD / EUR

#### İletişim Bilgileri
- **Telefon**: Örn: +90 555 123 4567
- **WhatsApp**: Örn: 905551234567

#### Görsel ve Tedarikçi
- **Görsel URL**: Örn: /images/hero-1.jpg
- **Tedarikçi**: Örn: LastMinuteTours

#### İptal Koşulları
- **Koşullar**: Örn: "Kesinlikle iptal edilemez. Son dakika turu."

### Özel Özellikler

#### 🎁 Sürpriz Tur
- "Sürpriz Tur" checkbox'ını işaretleyin
- Destinasyon kullanıcılara gizli kalır (??? olarak gösterilir)
- Sürpriz turlar her zaman ana sayfada **en üstte** görünür
- Ek seçenekler:
  - 📘 Pasaport Gerekli
  - 📝 Vize Gerekli

## 🔍 Tur Arama ve Sıralama

Admin panelde turları:
- **Ara**: Başlık, Nereden, Nereye alanlarında arama yapın
- **Sırala**: Tarih, Fiyat, Koltuk, Başlık'a göre
- **Yön**: Artan veya Azalan

## ✏️ Tur Düzenleme

- Tur listesinde **"✏️ Düzenle"** butonuna tıklayın
- Değişiklikleri yapıp **"✅ Değişiklikleri Kaydet"** butonuna tıklayın

## 🗑️ Tur Silme

- Tur listesinde **"🗑️ Sil"** butonuna tıklayın
- Onay verin

## 🎨 Ana Sayfa Görünümü

### Filtreleme
- **72 Saat Kuralı**: Sadece önümüzdeki 72 saat içinde kalkacak turlar gösterilir
- **Fiyat Filtresi**: Kullanıcılar min-max fiyat aralığı belirleyebilir
- **Sıralama**: Kullanıcılar tarih, fiyat veya koltuk sayısına göre sıralayabilir

### Sürpriz Turlar
- İlk 3 sürpriz tur her zaman **en üstte** gösterilir
- Filtrelemeden etkilenmezler
- Destinasyon "???" olarak gösterilir

## 📊 Veritabanı Yönetimi

### Prisma Studio ile Görüntüleme
```bash
npx prisma studio
```
Tarayıcıda tüm veritabanı tablolarını görüntüleyebilir ve düzenleyebilirsiniz.

### Migration Oluşturma
Schema değişikliği yaptıysanız:
```bash
npx prisma migrate dev --name your_migration_name
```

### Veritabanını Sıfırlama (DİKKAT: Tüm veri silinir!)
```bash
npx prisma migrate reset
```

## 🚀 Production'a Geçiş

Production'da PostgreSQL kullanmak için `prisma/schema.prisma` dosyasında:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

.env dosyanızda:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

Sonra migration'ları uygulayın:
```bash
npx prisma migrate deploy
```

## 💡 İpuçları

1. **Sürpriz Turlar**: En az 1-3 sürpriz tur oluşturun (her zaman en üstte gösterilir)
2. **Kalan Koltuk**: 5 veya daha az kalan koltuk olunca "Son X Koltuk!" uyarısı gösterilir
3. **Kalkış Zamanı**: 24 saat veya daha az kalan turlar özel badge ile vurgulanır
4. **Görseller**: Hero slider için `/public/images/` klasörüne görsel ekleyin
5. **İptal Politikası**: Her zaman net bir iptal politikası belirtin

## 🆘 Sorun Giderme

### "Tur bulunamadı" hatası
- Veritabanında tur olduğundan emin olun
- Turların `category = 'tour'` olduğunu kontrol edin
- Turların `startAt` tarihi gelecekte olmalı

### Admin panele erişemiyorum
- Kullanıcının `role = 'admin'` olduğundan emin olun
- Giriş yaptığınızdan emin olun
- Tarayıcı önbelleğini temizleyin

### TypeScript hataları
```bash
npx prisma generate
```
Komutunu çalıştırıp TypeScript sunucusunu yeniden başlatın.

## 📝 API Endpoints

### Public (Kullanıcılar için)
- `GET /api/tours` - Tüm turları listele (filtre ve sıralama ile)
- `GET /api/tours/[id]` - Tek bir tur detayı

### Admin (Sadece admin kullanıcılar)
- `GET /api/admin/tours` - Tüm turları listele (arama ve sıralama ile)
- `POST /api/admin/tours` - Yeni tur ekle
- `GET /api/admin/tours/[id]` - Tek bir tur detayı
- `PATCH /api/admin/tours/[id]` - Tur güncelle
- `DELETE /api/admin/tours/[id]` - Tur sil

Başarılar! 🎉

