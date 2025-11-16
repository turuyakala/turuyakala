# Ödeme Entegrasyonu Dokümantasyonu

Bu dokümantasyon, banka ödeme sistemi entegrasyonu için hazırlanmış API yapısını açıklar.

## 📋 Genel Bakış

API sistemi artık **sadece ödeme entegrasyonu** için kullanılmaktadır. Turlar API ile içeri aktarılmamaktadır; turlar admin paneli üzerinden manuel olarak eklenmektedir.

## 🔌 API Endpoints

### 1. Ödeme Başlatma
**POST** `/api/payment/init`

Rezervasyon oluşturulduktan sonra ödeme işlemini başlatır.

**Request Body:**
```json
{
  "orderId": "order-id-here",
  "paymentMethod": "credit_card" | "debit_card" | "bank_transfer",
  "returnUrl": "https://yoursite.com/payment/callback?orderId=xxx" // Opsiyonel
}
```

**Response:**
```json
{
  "success": true,
  "paymentReferenceId": "PAY-1234567890-ABC123",
  "orderId": "order-id",
  "amount": 50000,
  "currency": "TRY",
  "paymentMethod": "credit_card",
  "paymentUrl": "https://bank-payment-page.com/pay/xxx" // Banka entegrasyonu yapıldığında
}
```

### 2. Ödeme Callback/Webhook
**POST** `/api/payment/callback`

Banka ödeme sisteminden gelen callback/webhook isteklerini işler.

**Request Body (Banka API'sine göre değişecek):**
```json
{
  "paymentReferenceId": "PAY-1234567890-ABC123",
  "orderId": "order-id",
  "transactionId": "BANK-TXN-123456",
  "status": "success" | "failed" | "cancelled",
  "amount": 50000,
  "currency": "TRY",
  "paymentMethod": "credit_card",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ödeme durumu güncellendi",
  "orderId": "order-id",
  "paymentStatus": "paid"
}
```

**GET** `/api/payment/callback?orderId=xxx&status=success`

Kullanıcı ödeme sonrası yönlendirmesi için kullanılır.

### 3. Ödeme Durumu Sorgulama
**GET** `/api/payment/status?orderId=xxx` veya `?transactionId=xxx`

Ödeme durumunu sorgular.

**Response:**
```json
{
  "orderId": "order-id",
  "transactionId": "BANK-TXN-123456",
  "paymentStatus": "pending" | "paid" | "failed" | "refunded",
  "paymentMethod": "credit_card",
  "amount": 50000,
  "currency": "TRY",
  "seats": 2,
  "pnrCode": "PNR-123456",
  "tour": {
    "title": "Tur Başlığı",
    "from": "İstanbul",
    "to": "Antalya",
    "startAt": "2025-01-20T10:00:00Z"
  },
  "customer": {
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "phone": "+905551234567"
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

## 🔧 Banka Entegrasyonu

Banka entegrasyonu için `lib/payment/bankIntegration.ts` dosyasındaki fonksiyonlar implement edilmelidir:

### 1. `initBankPayment()`
Banka API'sine ödeme başlatma isteği gönderir.

### 2. `verifyBankSignature()`
Banka webhook signature doğrulaması yapar.

### 3. `checkBankPaymentStatus()`
Banka API'sinden ödeme durumunu sorgular.

## 🔐 Environment Variables

Banka entegrasyonu için gerekli environment variable'lar:

```env
# Banka API Konfigürasyonu
BANK_API_URL=https://api.bank.com
BANK_API_KEY=your-api-key-here
BANK_MERCHANT_ID=your-merchant-id
BANK_WEBHOOK_SECRET=your-webhook-secret

# NextAuth (mevcut)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 📝 Ödeme Akışı

1. **Rezervasyon Oluşturma**: Kullanıcı rezervasyon formunu doldurur → `/api/reservations` endpoint'i çağrılır
2. **Ödeme Başlatma**: Rezervasyon başarılı olunca → `/api/payment/init` endpoint'i çağrılır
3. **Banka Yönlendirme**: Banka ödeme sayfasına yönlendirilir (banka entegrasyonu yapıldığında)
4. **Ödeme Callback**: Banka ödeme sonucunu → `/api/payment/callback` endpoint'ine gönderir
5. **Durum Güncelleme**: Sipariş durumu güncellenir ve kullanıcıya bilgi verilir

## 🛠️ Implementasyon Adımları

1. **Banka API Dokümantasyonunu İnceleyin**
   - Ödeme başlatma endpoint'i
   - Webhook/callback formatı
   - Signature doğrulama yöntemi

2. **Environment Variables Ekleyin**
   - `.env` dosyasına banka API bilgilerini ekleyin

3. **`lib/payment/bankIntegration.ts` Dosyasını Güncelleyin**
   - `initBankPayment()` fonksiyonunu implement edin
   - `verifyBankSignature()` fonksiyonunu implement edin
   - `checkBankPaymentStatus()` fonksiyonunu implement edin

4. **API Endpoint'lerini Güncelleyin**
   - `src/app/api/payment/init/route.ts` - Banka API çağrısını ekleyin
   - `src/app/api/payment/callback/route.ts` - Signature doğrulamasını ekleyin

5. **Test Edin**
   - Test ortamında ödeme akışını test edin
   - Webhook'ları test edin

## 📌 Notlar

- Turlar API ile içeri aktarılmamaktadır
- Supplier entegrasyonu ve webhook sistemi mevcut ancak turlar için kullanılmamaktadır
- API sistemi sadece ödeme entegrasyonu için kullanılmaktadır
- Ödeme başarısız olursa koltuklar otomatik olarak geri yüklenir
- Ödeme başarılı olursa sipariş durumu "paid" olarak güncellenir



