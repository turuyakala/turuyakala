# 🔔 Webhook Sistemi

## 📖 Genel Bakış

Tedarikçiler, tekliflerini gerçek zamanlı olarak sisteme push edebilir.

**Güvenlik:** HMAC-SHA256 signature validation  
**Event Tipleri:** offer.created, offer.updated, offer.deleted, offer.expired  
**Loglama:** JobRun ve AuditLog otomatik

---

## 🚀 Kullanım

### 1. Admin Panelden Webhook Ayarla

```bash
# 1. Admin panel → Suppliers
http://localhost:3000/admin/suppliers

# 2. Supplier düzenle → "🔔 Webhook Ayarları"

# 3. Secret oluştur
Click "🔐 Secret Oluştur"

# 4. URL ve Secret'ı tedarikçiye ilet
Webhook URL: https://yourapp.com/api/suppliers/[supplierId]/webhook
Webhook Secret: 64-char-hex-string
```

### 2. Test Et (Admin Panelden)

1. Webhook Ayarları sayfasından
2. Event tipini seç (offer.created)
3. Test data düzenle
4. "🚀 Webhook Test Et" butonuna tıkla
5. Sonucu gör

---

## 🔐 Güvenlik (HMAC-SHA256)

### Webhook Secret Oluşturma

```typescript
// Admin panel otomatik oluşturur
const webhookSecret = crypto.randomBytes(32).toString('hex');
// Result: 64-char-hex-string
```

### Signature Hesaplama (Tedarikçi Tarafı)

**Node.js/TypeScript:**

```typescript
import crypto from 'crypto';

// 1. Payload oluştur
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
    availableSeats: 20,
  }
});

// 2. Signature oluştur
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

// 3. Request gönder
await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature': signature,
  },
  body: payload,
});
```

### Tedarikçi için Hazır Class

```typescript
class WebhookSender {
  constructor(
    private webhookUrl: string,
    private webhookSecret: string
  ) {}

  private createSignature(payload: string): string {
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
  }

  async sendEvent(
    event: 'offer.created' | 'offer.updated' | 'offer.deleted' | 'offer.expired',
    data: any
  ) {
    const payload = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data,
    });

    const signature = this.createSignature(payload);

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

  // Kolay kullanım metodları
  async notifyOfferCreated(offer: any) {
    return this.sendEvent('offer.created', offer);
  }

  async notifyOfferUpdated(offer: any) {
    return this.sendEvent('offer.updated', offer);
  }

  async notifyOfferDeleted(vendorOfferId: string) {
    return this.sendEvent('offer.deleted', { vendorOfferId });
  }

  async notifyOfferExpired(vendorOfferId: string) {
    return this.sendEvent('offer.expired', { vendorOfferId });
  }
}

// Kullanım
const webhook = new WebhookSender(
  'https://yourapp.com/api/suppliers/supplier-1/webhook',
  'your-webhook-secret-64-chars'
);

await webhook.notifyOfferCreated({
  vendorOfferId: 'TOUR-123',
  title: 'İstanbul Tour',
  price: 150,
  currency: 'TRY',
  category: 'tours',
  startLocation: 'İstanbul',
  endLocation: 'İstanbul',
  startAt: '2025-10-05T09:00:00Z',
  availableSeats: 20,
});
```

---

## 📡 Webhook Endpoint

### URL
```
POST /api/suppliers/[supplierId]/webhook
```

### Headers
| Header | Zorunlu | Açıklama |
|--------|---------|----------|
| `Content-Type` | ✅ | `application/json` |
| `X-Signature` | ✅ | HMAC-SHA256 signature (hex) |

### Request Body Format
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
    "availableSeats": 20
  }
}
```

---

## 🎯 Event Tipleri

### 1. offer.created
Yeni teklif oluşturuldu, database'e eklenir.

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

**Response:**
```json
{
  "success": true,
  "message": "Offer created",
  "event": "offer.created",
  "result": { "inserted": 1 }
}
```

### 2. offer.updated
Mevcut teklif güncellendi.

```json
{
  "event": "offer.updated",
  "timestamp": "2025-10-04T13:00:00Z",
  "data": {
    "vendorOfferId": "TOUR-123",
    "price": 120.00,  // Fiyat değişti
    "availableSeats": 15,
    // ... updated fields
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Offer updated",
  "result": { "updated": 1 }
}
```

### 3. offer.deleted
Teklif silindi (status değişir).

```json
{
  "event": "offer.deleted",
  "timestamp": "2025-10-04T14:00:00Z",
  "data": {
    "vendorOfferId": "TOUR-123"
  }
}
```

### 4. offer.expired
Teklif süresi doldu.

```json
{
  "event": "offer.expired",
  "timestamp": "2025-10-04T15:00:00Z",
  "data": {
    "vendorOfferId": "TOUR-123"
  }
}
```

---

## 📊 Response Kodları

| Kod | Anlamı | Açıklama |
|-----|--------|----------|
| **200** | OK | Webhook başarıyla işlendi |
| **400** | Bad Request | Geçersiz JSON veya event tipi |
| **401** | Unauthorized | Signature hatalı |
| **403** | Forbidden | Webhook ayarlanmamış |
| **404** | Not Found | Supplier bulunamadı |
| **422** | Unprocessable | Data validasyonu başarısız |
| **500** | Internal Error | Server hatası |

---

## 🧪 Test Etme

### Admin Panel Test

1. Admin > Suppliers > Edit > Webhook Ayarları
2. Event tipini seç
3. JSON data'yı düzenle
4. "🚀 Webhook Test Et"
5. Sonucu gör

### API Test Endpoint

```bash
curl -X POST http://localhost:3000/api/test/send-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "supplier-1",
    "webhookSecret": "your-secret",
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
      "availableSeats": 30
    }
  }'
