# 📥 CSV İçe Aktarma Rehberi

## Genel Bakış

Admin panelinden CSV dosyası ile toplu offer import edebilirsiniz.

**Özellikler:**
- ✅ 3 adımlı sihirbaz (Upload → Mapping → Validation → Import)
- ✅ Sütun eşleştirme (flexible mapping)
- ✅ Gerçek zamanlı validasyon
- ✅ Hatalı satırlar için indirilebilir `error.csv`
- ✅ Önizleme ve progress tracking
- ✅ Audit logging

---

## 🚀 Hızlı Başlangıç

### Adım 1: Template İndir

```bash
wget http://localhost:3000/import-template.csv
```

Veya Admin > Veri İçe Aktar sayfasından "Örnek CSV İndir" butonuna tıklayın.

### Adım 2: CSV'yi Düzenle

Excel, Google Sheets, veya bir text editor ile açın:

```csv
title,description,category,startLocation,endLocation,startAt,price,currency
İstanbul Boğaz Turu,Boğaz turu,tours,İstanbul,İstanbul,2025-10-10T09:00:00,150.00,TRY
Antalya Uçuşu,Uçak bileti,flights,İstanbul,Antalya,2025-10-12T14:30:00,350.00,TRY
```

### Adım 3: Import Et

1. `/admin/import` sayfasına git
2. CSV dosyasını yükle
3. Sütunları eşleştir
4. Validasyon sonuçlarını gözden geçir
5. İçe aktar

---

## 📋 CSV Format Kuralları

### Zorunlu Sütunlar

| Alan | Açıklama | Örnek |
|------|----------|-------|
| `title` | Teklif başlığı | `İstanbul Boğaz Turu` |
| `category` | Kategori | `tours`, `flights`, `buses`, `ships` |
| `startLocation` | Nereden | `İstanbul` |
| `endLocation` | Nereye | `Ankara` |
| `startAt` | Başlangıç tarihi/saati | `2025-10-10T09:00:00` veya `2025-10-10` |
| `price` | Fiyat (major unit) | `150.50` |
| `currency` | Para birimi | `TRY`, `USD`, `EUR` |

### Opsiyonel Sütunlar

| Alan | Açıklama | Örnek |
|------|----------|-------|
| `vendorOfferId` | Tedarikçi offer ID'si | `TOUR-123` (yoksa otomatik oluşturulur) |
| `description` | Açıklama | `Boğazda unutulmaz bir gün` |
| `endAt` | Bitiş tarihi/saati | `2025-10-10T17:00:00` (yoksa +8 saat) |
| `availableSeats` | Koltuk sayısı | `40` (default: 1) |
| `images` | Görseller (virgülle ayrılmış) | `img1.jpg,img2.jpg` |
| `highlights` | Öne çıkanlar (\| ile ayrılmış) | `Boğaz\|Yemek\|Rehber` |
| `included` | Dahil olanlar (\| ile ayrılmış) | `Yemek\|İçecek` |
| `excluded` | Dahil olmayanlar (\| ile ayrılmış) | `Kişisel harcamalar` |

---

## 🎯 Sütun Eşleştirme (Mapping)

CSV'nizdeki sütun adları farklı olabilir. Wizard'da eşleştirme yapın:

### Örnek Eşleştirme

```
CSV Sütunu          →  Database Alanı
─────────────────────────────────────
Tur Adı             →  title
Açıklama            →  description
Tür                 →  category
Başlangıç           →  startLocation
Varış               →  endLocation
Tarih               →  startAt
Ücret               →  price
Para Birimi         →  currency
Koltuk              →  availableSeats
```

**Not:** Her CSV sütunu için bir hedef alan seçin. Kullanmak istemediğiniz sütunları "-- Seçiniz --" olarak bırakın.

---

## ✅ Validasyon Kuralları

### Kategori

```typescript
Geçerli değerler: 'tours', 'flights', 'buses', 'ships'
Hata: "Geçersiz kategori"
```

### Fiyat

```typescript
Format: Pozitif sayı (ondalıklı olabilir)
Örnek: 150, 150.50, 1250.99
Hata: "Fiyat geçerli bir pozitif sayı olmalıdır"
```

