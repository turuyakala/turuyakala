# 🔔 Webhook Integration Guide

## Overview

Bu proje, tedarikçilerin real-time güncellemeleri push etmesi için webhook sistemi destekler.

**Güvenlik:** HMAC-SHA256 signature validation  
**Event Types:** offer.created, offer.updated, offer.deleted, offer.expired  
**Logging:** Tüm webhook olayları JobRun ve AuditLog'a kaydedilir

---

## 🔐 Security (HMAC-SHA256)

### Webhook Secret Setup

1. **Admin Panel'den tedarikçi oluştururken:**
```typescript
// Webhook secret oluştur
const webhookSecret = crypto.randomBytes(32).toString('hex');

// Supplier kaydına ekle
await prisma.supplier.create({
  data: {
    name: 'Acme Tours',
    webhookSecret, // Store this
    // ...
  }
});
```

2. **Tedarikçiye webhook secret'ı iletmek:**
```
Webhook URL: https://yourapp.com/api/suppliers/[supplierId]/webhook
Webhook Secret: 64-char-hex-string
Signature Header: X-Signature
Algorithm: HMAC-SHA256
```

### Signature Calculation (Supplier Side)

**Node.js:**
```javascript
const crypto = require('crypto');

const payload = JSON.stringify({
  event: 'offer.created',
  timestamp: new Date().toISOString(),
  data: { /* offer data */ }
});

const hmac = crypto.createHmac('sha256', webhookSecret);
hmac.update(payload);
const signature = hmac.digest('hex');

// Send request
fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature': signature,
  },
  body: payload,
});
```

**Python:**
```python
import hmac
import hashlib
import json

payload = json.dumps({
    'event': 'offer.created',
    'timestamp': datetime.utcnow().isoformat(),
    'data': { } # offer data
})

signature = hmac.new(
    webhook_secret.encode(),
    payload.encode(),
    hashlib.sha256
).hexdigest()

requests.post(
    webhook_url,
    headers={
        'Content-Type': 'application/json',
        'X-Signature': signature
    },
    data=payload
)
```

**PHP:**
```php
$payload = json_encode([
    'event' => 'offer.created',
    'timestamp' => date('c'),
    'data' => [ /* offer data */ ]
]);

$signature = hash_hmac('sha256', $payload, $webhookSecret);

$ch = curl_init($webhookUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-Signature: ' . $signature
]);
curl_exec($ch);
```

---

## 📡 Webhook Endpoint

### URL Format
```
POST /api/suppliers/[supplierId]/webhook
```

### Headers
| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `X-Signature` | Yes | HMAC-SHA256 signature (hex) |

### Request Body
```json
{
  "event": "offer.created",
  "timestamp": "2025-10-04T12:00:00Z",
  "data": {
    "vendorOfferId": "TOUR-123",
    "title": "İstanbul Boğaz Turu",
    "price": 150.00,
    "currency": "TRY",
    "category": "tours",
    "startLocation": "İstanbul",
    "endLocation": "İstanbul",
    "startAt": "2025-10-05T09:00:00Z",
    "endAt": "2025-10-05T17:00:00Z",
    "availableSeats": 20,
    "description": "Boğaz turu deneyimi"
  }
}
```

---

## 🎯 Event Types

### 1. offer.created

**Yeni teklif oluşturuldu**

```json
{
  "event": "offer.created",
  "timestamp": "2025-10-04T12:00:00Z",
  "data": {
    "vendorOfferId": "TOUR-123",
    "title": "İstanbul Boğaz Turu",
    "price": 150.00,
    // ... full offer data
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Offer created",
  "event": "offer.created",
  "result": {
    "inserted": 1
  }
}
```

### 2. offer.updated

**Mevcut teklif güncellendi**

```json
{
  "event": "offer.updated",
  "timestamp": "2025-10-04T13:00:00Z",
  "data": {
    "vendorOfferId": "TOUR-123",
    "price": 120.00,  // Fiyat değişti
    "availableSeats": 15,  // Koltuk sayısı değişti
    // ... updated fields
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Offer updated",
  "event": "offer.updated",
  "result": {
    "updated": 1
  }
}
```

### 3. offer.deleted

**Teklif silindi**

```json
{
  "event": "offer.deleted",
  "timestamp": "2025-10-04T14:00:00Z",
  "data": {
    "vendorOfferId": "TOUR-123"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Offer marked as deleted",
  "event": "offer.deleted",
  "result": {
    "updated": 1
  }
}
```

### 4. offer.expired

**Teklif süresi doldu**

```json
{
  "event": "offer.expired",
  "timestamp": "2025-10-04T15:00:00Z",
  "data": {
    "vendorOfferId": "TOUR-123"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Offer marked as expired",
  "event": "offer.expired",
  "result": {
    "updated": 1
  }
}
```

---

## 📊 Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Webhook successfully processed |
| **400** | Bad Request | Invalid JSON or event type |
| **401** | Unauthorized | Missing or invalid signature |
| **403** | Forbidden | Webhook not configured for supplier |
| **404** | Not Found | Supplier not found |
| **422** | Unprocessable Entity | Data validation failed |
| **500** | Internal Error | Server error |

---

## 🧪 Testing

### Using Test Endpoint

```bash
curl -X POST http://localhost:3000/api/test/send-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier-1",
    "webhookSecret": "your-webhook-secret",
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

**Response:**
```json
{
  "success": true,
  "status": 200,
  "webhookUrl": "http://localhost:3000/api/suppliers/supplier-1/webhook",
  "payload": { /* original payload */ },
  "signature": "a1b2c3d4...",
  "response": {
    "success": true,
    "message": "Offer created",
    "event": "offer.created",
    "result": {
      "inserted": 1
    }
  }
}
```

### Manual Testing with curl

1. **Generate signature:**
```bash
echo -n '{"event":"offer.created","timestamp":"2025-10-04T12:00:00Z","data":{"vendorOfferId":"TEST-001"}}' | \
  openssl dgst -sha256 -hmac "your-webhook-secret" | \
  awk '{print $2}'
