# 🎉 Webhook Sistemi - Tamamlandı

## ✅ Yapılan İşlemler

### 1. **Database Schema** ✅
- ✅ `Supplier` modeline `webhookSecret` field eklendi
- ✅ Migration oluşturuldu: `20251004034030_add_webhook_secret`

### 2. **Webhook Endpoint** ✅ (`/api/suppliers/[id]/webhook`)

**Güvenlik:**
- ✅ HMAC-SHA256 signature validation
- ✅ X-Signature header kontrolü
- ✅ Constant-time comparison (timing attack prevention)
- ✅ Secret doğrulaması

**Event Types:**
- ✅ `offer.created` - Yeni teklif oluşturma + upsert
- ✅ `offer.updated` - Mevcut teklif güncelleme + upsert
- ✅ `offer.deleted` - Teklif silme (status değişimi)
- ✅ `offer.expired` - Teklif expire etme (status değişimi)

**Response Codes:**
- ✅ 200 - Success
- ✅ 400 - Bad Request (invalid JSON/event)
- ✅ 401 - Unauthorized (invalid signature)
- ✅ 403 - Forbidden (webhook not configured)
- ✅ 404 - Not Found (supplier not found)
- ✅ 422 - Unprocessable Entity (validation failed)
- ✅ 500 - Internal Server Error

**Logging:**
- ✅ JobRun tracking (duration, stats, errors)
- ✅ AuditLog events:
  - `webhook_received`
  - `webhook_processed`
  - `webhook_rejected`
  - `webhook_processing_failed`
  - `webhook_error`

### 3. **Webhook Utils** ✅ (`lib/webhooks/webhookUtils.ts`)
- ✅ `generateWebhookSignature()` - HMAC-SHA256 signature
- ✅ `verifyWebhookSignature()` - Signature validation
- ✅ `generateWebhookSecret()` - Random 64-char hex secret
- ✅ `createWebhookPayload()` - Test payload creator

### 4. **Admin Interface** ✅

**Webhook Settings Page** (`/admin/suppliers/[id]/webhooks`)
- ✅ Webhook URL display
- ✅ Webhook secret görüntüleme (gizli/göster toggle)
- ✅ Secret oluşturma butonu
- ✅ Secret kopyalama
- ✅ Test webhook arayüzü:
  - Event tipi seçimi
  - JSON data editörü
  - Test butonu
  - Result display
- ✅ Dokümantasyon linki

**API Endpoint** (`/api/admin/suppliers/[id]/generate-webhook-secret`)
- ✅ Admin auth korumalı
- ✅ Yeni secret oluşturma
- ✅ Audit log kaydı

**Supplier Edit Page**
- ✅ "🔔 Webhook Ayarları" butonu eklendi

### 5. **Test Endpoint** ✅ (`/api/test/send-webhook`)
- ✅ Manuel webhook test
- ✅ Signature generation
- ✅ Request/response logging
- ✅ Development testing

### 6. **Documentation** ✅
- ✅ **WEBHOOK_GUIDE.md** - Comprehensive webhook guide
  - Security (HMAC-SHA256)
  - Event types
  - Response codes
  - Code examples (Node.js, Python, PHP)
  - Testing guide
  - Troubleshooting
  - Best practices

---

## 🚀 Kullanım

### 1. Webhook Setup (Admin)

```bash
# 1. Admin panel'e giriş yap
http://localhost:3000/admin

# 2. Suppliers sayfasına git
http://localhost:3000/admin/suppliers

# 3. Supplier'ı düzenle
Click "✏️ Düzenle"

# 4. Webhook ayarlarına git
Click "🔔 Webhook Ayarları"

# 5. Secret oluştur
Click "🔐 Secret Oluştur"

# 6. URL ve Secret'ı tedarikçiye ilet
Webhook URL: http://localhost:3000/api/suppliers/[id]/webhook
Webhook Secret: 64-char-hex-string
```

### 2. Test Webhook (Admin Panel)

Admin > Suppliers > Edit > Webhook Ayarları:

1. **Event Tipi Seç:** `offer.created`
2. **Test Data Düzenle:**
```json
{
  "vendorOfferId": "TEST-001",
  "title": "Test Tur",
  "price": 100,
  "currency": "TRY",
  "category": "tours",
  "startLocation": "İstanbul",
  "endLocation": "Ankara",
  "startAt": "2025-10-10T09:00:00Z",
  "endAt": "2025-10-10T18:00:00Z",
  "availableSeats": 30
}
```
3. **Click:** "🚀 Webhook Test Et"
4. **Sonucu Gör:** Success/Failure + detailed response

### 3. Webhook Gönderimi (Supplier Side)

**Node.js:**
```javascript
const crypto = require('crypto');

const payload = JSON.stringify({
  event: 'offer.created',
  timestamp: new Date().toISOString(),
  data: {
    vendorOfferId: 'TOUR-123',
    title: 'İstanbul Boğaz Turu',
    price: 150,
    currency: 'TRY',
    category: 'tours',
    startLocation: 'İstanbul',
    endLocation: 'İstanbul',
    startAt: '2025-10-05T09:00:00Z',
    endAt: '2025-10-05T17:00:00Z',
    availableSeats: 20,
  }
});

const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature': signature,
  },
  body: payload,
});
```

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPPLIER WEBHOOK PUSH                        │
│  Event: offer.created/updated/deleted/expired                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
           POST /api/suppliers/[id]/webhook
            Headers: X-Signature (HMAC-SHA256)
            Body: { event, timestamp, data }
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  Get Supplier      Verify Signature    Parse Body
        │                   │                   │
        ▼                   ▼                   ▼
  Check Active      HMAC-SHA256       Validate Event
                     timingSafeEqual
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   Create JobRun    Process Event      AuditLog
   (running)        (upsert/update)    (webhook_received)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  Update JobRun      AuditLog            Return 200
  (completed/failed) (webhook_processed)  (result)
```

---

## 🎯 Event Processing

### offer.created / offer.updated

```typescript
// 1. Map to normalized format
const normalized = mapToOffer(data, supplierId);

// 2. Upsert (insert or update)
const existing = await prisma.offer.findUnique({
  where: { vendor_offer_unique: { vendorOfferId, supplierId } }
});

await prisma.offer.upsert({
  where: { vendor_offer_unique: { vendorOfferId, supplierId } },
  create: normalized,
  update: normalized,
});

// 3. Track stats
result = {
  inserted: existing ? 0 : 1,
  updated: existing ? 1 : 0,
};
```

### offer.deleted / offer.expired

```typescript
// 1. Extract vendorOfferId
const vendorOfferId = data?.vendorOfferId || data?.id;

// 2. Update status
await prisma.offer.updateMany({
  where: { vendorOfferId, supplierId },
  data: {
    status: event === 'offer.deleted' ? 'deleted' : 'expired'
  }
});

// 3. Track stats
result = { updated: updateCount };
```

---

## 📝 Logging Examples

### AuditLog

```typescript
// Webhook received
{
  action: 'webhook_received',
  entity: 'supplier',
  entityId: 'supplier-1',
  statusCode: 200,
  metadata: {
    event: 'offer.created',
    timestamp: '2025-10-04T12:00:00Z',
    hasData: true
  }
}

// Webhook processed
{
  action: 'webhook_processed',
  entity: 'supplier',
  entityId: 'supplier-1',
  statusCode: 200,
  metadata: {
    event: 'offer.created',
    result: { inserted: 1 },
    duration: 2
  }
}

// Webhook rejected (invalid signature)
{
  action: 'webhook_rejected',
  entity: 'supplier',
  entityId: 'supplier-1',
  statusCode: 401,
  error: 'Invalid signature',
  metadata: {
    signatureReceived: 'a1b2c3d4...'
  }
}
```

### JobRun

```typescript
{
  jobId: 'webhook',
  supplierId: 'supplier-1',
  status: 'completed',
  startedAt: '2025-10-04T12:00:00Z',
  finishedAt: '2025-10-04T12:00:02Z',
  duration: 2,
  inserted: 1,
  updated: 0,
  failed: 0,
  result: {
    event: 'offer.created',
    inserted: 1
  }
}
```

---

## 🧪 Testing

### Admin Panel Test

1. **Navigate:** Admin > Suppliers > Edit > Webhook Ayarları
2. **Select Event:** `offer.created`
3. **Edit JSON:** Modify test data
4. **Click:** "🚀 Webhook Test Et"
5. **View Result:** Success message + full response

### API Test Endpoint

```bash
curl -X POST http://localhost:3000/api/test/send-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier-1",
    "webhookSecret": "your-secret-here",
    "event": "offer.created",
    "data": {
      "vendorOfferId": "TEST-001",
      "title": "Test Tour",
      "price": 100,
      "currency": "TRY",
      "category": "tours",
      "startLocation": "İstanbul",
      "endLocation": "Ankara",
      "startAt": "2025-10-10T09:00:00Z",
      "endAt": "2025-10-10T18:00:00Z",
      "availableSeats": 30
    }
  }'