### Para Birimi

```typescript
Geçerli değerler: 'TRY', 'USD', 'EUR'
Büyük/küçük harf duyarsız (try, TRY, Try hepsi geçerli)
Hata: "Geçersiz para birimi"
```

### Tarih

```typescript
Format 1: YYYY-MM-DD (örn: 2025-10-10)
Format 2: YYYY-MM-DDTHH:mm:ss (örn: 2025-10-10T09:00:00)
Format 3: ISO 8601 (örn: 2025-10-10T09:00:00Z)
Hata: "Geçersiz tarih formatı"
```

### Koltuk Sayısı

```typescript
Format: Pozitif tamsayı
Örnek: 1, 10, 150
Hata: "Koltuk sayısı geçerli bir pozitif tamsayı olmalıdır"
```

---

## 📊 Import Süreci

### Adım 1: Dosya Yükle

```
POST /api/admin/import/parse
- CSV parse edilir
- Sütunlar algılanır
- İlk 5 satır preview gösterilir
```

### Adım 2: Sütun Eşleştir

```
UI'da mapping yapın
- Her CSV sütunu için hedef alan seç
- Zorunlu alanların eşleştiğinden emin olun
- Preview'da verileri kontrol edin
```

### Adım 3: Validasyon

```
POST /api/admin/import/validate
- Tüm satırlar valide edilir
- Geçerli/hatalı satır sayısı gösterilir
- İlk 10 hata preview olarak gösterilir
```

### Adım 4: İçe Aktar

```
POST /api/admin/import/execute
- Geçerli satırlar import edilir
- Hatalı satırlar atlanır
- error.csv oluşturulur (varsa)
```

---

## 📄 Error CSV

Hatalı satırlar için detaylı rapor:

```csv
Satır,Alan,Değer,Hata
2,price,abc,"Fiyat geçerli bir pozitif sayı olmalıdır"
3,category,train,"Geçersiz kategori. Olası değerler: tours, flights, buses, ships"
5,startAt,10-10-2025,"Geçersiz tarih formatı (ISO 8601 bekleniyor)"
```

### Dosya Formatı

- **Satır:** CSV'deki satır numarası (1-indexed, header hariç)
- **Alan:** Hatalı alan adı
- **Değer:** Girilen geçersiz değer
- **Hata:** Hata açıklaması

### Kullanım

1. Import tamamlandıktan sonra "error.csv İndir" butonuna tıklayın
2. Hataları düzeltin
3. Sadece hatalı satırları tekrar import edin

---

## 🧪 Test CSV Örnekleri

### Minimal (Sadece Zorunlu Alanlar)

```csv
title,category,startLocation,endLocation,startAt,price,currency
Test Tour,tours,İstanbul,Ankara,2025-10-10,100,TRY
```

### Full (Tüm Alanlar)

```csv
title,description,category,startLocation,endLocation,startAt,endAt,price,currency,availableSeats,images,highlights,included,excluded
İstanbul Boğaz Turu,Boğazda unutulmaz bir gün,tours,İstanbul,İstanbul,2025-10-10T09:00:00,2025-10-10T17:00:00,150.00,TRY,40,https://example.com/img1.jpg|https://example.com/img2.jpg,Boğaz manzarası|Öğle yemeği|Rehberli tur,Yemek|İçecek|Rehber,Kişisel harcamalar|Ekstra turlar
```

### Hatalı (Test için)

```csv
title,category,startLocation,endLocation,startAt,price,currency
Tour 1,invalid_category,İstanbul,Ankara,2025-10-10,100,TRY
Tour 2,tours,İstanbul,Ankara,invalid_date,abc,TRY
Tour 3,tours,İstanbul,Ankara,2025-10-10,100,INVALID
```

---

## 🔧 Troubleshooting

### CSV Parse Hatası

**Semptom:** "CSV parse hatası" mesajı

**Çözüm:**
- UTF-8 encoding kullanın
- Virgül (,) ile ayrılmış olduğundan emin olun
- Tırnak işareti içeren değerleri çift tırnak ("") ile escape edin
- Excel'den "CSV UTF-8" formatında kaydedin

