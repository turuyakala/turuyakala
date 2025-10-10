# 🧹 Otomatik Temizlik Sistemi

## Genel Bakış

Saatte bir çalışan otomatik temizlik sistemi, expired ve sold out offerları işaretler.

**Schedule:** Her saat başı (`0 * * * *`)  
**Duration:** ~2-5 saniye  
**Logging:** AuditLog kaydı

---

## 🎯 Temizlik Kuralları

### 1. EXPIRED (Süresi Dolmuş)

**Kural:**
```typescript
if (offer.startAt < now() && offer.status IN ['new', 'imported', 'active']) {
  offer.status = 'expired'
}
```

**Açıklama:**
- Kalkış zamanı geçmiş offerlar
- Sadece aktif durumda olanlar etkilenir
- Zaten expired/deleted/sold_out olanlar dokunulmaz

**Örnek:**
```
startAt: 2025-10-04 09:00:00
now:     2025-10-04 12:00:00
Result:  status → 'expired'
```

### 2. SOLD_OUT (Satış Tamamlandı)

**Kural:**
```typescript
if (offer.availableSeats <= 0 && offer.status IN ['new', 'imported', 'active']) {
  offer.status = 'sold_out'
}
```

**Açıklama:**
- Koltuk kalmamış offerlar
- Sadece aktif durumda olanlar etkilenir
- 0 veya negatif koltuk sayısı kontrolü

**Örnek:**
```
availableSeats: 0
status: 'active'
Result: status → 'sold_out'
```

---

## ⚙️ Sistem Mimarisi

### Development (Node-cron)

```typescript
// lib/jobs/cronJobs.ts
cron.schedule('0 * * * *', async () => {
  await cleanupExpiredOffers();
});
```

**Başlatma:**
```bash
ENABLE_CRON=true npm run dev
```

**Console Output:**
```
⏰ Cron: Starting cleanup...
🧹 Starting cleanup: Expired & Sold Out offers...
⏰ Marked 12 offers as EXPIRED (startAt < now)
🎟️ Marked 3 offers as SOLD_OUT (availableSeats <= 0)
✅ Cleanup completed: 12 expired, 3 sold out
```

### Production (Cloud Cron)

**AWS EventBridge veya benzeri bir cron servisi kullanılabilir:**

**Endpoint:** `GET /api/cron/cleanup`  
**Schedule:** `0 * * * *` (Her saat başı)  
**Auth:** `Authorization: Bearer ${CRON_SECRET}`

---

## 📊 Admin Dashboard

### Last Cleanup Display

Admin Stats sayfasında (`/admin/stats`) son temizlik zamanı gösterilir:

```
╔══════════════════════════════════════╗
║  🧹 Son Temizlik                     ║
║  04.10.2025 14:00                    ║
║  2 saat önce                         ║
╚══════════════════════════════════════╝
```

**API Endpoint:** `GET /api/admin/stats/last-cleanup`

**Response:**
```json
{
  "lastCleanup": "2025-10-04T14:00:00.000Z",
  "metadata": {
    "expired": 12,
    "soldOut": 3,
    "duration": 2
  }
}
```

---

## 📝 Audit Logging

Her cleanup işlemi AuditLog'a kaydedilir:

### Success Log

```typescript
{
  action: 'cleanup_completed',
  entity: 'offer',
  statusCode: 200,
  metadata: {
    expired: 12,
    soldOut: 3,
    duration: 2
  },
  createdAt: '2025-10-04T14:00:00Z'
}
```

### Failure Log

```typescript
{
  action: 'cleanup_failed',
  entity: 'offer',
  statusCode: 500,
  error: 'Database connection failed',
  metadata: {
    duration: 1
  },
  createdAt: '2025-10-04T14:00:00Z'
}
```

---

## 🧪 Testing

### Manual Trigger (Development)

```typescript
import { cleanupExpiredOffers } from '@/lib/jobs/cleanupService';

const result = await cleanupExpiredOffers();
console.log(result);
// { expired: 12, soldOut: 3 }
```

### API Test (Production)

```bash
curl -X POST http://localhost:3000/api/cron/cleanup \
  -H "Authorization: Bearer your-cron-secret"
```

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed",
  "expired": 12,
  "soldOut": 3
}
```

### Database Test

```sql
-- Create expired offer
INSERT INTO Offer (
  vendorOfferId, supplierId, title, priceMinor, currency,
  category, startLocation, endLocation,
  startAt, endAt, availableSeats, status
) VALUES (
  'TEST-EXPIRED', 'supplier-1', 'Test Expired',
  10000, 'TRY', 'tours', 'Istanbul', 'Ankara',
  datetime('now', '-1 hour'), datetime('now', '+7 hours'),
  10, 'active'
);

-- Create sold out offer
INSERT INTO Offer (
  vendorOfferId, supplierId, title, priceMinor, currency,
  category, startLocation, endLocation,
  startAt, endAt, availableSeats, status
) VALUES (
  'TEST-SOLDOUT', 'supplier-1', 'Test Sold Out',
  10000, 'TRY', 'tours', 'Istanbul', 'Ankara',
  datetime('now', '+24 hours'), datetime('now', '+32 hours'),
  0, 'active'
);

-- Run cleanup (manually)
-- Then check:
SELECT vendorOfferId, status FROM Offer 
WHERE vendorOfferId IN ('TEST-EXPIRED', 'TEST-SOLDOUT');
```

---

## 📈 Performance

### Metrics

| Metric | Value |
|--------|-------|
| Avg Duration | 2-5 seconds |
| DB Queries | 2 updateMany + 1 create |
| Memory | < 50MB |
| CPU | < 5% |

### Optimization

**Current:**
```typescript
// Two separate updateMany queries
await prisma.offer.updateMany({ where: { startAt: { lt: now } } });
await prisma.offer.updateMany({ where: { availableSeats: { lte: 0 } } });
```

**Future (if needed):**
```sql
-- Single raw SQL query
UPDATE Offer 
SET status = CASE 
  WHEN startAt < CURRENT_TIMESTAMP THEN 'expired'
  WHEN availableSeats <= 0 THEN 'sold_out'
  ELSE status