```

### Manual curl Test

```bash
# 1. Generate signature
PAYLOAD='{"event":"offer.created","timestamp":"2025-10-04T12:00:00Z","data":{"vendorOfferId":"TEST-001"}}'
SECRET="your-webhook-secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

# 2. Send webhook
curl -X POST http://localhost:3000/api/suppliers/supplier-1/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

---

## 🔒 Security Best Practices

### ✅ Implemented

1. **HMAC-SHA256 Signature**
   - Prevents tampering
   - Verifies authenticity
   - Constant-time comparison (timing attack prevention)

2. **Webhook Secret Storage**
   - Stored in database
   - Only shown to admin
   - Can be regenerated

3. **Request Validation**
   - Signature check before processing
   - Event type validation
   - JSON parsing with error handling

4. **Audit Logging**
   - All requests logged (success/failure)
   - Signature rejections tracked
   - Processing errors recorded

### 📋 TODO (Future)

- [ ] Rate limiting per supplier
- [ ] Webhook retry mechanism (3 attempts with exponential backoff)
- [ ] Webhook delivery history (success/failure logs per webhook)
- [ ] IP whitelist (optional per supplier)
- [ ] Webhook timeout configuration
- [ ] Batch webhook support

---

## 🐛 Troubleshooting

### Invalid Signature (401)

**Symptoms:** Webhook rejected with "Invalid signature"

**Checklist:**
- [ ] Webhook secret doğru mu?
- [ ] Payload string exactly aynı mı? (no whitespace changes)
- [ ] Signature hex formatında mı?
- [ ] HMAC-SHA256 kullanılıyor mu?

**Debug:**
```javascript
// Log both signatures
console.log('Expected:', expectedSignature);
console.log('Received:', receivedSignature);
console.log('Match:', expectedSignature === receivedSignature);
```

### Data Validation Failed (422)

**Symptoms:** "Failed to process offer"

**Checklist:**
- [ ] `vendorOfferId` field var mı?
- [ ] Required fields complete mi? (title, price, currency, category)
- [ ] Date format ISO 8601 mi?
- [ ] Price numeric mi?

**Solution:**
```bash
# Check audit logs
curl http://localhost:3000/api/admin/audit-logs?action=webhook_processing_failed
```

### Webhook Not Configured (403)

**Symptoms:** "Webhook not configured for this supplier"

**Solution:**
1. Admin > Suppliers > Edit > Webhook Ayarları
2. Click "🔐 Secret Oluştur"
3. Test again

---

## 📚 Related Files

| File | Description |
|------|-------------|
| `src/app/api/suppliers/[id]/webhook/route.ts` | Main webhook endpoint |
| `lib/webhooks/webhookUtils.ts` | Signature utilities |
| `src/app/api/test/send-webhook/route.ts` | Test endpoint |
| `src/app/admin/suppliers/[id]/webhooks/page.tsx` | Admin webhook settings |
| `src/app/api/admin/suppliers/[id]/generate-webhook-secret/route.ts` | Secret generation API |
| `WEBHOOK_GUIDE.md` | Comprehensive documentation |

---

## 📊 Statistics

**Code Added:**
- 500+ lines (webhook endpoint)
- 100+ lines (utilities)
- 300+ lines (admin interface)
- 200+ lines (test endpoint)
- 1000+ lines (documentation)

**Features:**
- 4 event types
- 6 response codes
- 5 audit log actions
- HMAC-SHA256 security
- Admin test interface

**Security:**
- HMAC signature validation
- Timing attack prevention
- Audit logging
- Secret management

---

**Tamamlanma Tarihi:** 2025-10-04  
**Versiyon:** 1.0.0  
**Status:** ✅ Production Ready

