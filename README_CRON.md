# 🔄 Otomatik Cron Sistemi

## Genel Bakış

Bu proje, tedarikçilerden otomatik olarak teklif çekmek için gelişmiş bir cron sistemi içerir:

- ✅ **15 dakikalık periyodik senkronizasyon**
- ✅ **Rate-limit yönetimi** (429 handling)
- ✅ **Exponential backoff** stratejisi
- ✅ **Sayfalı API çekimi** (pagination)
- ✅ **JobRun ve AuditLog kayıtları**
- ✅ **Dev/Prod uyumlu** (node-cron / Vercel Cron)

---

## 🚀 Hızlı Başlangıç

### Development (Yerel)

1. `.env` dosyasına ekleyin:
```bash
ENABLE_CRON=true
ENCRYPTION_KEY=your-encryption-key-here
```

2. Uygulamayı başlatın:
```bash
npm run dev
```

Cron otomatik başlar ve her 15 dakikada aktif tedarikçileri senkronize eder.

### Production (Vercel)

1. `vercel.json` zaten yapılandırılmış ✅
2. Environment variables'ı ayarlayın:
```bash
ENABLE_CRON=false  # Node-cron devre dışı
CRON_SECRET=your-secret
ENCRYPTION_KEY=your-key
```
3. Deploy: `vercel --prod`

---

## 📂 Dosya Yapısı

```
lib/jobs/
├── syncService.ts          # Ana senkronizasyon mantığı
│   ├── syncSupplierOffers()   # Tek supplier sync
│   ├── syncAllSuppliers()     # Tüm supplier'lar
│   ├── Rate limit tracking
│   └── Exponential backoff
│
└── cronJobs.ts             # Node-cron scheduler

src/app/api/cron/
└── sync-suppliers/
    └── route.ts            # Vercel cron endpoint

instrumentation.ts          # Cron başlatma (Next.js)
vercel.json                 # Vercel cron config
```

---

## ⚙️ Özellikler

### 1. Rate Limiting & Exponential Backoff

**429 Response Handling:**
```typescript
// Retry-After header varsa kullan
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  const backoffMs = retryAfter 
    ? parseInt(retryAfter) * 1000 
    : calculateBackoff(attempts); // 2^n * 1000ms
}
```

**Backoff Stratejisi:**
| Attempt | Delay | Max |
|---------|-------|-----|
| 1 | 2s | - |
| 2 | 4s | - |
| 3 | 8s | - |
| 4 | 16s | - |
| ... | ... | 5m |

### 2. Pagination Support

API'den sayfalı veri çeker:
```typescript
let page = 1;
while (hasMore) {
  const url = new URL(supplier.apiEndpoint);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', '100');
  
  const data = await fetch(url);
  // ...
  
  page++;
  await sleep(1000); // 1s delay between pages
}
```

### 3. Comprehensive Logging

Her işlem **JobRun** ve **AuditLog**'a kaydedilir:

**JobRun:**
- `status`: running, completed, failed
- `duration`: Süre (saniye)
- `inserted/updated/failed`: İstatistikler
- `error/errorStack`: Hata detayları

**AuditLog:**
- `sync_started`: Başlangıç
- `sync_completed`: Başarı
- `sync_failed`: Hata
- `rate_limit_hit`: Rate limit

---

## 🎯 Kullanım Senaryoları

### Manuel Tetikleme (Kod)

```typescript
import { syncSupplierOffers, syncAllSuppliers } from '@/lib/jobs/syncService';

// Tek supplier
await syncSupplierOffers('supplier-id');

// Tüm supplier'lar
const result = await syncAllSuppliers();
console.log(result); 
// { total: 3, successful: 2, failed: 0, skipped: 1 }
```

### API Endpoint (Manuel Test)

```bash
# Development
curl -X POST http://localhost:3000/api/cron/sync-suppliers \
  -H "Authorization: Bearer your-cron-secret"

# Production
curl -X POST https://yourapp.vercel.app/api/cron/sync-suppliers \
  -H "Authorization: Bearer your-cron-secret"
```

### Admin Panel Monitoring

1. **Görevler:** `/admin/jobs`
   - Job listesi ve durumları
   - Çalıştırma sayıları

2. **Audit Logs:** `/admin/audit-logs`
   - Detaylı event log'ları
   - Rate limit olayları
   - Hata mesajları

---

## 🔧 Yapılandırma

### Environment Variables

| Variable | Gerekli | Default | Açıklama |
|----------|---------|---------|----------|
| `ENABLE_CRON` | Hayır | `false` | Node-cron aktif mi? |
| `CRON_SECRET` | Evet (prod) | - | API endpoint koruma |
| `ENCRYPTION_KEY` | Evet | - | Credential şifreleme (64 char hex) |