### Sütun Eşleştirme Yapılamıyor

**Semptom:** "Zorunlu alan eşleştirilmedi" uyarısı

**Çözüm:**
- title, category, startLocation, endLocation, startAt, price, currency alanlarının hepsini eşleştirin
- Dropdown'dan doğru hedef alanı seçtiğinizden emin olun

### Validasyon Hataları

**Semptom:** Çok fazla hatalı satır

**Çözüm:**
- Error preview'da ilk 10 hatayı inceleyin
- Yaygın hataları düzeltin (örn: tarih formatı, kategori ismi)
- Düzeltilmiş CSV'yi tekrar yükleyin

### Import Başarısız

**Semptom:** "Import başarısız" mesajı

**Çözüm:**
- Browser console'da error detaylarını kontrol edin
- Supplier ID geçerli mi kontrol edin
- Database connection'ı kontrol edin
- Audit logs'a bakın: `/admin/audit-logs`

---

## 📈 Performance

### Limits

| Metric | Value |
|--------|-------|
| Max file size | 10 MB |
| Max rows | ~10,000 (recommended) |
| Import duration | ~1-2 satır/saniye |
| Timeout | 30 saniye |

### Optimization Tips

1. **Büyük dosyalar için:**
   - Batch'lere bölün (1000-2000 satır)
   - Her batch'i ayrı import edin

2. **Performans:**
   - Duplicate vendor IDs kullanmayın
   - Validasyon geçmeyen satırları önceden temizleyin

3. **Database:**
   - Index'ler otomatik kullanılır
   - Upsert yapıldığı için duplicate check eder

---

## 🔒 Security

### Admin Only

- Import sadece admin rolü ile erişilebilir
- Session kontrolü yapılır
- CSRF koruması

### Validation

- Tüm input valide edilir
- SQL injection koruması (Prisma ORM)
- File size limit

### Audit Logging

Her import işlemi AuditLog'a kaydedilir:

```typescript
{
  action: 'csv_import_completed',
  entity: 'offer',
  userId: 'admin-id',
  supplierId: 'supplier-1',
  metadata: {
    imported: 50,
    failed: 3,
    duration: 15
  }
}
```

---

## 📚 API Reference

### POST /api/admin/import/parse

**Request:**
```
Content-Type: multipart/form-data
file: CSV file
```

**Response:**
```json
{
  "success": true,
  "columns": ["title", "price", "category"],
  "preview": [{ "title": "Tour 1", "price": "100", "category": "tours" }],
  "totalRows": 50,
  "fileContent": "..."
}
```

### POST /api/admin/import/validate

**Request:**
```json
{
  "fileContent": "...",
  "mapping": { "title": "title", "price": "price" },
  "supplierId": "supplier-1"
}
```

**Response:**
```json
{
  "success": true,
  "totalRows": 50,
  "validRows": 47,
  "invalidRows": 3,
  "errors": [{ "row": 2, "field": "price", "value": "abc", "error": "..." }],
  "errorPreview": [...]
}
```

### POST /api/admin/import/execute

**Request:**
```json
{
  "fileContent": "...",
  "mapping": { "title": "title" },
  "supplierId": "supplier-1"
}
```

**Response:**
```json
{
  "success": true,
  "imported": 47,
  "failed": 3,
  "errors": [...],
  "errorCSV": "Satır,Alan,Değer,Hata\n2,price,abc,..."
}
```

---

## 🎓 Best Practices

### 1. Template Kullan

- Örnek template'i indir
- Kendi verilerinle doldur
- Format tutarlılığını koru

### 2. Test Et

- Önce küçük bir sample import et (5-10 satır)
- Validasyon'dan geçtiğinden emin ol
- Sonra full import yap

### 3. Hataları Düzelt

- error.csv'yi indir
- Hataları toplu düzelt (find & replace)
- Sadece hatalı satırları tekrar import et

### 4. Backup

- Import öncesi database backup al
- Büyük import'lar için test database kullan
- Production'a dikkatli import et

### 5. Monitoring

- Audit logs'u kontrol et
- Import stats'ı takip et
- Hata pattern'lerini analiz et

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