END
WHERE status IN ('new', 'imported', 'active')
  AND (startAt < CURRENT_TIMESTAMP OR availableSeats <= 0);
```

---

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOURLY CLEANUP TRIGGER                       │
│  Dev: node-cron (0 * * * *)                                    │
│  Prod: Cloud Cron (/api/cron/cleanup)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                cleanupExpiredOffers()
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  Get Current Time   updateMany (EXPIRED)  updateMany (SOLD_OUT)
    now = new Date()   startAt < now        availableSeats <= 0
                       status IN [active]    status IN [active]
                            │                   │
                            └─────────┬─────────┘
                                      │
                                      ▼
                              Create AuditLog
                          (cleanup_completed)
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                            ▼                   ▼
                    Return Result       Update Dashboard
                   {expired, soldOut}   (lastCleanup time)
```

---

## 🚨 Monitoring

### Key Metrics to Track

1. **Cleanup Success Rate**
   ```sql
   SELECT 
     DATE(createdAt) as date,
     COUNT(*) as total,
     SUM(CASE WHEN action = 'cleanup_completed' THEN 1 ELSE 0 END) as success,
     SUM(CASE WHEN action = 'cleanup_failed' THEN 1 ELSE 0 END) as failed
   FROM AuditLog
   WHERE action IN ('cleanup_completed', 'cleanup_failed')
   GROUP BY DATE(createdAt)
   ORDER BY date DESC
   LIMIT 7;
   ```

2. **Average Cleanup Count**
   ```sql
   SELECT 
     AVG(json_extract(metadata, '$.expired')) as avg_expired,
     AVG(json_extract(metadata, '$.soldOut')) as avg_sold_out,
     AVG(json_extract(metadata, '$.duration')) as avg_duration_sec
   FROM AuditLog
   WHERE action = 'cleanup_completed'
     AND createdAt >= datetime('now', '-7 days');
   ```

3. **Last Cleanup Status**
   ```sql
   SELECT action, createdAt, metadata, error
   FROM AuditLog
   WHERE action IN ('cleanup_completed', 'cleanup_failed')
   ORDER BY createdAt DESC
   LIMIT 1;
   ```

### Alerts

**Set up alerts for:**
- ❌ Cleanup failed 3+ times in a row
- ⚠️ No cleanup in last 2 hours
- 🔥 Cleanup taking > 30 seconds
- 📈 Marking > 1000 offers expired per hour

---

## 🐛 Troubleshooting

### Cleanup Not Running

**Symptoms:** Son temizlik zamanı güncellenmiyor

**Checklist:**
- [ ] `ENABLE_CRON=true` (development)
- [ ] Cron initialized? (console'da "Cron jobs initialized" var mı?)
- [ ] Cloud cron configured? (AWS EventBridge)
- [ ] `CRON_SECRET` set? (production)

**Debug:**
```bash
# Manual test
curl -X POST http://localhost:3000/api/cron/cleanup \
  -H "Authorization: Bearer your-secret"

# Check last cleanup
curl http://localhost:3000/api/admin/stats/last-cleanup
```

### Too Many Offers Marked

**Symptoms:** Her cleanup'ta 100+ offer işaretleniyor

**Possible Causes:**
1. **Supplier sync not working** - Old offers piling up
2. **Incorrect time zones** - startAt times wrong
3. **Data quality issues** - Invalid dates

**Solutions:**
```typescript
// Check offer distribution
const distribution = await prisma.offer.groupBy({
  by: ['status'],
  _count: true,
});

// Check startAt distribution
const timeline = await prisma.offer.groupBy({
  by: ['supplierId'],
  _count: true,
  where: {
    startAt: { lt: new Date() },
    status: { in: ['active', 'new'] },
  },
});
```

### Database Lock

**Symptoms:** Cleanup taking > 30 seconds

**Solutions:**
- Use indexes on `startAt` and `availableSeats`
- Consider batching (100 at a time)
- Run during low-traffic hours

```sql
-- Add indexes (if not exists)
CREATE INDEX idx_offer_startAt ON Offer(startAt);
CREATE INDEX idx_offer_availableSeats ON Offer(availableSeats);
CREATE INDEX idx_offer_status ON Offer(status);
```

---

## 🔒 Security

### CRON_SECRET Protection

**Cron Endpoint Authentication:**
```typescript
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Best Practices:**
- ✅ Use strong random secret (32+ chars)
- ✅ Rotate secret periodically
- ✅ Never commit to git
- ⚠️ Monitor unauthorized attempts

---

## 📚 Related Files

| File | Description |
|------|-------------|
| `lib/jobs/cleanupService.ts` | Main cleanup logic |
| `lib/jobs/cronJobs.ts` | Cron scheduler (dev) |
| `src/app/api/cron/cleanup/route.ts` | Cron endpoint |
| `src/app/admin/stats/page.tsx` | Dashboard UI |
| `src/app/api/admin/stats/last-cleanup/route.ts` | Last cleanup API |

---

## 🔜 Future Enhancements

- [ ] Cleanup stats in admin dashboard (chart)
- [ ] Email notification on high cleanup counts
- [ ] Soft delete before hard delete (30 days retention)
- [ ] Cleanup history page (all cleanups)
- [ ] Custom cleanup rules per supplier
- [ ] Dry-run mode (preview changes)
- [ ] Manual cleanup button (admin)

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