### Cron Schedule Değiştirme

**Node-cron (development):**
```typescript
// lib/jobs/cronJobs.ts
cron.schedule('*/30 * * * *', async () => {
  // Her 30 dakika
});
```

**Vercel Cron (production):**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/sync-suppliers",
    "schedule": "0 * * * *"  // Her saat başı
  }]
}
```

---

## 🐛 Troubleshooting

### Cron çalışmıyor (Dev)

**Kontrol:**
1. Console'da "Cron jobs initialized" mesajı var mı?
2. `ENABLE_CRON=true` mi?
3. `instrumentation.ts` çalışıyor mu?

**Çözüm:**
```bash
# Logs kontrol
npm run dev | grep "Cron"

# Manuel tetikleme
node -e "require('./lib/jobs/syncService').syncAllSuppliers()"
```

### Rate limit sürekli alınıyor

**Kontrol:**
1. Admin > Audit Logs'da `rate_limit_hit` log'larını inceleyin
2. Supplier API dokümantasyonunu kontrol edin

**Çözüm:**
- Cron interval'ını artırın (30 dakika gibi)
- Supplier ile rate limit'i görüşün
- Sayfa başına item sayısını düşürün (100 → 50)

### Job run tamamlanmıyor

**Kontrol:**
1. Admin > Jobs > Çalıştırma Logları'nda error'ı görün
2. Supplier API endpoint'i erişilebilir mi?
3. Credentials doğru şifrelenmiş mi?

**Çözüm:**
```typescript
// Test encryption/decryption
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
const iv = crypto.randomBytes(16);

const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(JSON.stringify({ apiKey: 'test' }), 'utf8', 'hex');
encrypted += cipher.final('hex');

console.log('Encrypted:', encrypted);
console.log('IV:', iv.toString('hex'));
```

---

## 📊 Monitoring Best Practices

### 1. JobRun İzleme

```sql
-- En yavaş job'lar
SELECT 
  supplierId,
  AVG(duration) as avg_duration,
  MAX(duration) as max_duration
FROM JobRun
WHERE status = 'completed'
GROUP BY supplierId
ORDER BY avg_duration DESC;
```

### 2. Rate Limit Analizi

```sql
-- Son 24 saatte rate limit
SELECT 
  supplierId,
  COUNT(*) as hit_count,
  json_extract(metadata, '$.backoffMs') as backoff
FROM AuditLog
WHERE action = 'rate_limit_hit'
  AND createdAt >= datetime('now', '-1 day')
GROUP BY supplierId;
```

### 3. Başarı Oranı

```sql
-- Son 7 günün başarı oranı
SELECT 
  DATE(startedAt) as date,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM JobRun
WHERE startedAt >= datetime('now', '-7 days')
GROUP BY DATE(startedAt)
ORDER BY date DESC;
```

---

## 🔒 Güvenlik

### 1. CRON_SECRET Koruma

Vercel cron endpoint'i `Authorization: Bearer ${CRON_SECRET}` ile korunur:

```typescript
// src/app/api/cron/sync-suppliers/route.ts
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. Credential Encryption

Supplier credentials AES-256-CBC ile şifrelenir:

```typescript
// Şifreleme
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
const encrypted = cipher.update(JSON.stringify(creds), 'utf8', 'hex') + cipher.final('hex');

// Çözme
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
```

---

## 📚 Detaylı Dokümantasyon

- **[CRON_SETUP.md](./CRON_SETUP.md)** - Kurulum ve konfigürasyon
- **[TEDARIKCI_ENTEGRASYONU.md](./TEDARIKCI_ENTEGRASYONU.md)** - Supplier entegrasyonu
- **Prisma Schema** - JobRun ve AuditLog modelleri

---

## 🎓 Örnek: Yeni Supplier Ekleme

```typescript
// 1. Admin'den supplier oluştur (credentials otomatik şifrelenir)
POST /api/admin/suppliers
{
  "name": "New Tours",
  "apiEndpoint": "https://api.newtours.com/offers",
  "apiCredentials": { "apiKey": "xyz" },
  "isActive": true
}

// 2. Manuel test et
POST /api/admin/suppliers/[id]/sync-now

// 3. Cron otomatik devreye girer (15 dakika sonra)

// 4. Sonuçları izle
GET /admin/jobs
GET /admin/audit-logs?supplierId=[id]
```

---

**Son Güncelleme:** 2025-10-04  
**Versiyon:** 1.0.0

