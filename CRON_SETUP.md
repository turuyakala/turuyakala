# Cron Job Kurulumu

Bu proje, tedarikçilerden otomatik olarak teklif çekmek için iki farklı cron sistemi destekler:

## 🔧 Development (Yerel Geliştirme)

### Node-cron Kullanımı

Development ortamında `node-cron` kullanılır ve uygulama başladığında otomatik olarak aktif olur.

**Kurulum:**

1. Environment variables'ı ayarlayın:
```bash
ENABLE_CRON=true
```

2. Uygulamayı başlatın:
```bash
npm run dev
```

Cron job otomatik olarak başlayacak ve her 15 dakikada bir aktif tedarikçileri senkronize edecektir.

**Log Çıktısı:**
```
🚀 Initializing cron jobs...
✅ Cron jobs initialized
📅 Schedule: */15 * * * * (every 15 minutes)

⏰ Cron: Starting scheduled sync...
🔄 Starting supplier sync...
📋 Found 3 active suppliers
🔄 Syncing Acme Tours...
✅ Acme Tours: +12 new, ~5 updated, ✗0 failed
...
```

---

## 🚀 Production (Vercel)

### Vercel Cron Kullanımı

Production'da Vercel'in built-in Cron Jobs özelliği kullanılır.

**Kurulum:**

1. `vercel.json` dosyası zaten yapılandırılmış:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-suppliers",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

2. Environment variables'ı Vercel Dashboard'dan ayarlayın:
```bash
ENABLE_CRON=false  # Node-cron'u devre dışı bırak
CRON_SECRET=your-random-secret-here  # API endpoint'ini korumak için
ENCRYPTION_KEY=your-encryption-key-here
```

3. Deploy edin:
```bash
vercel --prod
```

Vercel otomatik olarak cron job'u tanıyacak ve her 15 dakikada bir `/api/cron/sync-suppliers` endpoint'ini çağıracaktır.

**Güvenlik:**
- Cron endpoint `CRON_SECRET` ile korunur
- Vercel otomatik olarak `Authorization: Bearer ${CRON_SECRET}` header'ı ekler

---

## 📊 Cron Schedule Formatı

```
*/15 * * * *
│   │ │ │ │
│   │ │ │ └─── Haftanın günü (0-7, Pazar=0 veya 7)
│   │ │ └───── Ay (1-12)
│   │ └─────── Ayın günü (1-31)
│   └───────── Saat (0-23)
└─────────────  Dakika (0-59)
```

**Örnekler:**
- `*/15 * * * *` - Her 15 dakikada bir
- `0 * * * *` - Her saat başı
- `0 */6 * * *` - Her 6 saatte bir
- `0 9 * * *` - Her gün saat 09:00'da
- `0 9 * * 1` - Her Pazartesi saat 09:00'da

---

## 🛠️ Rate Limiting & Exponential Backoff

Sistem otomatik olarak rate limit'leri yönetir:

### 429 Too Many Requests Handling

1. **Retry-After Header Kontrolü:**
   - API `Retry-After` header'ı döndürürse, belirtilen süre kadar bekler
   - Header yoksa exponential backoff kullanır

2. **Exponential Backoff:**
   ```
   Attempt 1: 2^1 * 1000ms = 2 seconds
   Attempt 2: 2^2 * 1000ms = 4 seconds
   Attempt 3: 2^3 * 1000ms = 8 seconds
   ...
   Max: 5 minutes (300000ms)
   ```

3. **Supplier Skip Logic:**
   - Rate limit'e takılan supplier'lar geçici olarak atlanır
   - Backoff süresi dolduktan sonra tekrar denenir

### Rate Limit Tracking

Her rate limit olayı şu yerlere kaydedilir:
- **JobRun:** `status=failed`, `error` mesajı
- **AuditLog:** `action=rate_limit_hit`, backoff detayları

---

## 📝 Audit Logging

Tüm cron aktiviteleri `AuditLog` tablosuna kaydedilir:

### Log Türleri

| Action | Açıklama |
|--------|----------|
| `sync_started` | Senkronizasyon başladı |
| `sync_completed` | Başarılı tamamlandı |
| `sync_failed` | Hata ile sonuçlandı |
| `rate_limit_hit` | Rate limit'e takıldı |

### Örnek Log Sorgusu

```typescript
// Son 24 saatteki rate limit olayları
const rateLimitEvents = await prisma.auditLog.findMany({
  where: {
    action: 'rate_limit_hit',
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  },
  include: {
    supplier: true,
  },
});
```

---

## 🔍 Monitoring & Debugging

### Admin Panel

Cron job'ların durumunu `/admin/jobs` sayfasından izleyebilirsiniz:

- **Görevler Tab:** Tüm job'lar ve durumları
- **Çalıştırma Logları Tab:** Detaylı execution logs

### Manuel Tetikleme

Development'ta manuel olarak tetiklemek için:

```typescript
import { syncAllSuppliers } from '@/lib/jobs/syncService';

// Tüm supplier'ları senkronize et
await syncAllSuppliers();

// Tek bir supplier'ı senkronize et
import { syncSupplierOffers } from '@/lib/jobs/syncService';
await syncSupplierOffers('supplier-id');
```

### API Endpoint Testi

Cron endpoint'ini manuel test etmek için:

```bash
curl -X POST http://localhost:3000/api/cron/sync-suppliers \
  -H "Authorization: Bearer your-cron-secret"
```

---

## ⚙️ Environment Variables

| Variable | Gerekli | Açıklama | Örnek |
|----------|---------|----------|-------|
| `ENABLE_CRON` | Hayır | Node-cron'u aktif et | `true` (dev), `false` (prod) |
| `CRON_SECRET` | Evet (prod) | API endpoint koruma | `random-secret-123` |
| `ENCRYPTION_KEY` | Evet | Credential şifreleme | `64-char-hex-string` |

### Encryption Key Oluşturma

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐛 Troubleshooting

### Cron çalışmıyor

**Development:**
1. `ENABLE_CRON=true` olduğundan emin olun
2. Console'da "Cron jobs initialized" mesajını kontrol edin
3. Manuel tetikleme yapın: `syncAllSuppliers()`

**Production (Vercel):**
1. Vercel Dashboard > Settings > Cron Jobs kontrol edin
2. `vercel.json` dosyasının deploy edildiğinden emin olun
3. Logs'da cron execution'ları kontrol edin

### Rate limit sürekli alınıyor

1. Admin panel'den rate limit log'larını inceleyin
2. Backoff süresini kontrol edin
3. Supplier API rate limit kurallarını gözden geçirin
4. Cron interval'ını artırmayı düşünün (örn. 30 dakika)

### Job run tamamlanmıyor

1. `/admin/jobs` sayfasından detaylı error'ları kontrol edin
2. Supplier API endpoint'inin erişilebilir olduğundan emin olun
3. Credential'ların doğru şifrelendiğini kontrol edin

---

## 📚 İlgili Dosyalar

- `lib/jobs/syncService.ts` - Ana senkronizasyon mantığı
- `lib/jobs/cronJobs.ts` - Node-cron scheduler
- `src/app/api/cron/sync-suppliers/route.ts` - Vercel cron endpoint
- `vercel.json` - Vercel cron konfigürasyonu
- `prisma/schema.prisma` - JobRun ve AuditLog modelleri

---

## 🔄 Güncelleme Geçmişi

- **v1.0.0** - İlk implementasyon (15 dakika interval, rate limiting, audit logs)