```

2. **Send webhook:**
```bash
curl -X POST http://localhost:3000/api/suppliers/supplier-1/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: your-calculated-signature" \
  -d '{"event":"offer.created","timestamp":"2025-10-04T12:00:00Z","data":{"vendorOfferId":"TEST-001"}}'
```

---

## 📝 Audit Logging

Tüm webhook olayları kaydedilir:

### AuditLog Actions

| Action | When | Status Code |
|--------|------|-------------|
| `webhook_received` | Signature doğrulandı | 200 |
| `webhook_processed` | Event başarıyla işlendi | 200 |
| `webhook_rejected` | Signature hatalı veya config yok | 401/403/404 |
| `webhook_processing_failed` | Data validation hatası | 422 |
| `webhook_error` | Server hatası | 500 |

### JobRun Tracking

Her webhook request için bir `JobRun` oluşturulur:
- `jobId`: `'webhook'`
- `status`: `running` → `completed` / `failed`
- `inserted/updated/failed`: İstatistikler
- `result`: JSON (event details)

### Admin Panel

**Audit Logs Sayfası** (`/admin/audit-logs`)
- Webhook event'lerini filtrele
- Signature reject'lerini gör
- Processing error'larını incele

**Jobs Sayfası** (`/admin/jobs`)
- Webhook execution'ları gör
- İstatistikleri izle

---

## 🔧 Best Practices

### 1. Signature Validation
- ✅ Always verify signature before processing
- ✅ Use constant-time comparison (timingSafeEqual)
- ✅ Reject requests with invalid signatures
- ⚠️ Never log webhook secrets

### 2. Idempotency
- ✅ Use `vendorOfferId` for deduplication
- ✅ Upsert operations (insert or update)
- ✅ Handle duplicate webhooks gracefully

### 3. Error Handling
- ✅ Return appropriate status codes
- ✅ Log all events to AuditLog
- ✅ Include error details in response
- ⚠️ Don't expose internal errors to suppliers

### 4. Performance
- ✅ Process webhooks asynchronously if needed
- ✅ Timeout after 30 seconds
- ✅ Rate limit per supplier (optional)
- ⚠️ Don't block webhook response

### 5. Monitoring
- ✅ Track webhook success rate
- ✅ Alert on high failure rates
- ✅ Monitor signature rejections
- ✅ Review audit logs regularly

---

## 🐛 Troubleshooting

### Signature Mismatch (401)

**Problem:** `Invalid signature` error

**Check:**
1. Webhook secret doğru mu?
2. Payload exactly aynı mı? (whitespace, line endings)
3. Signature hex format mı?
4. HMAC-SHA256 algoritması kullanılıyor mu?

**Debug:**
```javascript
// Log signature calculation
console.log('Payload:', payload);
console.log('Secret:', secret);
console.log('Expected:', expectedSignature);
console.log('Received:', receivedSignature);
```

### Data Validation Failed (422)

**Problem:** `Failed to process offer` error

**Check:**
1. `vendorOfferId` field var mı?
2. Required fields (title, price, currency, category) var mı?
3. Date format doğru mu? (ISO 8601)
4. Price numeric mi?

**Debug:**
```bash
# Check audit logs
curl http://localhost:3000/api/admin/audit-logs?action=webhook_processing_failed
```

### Webhook Not Received

**Problem:** Webhook gönderildi ama işlenmedi

**Check:**
1. URL doğru mu? (`/api/suppliers/[id]/webhook`)
2. Supplier ID doğru mu?
3. Webhook secret ayarlanmış mı?
4. Supplier aktif mi? (`isActive: true`)

**Debug:**
```sql
-- Check supplier config
SELECT id, name, webhookSecret, isActive 
FROM Supplier 
WHERE id = 'supplier-1';
```

---

## 📚 Code Examples

### Supplier Integration (Node.js)

```typescript
import crypto from 'crypto';

class WebhookSender {
  constructor(
    private webhookUrl: string,
    private webhookSecret: string
  ) {}

  async sendEvent(
    event: 'offer.created' | 'offer.updated' | 'offer.deleted' | 'offer.expired',
    data: any
  ) {
    const payload = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data,
    });

    const signature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
      },
      body: payload,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Webhook failed: ${error.error}`);
    }

    return await response.json();
  }

  async notifyOfferCreated(offer: any) {
    return this.sendEvent('offer.created', offer);
  }

  async notifyOfferUpdated(offer: any) {
    return this.sendEvent('offer.updated', offer);
  }

  async notifyOfferExpired(vendorOfferId: string) {
    return this.sendEvent('offer.expired', { vendorOfferId });
  }
}

// Usage
const webhook = new WebhookSender(
  'https://yourapp.com/api/suppliers/supplier-1/webhook',
  'your-webhook-secret'
);

await webhook.notifyOfferCreated({
  vendorOfferId: 'TOUR-123',
  title: 'İstanbul Tour',
  price: 150,
  // ...
});
```

---

## 🔜 Future Enhancements

- [ ] Webhook retry mechanism (exponential backoff)
- [ ] Webhook delivery history per supplier
- [ ] Batch webhook support (multiple offers)
- [ ] Webhook replay feature (admin panel)
- [ ] Rate limiting per supplier
- [ ] Custom webhook headers support
- [ ] Webhook timeout configuration

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0