```

### Manuel curl Test

```bash
# 1. Signature oluştur
PAYLOAD='{"event":"offer.created","timestamp":"2025-10-04T12:00:00Z","data":{"vendorOfferId":"TEST-001"}}'
SECRET="your-webhook-secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

# 2. Webhook gönder
curl -X POST http://localhost:3000/api/suppliers/supplier-1/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

---

## 📝 Loglama

### AuditLog Actions

| Action | Ne Zaman | Status |
|--------|----------|--------|
| `webhook_received` | Signature doğrulandı | 200 |
| `webhook_processed` | Event başarıyla işlendi | 200 |
| `webhook_rejected` | Signature hatalı | 401/403 |
| `webhook_processing_failed` | Validasyon hatası | 422 |
| `webhook_error` | Server hatası | 500 |

### JobRun Tracking

Her webhook için `JobRun` oluşturulur:
- `jobId`: `'webhook'`
- `status`: `running` → `completed` / `failed`
- `inserted/updated/failed`: İstatistikler
- `duration`: Süre (saniye)

### Admin Panel

**Audit Logs:** `/admin/audit-logs`
- Webhook event'lerini filtrele
- Hataları incele

**Jobs:** `/admin/jobs`
- Webhook execution'ları
- İstatistikler

---

## 🔧 Best Practices

### ✅ Yapılması Gerekenler

1. **Signature doğrula**
   - Her request'te signature kontrol et
   - Constant-time comparison kullan (timing attack önlemi)

2. **Idempotency**
   - `vendorOfferId` ile deduplication yap
   - Duplicate webhook'ları gracefully handle et

3. **Error handling**
   - Doğru HTTP status kodları dön
   - Tüm olayları AuditLog'a kaydet
   - Internal error'ları tedarikçiye gösterme

4. **Timeout**
   - 30 saniye timeout ayarla
   - Uzun işlemleri async yap

---

## 🐛 Sorun Giderme

### Signature Mismatch (401)

**Problem:** "Invalid signature" hatası

**Kontrol et:**
- [ ] Webhook secret doğru mu?
- [ ] Payload tamamen aynı mı? (whitespace dahil)
- [ ] Signature hex formatında mı?
- [ ] HMAC-SHA256 kullanılıyor mu?

**Debug:**
```javascript
console.log('Payload:', payload);
console.log('Secret:', secret);
console.log('Expected:', expectedSignature);
console.log('Received:', receivedSignature);
```

### Data Validation Failed (422)

**Problem:** "Failed to process offer"

**Kontrol et:**
- [ ] `vendorOfferId` var mı?
- [ ] Required fields complete mi? (title, price, currency, category)
- [ ] Date format ISO 8601 mi?
- [ ] Price sayı mı?

**Debug:**
```bash
# Audit logs kontrol et
curl http://localhost:3000/api/admin/audit-logs?action=webhook_processing_failed
```

### Webhook Not Configured (403)

**Problem:** "Webhook not configured for this supplier"

**Çözüm:**
1. Admin > Suppliers > Edit
2. Webhook Ayarları
3. "🔐 Secret Oluştur"
4. Tekrar dene

### Webhook Ulaşmıyor

**Kontrol et:**
- [ ] URL doğru mu?
- [ ] Supplier ID doğru mu?
- [ ] Supplier aktif mi? (`isActive: true`)
- [ ] Webhook secret ayarlanmış mı?

---

## 🔄 Veri Akışı

```
┌─────────────────────────────────────┐
│   Tedarikçi Event (offer.created)  │
└──────────────┬──────────────────────┘
               ↓
   POST /api/suppliers/[id]/webhook
   Headers: X-Signature (HMAC-SHA256)
   Body: { event, timestamp, data }
               ↓
    ┌──────────┴──────────┐
    ↓                     ↓
Get Supplier      Verify Signature
    ↓                     ↓
Check Active      HMAC-SHA256
                  timingSafeEqual
               ↓
    ┌──────────┴──────────┐
    ↓                     ↓
Create JobRun     Parse & Validate
(running)              Event
               ↓
    ┌──────────┴──────────┐
    ↓                     ↓
Process Event      AuditLog
(upsert/update)    (webhook_received)
               ↓
    ┌──────────┴──────────┐
    ↓                     ↓
Update JobRun      Return Response
(completed)        { success, result }
```

---

## 📚 İlgili Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `src/app/api/suppliers/[id]/webhook/route.ts` | Webhook endpoint |
| `lib/webhooks/webhookUtils.ts` | Signature utilities |
| `src/app/api/test/send-webhook/route.ts` | Test endpoint |
| `src/app/admin/suppliers/[id]/webhooks/page.tsx` | Admin UI |
| `src/app/api/admin/suppliers/[id]/generate-webhook-secret/route.ts` | Secret generation |

---

## ✅ Kurulum Checklist

- [ ] Supplier oluşturuldu
- [ ] Webhook secret oluşturuldu
- [ ] URL ve secret tedarikçiye iletildi
- [ ] Test webhook gönderildi
- [ ] Signature doğrulama çalışıyor
- [ ] Audit logs kontrol edildi
- [ ] Production'da test edildi

---

**Son Güncelleme:** 2025-10-04  
**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready


