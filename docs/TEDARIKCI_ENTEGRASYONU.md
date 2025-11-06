# 🔌 Tedarikçi Entegrasyon Sistemi

## 🎯 Özellikler

Admin panelde tedarikçi entegrasyonlarını yönetebilir, API bağlantılarını test edebilir ve kimlik bilgilerini güvenli şekilde saklayabilirsiniz.

### ✅ Tamamlanan Özellikler

- ✅ Tedarikçi CRUD işlemleri (Oluştur, Listele, Güncelle, Sil)
- ✅ Entegrasyon modu seçimi (Pull/Push/CSV)
- ✅ API kimlik bilgileri yönetimi
- ✅ Şifreli credential saklama (AES-256)
- ✅ Bağlantı testi (Healthcheck)
- ✅ Maskeli anahtar gösterimi
- ✅ Son bağlantı durumu takibi

## 📋 Kullanım

### 1. Tedarikçi Ayarları Sayfasına Erişim

Admin panelden **🔌 Tedarikçiler** menüsüne tıklayın veya direkt olarak:
```
http://localhost:3000/admin/suppliers
```

### 2. Yeni Tedarikçi Ekleme

**"+ Yeni Tedarikçi Ekle"** butonuna tıklayıp formu doldurun:

#### Temel Bilgiler
- **Tedarikçi Adı**: Benzersiz isim (örn: "Acme Travel API")
- **Açıklama**: Opsiyonel açıklama
- **Entegrasyon Modu**:
  - 📥 **Pull**: Tedarikçiden veri çekmek için
  - 📤 **Push**: Tedarikçiye veri göndermek için
  - 📄 **CSV**: Dosya bazlı entegrasyon için

#### API Ayarları (Pull/Push için)
- **API URL**: Tedarikçi API endpoint'i (örn: `https://api.supplier.com/v1`)
- **API Key**: API anahtarı (şifreli saklanır)
- **API Secret**: API secret (şifreli saklanır)
- **Kullanıcı Adı**: Basic Auth için (opsiyonel)
- **Şifre**: Basic Auth için (şifreli saklanır, opsiyonel)
- **Ek Header'lar**: JSON formatında özel header'lar

Örnek ek header:
```json
{
  "X-Custom-Header": "value",
  "X-API-Version": "2.0"
}
```

#### Bağlantı Testi Ayarları
- **Healthcheck URL**: Test endpoint'i (örn: `https://api.supplier.com/health`)
- **Healthcheck Method**: GET veya POST

#### Durum
- **Tedarikçi Aktif**: Entegrasyonun çalışıp çalışmayacağı

### 3. Bağlantı Testi

Tedarikçi kartında **🔍 Bağlantı Testi** butonuna tıklayın.

Sistem şunları kontrol eder:
- ✅ API erişilebilirliği
- ✅ Kimlik doğrulama başarısı
- ✅ Yanıt süresi
- ✅ HTTP durum kodu

Test sonuçları:
- ✓ **Başarılı**: Yeşil badge
- ✗ **Başarısız**: Kırmızı badge
- **Test Edilmedi**: Gri badge

### 4. Tedarikçi Düzenleme

Tedarikçi kartında **✏️ Düzenle** butonuna tıklayın.

**Önemli**: 
- Şifrelenmiş alanlar (API Key, Secret, Password) düzenleme sırasında tam değerleriyle gösterilir
- Kaydettiğinizde yeniden şifrelenir ve maskeli gösterilir

### 5. Tedarikçi Silme

Tedarikçi kartında **🗑️ Sil** butonuna tıklayıp onaylayın.

## 🔒 Güvenlik

### Şifreleme
- API Key, API Secret ve Password alanları **AES-256-CBC** ile şifrelenir
- Veritabanında şifreli halde saklanır
- Sadece düzenleme sırasında decrypt edilir

### Maskeleme
- Listeleme ve kaydetme sonrası şifreli alanlar maskeli gösterilir
- Örnek: `abc1****` (ilk 4 karakter + yıldızlar)

### Environment Variables
`.env` dosyanıza şifreleme anahtarı ekleyin:

```env
# Encryption Key (32 karakter - AES-256 için)
ENCRYPTION_KEY="your-random-32-character-key!!"
```

**Önemli**: Production'da güçlü ve rastgele bir anahtar kullanın!

## 📊 Veritabanı Schema

```prisma
model Supplier {
  id                  String    @id @default(cuid())
  name                String    @unique
  description         String?
  integrationMode     String    // pull, push, csv
  
  // API Configuration
  apiUrl              String?
  apiKey              String?   // Encrypted
  apiSecret           String?   // Encrypted
  username            String?
  password            String?   // Encrypted
  additionalHeaders   String?   // JSON
  
  // Healthcheck Configuration
  healthcheckUrl      String?
  healthcheckMethod   String    @default("GET")
  lastHealthcheck     DateTime?
  healthcheckStatus   String?   // success, failed
  healthcheckMessage  String?
  
  // Status
  isActive            Boolean   @default(true)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

## 🌐 API Endpoints

### Admin Endpoints (Auth Required)

#### GET `/api/admin/suppliers`
Tüm tedarikçileri listele (credentials maskeli)

#### POST `/api/admin/suppliers`
Yeni tedarikçi oluştur

#### GET `/api/admin/suppliers/[id]`
Tek bir tedarikçi detayı (credentials decrypt edilmiş)

#### PATCH `/api/admin/suppliers/[id]`
Tedarikçi güncelle

#### DELETE `/api/admin/suppliers/[id]`
Tedarikçi sil

#### POST `/api/admin/suppliers/[id]/test-connection`
Bağlantı testi yap

**Response örneği:**
```json
{
  "status": "success",
  "message": "Bağlantı başarılı (200) - 234ms",
  "responseTime": 234,
  "timestamp": "2025-10-04T02:00:00.000Z"
}
```

## 🚀 Kullanım Senaryoları

### Senaryo 1: Pull Entegrasyonu (Veri Çekme)

1. Tedarikçi ekle (mode: pull)
2. API credentials gir
3. Healthcheck URL'i ayarla
4. Bağlantı testini çalıştır
5. Başarılıysa, tedarikçiyi aktif et
6. Sistemin periyodik olarak tedarikçiden veri çekmesini sağla

### Senaryo 2: Push Entegrasyonu (Veri Gönderme)

1. Tedarikçi ekle (mode: push)
2. API credentials gir
3. Tur eklendiğinde/güncellendiğinde tedarikçiye bildirim gönder
4. Başarısız durumları takip et

### Senaryo 3: CSV Entegrasyonu

1. Tedarikçi ekle (mode: csv)
2. CSV dosyasını manuel upload et
3. Sistem parse edip turları ekler

## 🔧 Gelişmiş Özellikler

### Custom Headers

Bazı API'lar özel header'lar gerektirir:

```json
{
  "X-API-Version": "2024-10-01",
  "X-Partner-ID": "partner123",
  "Accept": "application/json"
}
```

### Basic Auth

API Key yerine kullanıcı adı/şifre kullanıyorsanız:
- **Username** alanını doldurun
- **Password** alanını doldurun
- Sistem otomatik `Authorization: Basic xxx` header'ı ekler

### Timeout

Healthcheck istekleri **10 saniye** timeout'a sahiptir.

## 📝 Best Practices

1. **Test Önce**: Tedarikçiyi aktif etmeden önce bağlantı testini çalıştırın
2. **Güçlü Şifreleme**: Production'da güçlü `ENCRYPTION_KEY` kullanın
3. **Healthcheck Düzenli**: Tedarikçilerin durumunu düzenli kontrol edin
4. **Log Takibi**: Başarısız bağlantıları loglardan takip edin
5. **Yedekleme**: Credentials'ları güvenli bir yerde yedekleyin

## ❗ Sorun Giderme

### "Bağlantı reddedildi" hatası
- API URL'in doğru olduğundan emin olun
- Tedarikçi sunucusunun çalıştığını kontrol edin
- Firewall ayarlarını kontrol edin

### "DNS hatası: Host bulunamadı"
- Domain adının doğru yazıldığından emin olun
- DNS ayarlarını kontrol edin

### "Zaman aşımı" hatası
- Tedarikçi API'si yavaş yanıt veriyor olabilir
- Network bağlantınızı kontrol edin
- Healthcheck URL'in basit bir endpoint olduğundan emin olun

### Şifreleme hataları
- `.env` dosyasında `ENCRYPTION_KEY` tanımlı mı kontrol edin
- Key'in 32 karakter olduğundan emin olun

## 🎉 Örnek Kullanım

```typescript
// Tedarikçiden tur çekme örneği (Pull)
async function fetchToursFromSupplier(supplierId: string) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId, isActive: true }
  });
  
  if (!supplier || supplier.integrationMode !== 'pull') {
    return;
  }
  
  // Decrypt credentials
  const apiKey = decrypt(supplier.apiKey);
  
  // Fetch tours
  const response = await fetch(`${supplier.apiUrl}/tours`, {
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    }
  });
  
  const tours = await response.json();
  
  // Save to database
  // ...
}
```

## 📚 İleri Düzey

### OAuth 2.0 Entegrasyonu

Gelecekte OAuth 2.0 desteği eklenebilir:
- Access token storage
- Token refresh mechanism
- Scope management

### Webhook Support

Push mode için webhook endpoints:
- `/api/webhooks/suppliers/[id]/tours`
- `/api/webhooks/suppliers/[id]/bookings`

### Rate Limiting

API rate limit'lerini takip etmek için:
- Request counter
- Rate limit headers parsing
- Automatic throttling

---

**Tedarikçi entegrasyon sistemi tamamen hazır!** 🎊

Admin panelden kolayca tedarikçi ekleyip yönetebilirsiniz.

