# 🔐 Environment Variables Açıklaması

## Hangi Key Ne İçin Kullanılıyor?

### 1. DATABASE_URL ✅ (ZORUNLU)
**Ne için:** Supabase PostgreSQL bağlantısı (uygulama runtime)

**Kullanıldığı yerler:**
- Tüm database sorguları (Prisma Client)
- Connection pooling ile performans

**Nasıl alınır:**
```
Supabase Dashboard > Settings > Database > Connection String
Mode: Transaction (port 6543)
```

**Örnek:**
```env
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

---

### 2. DIRECT_URL ✅ (ZORUNLU - Migration için)
**Ne için:** Prisma migration çalıştırmak için direct PostgreSQL bağlantısı

**Kullanıldığı yerler:**
- `npx prisma migrate deploy`
- `npm run db:push`
- Sadece migration/schema değişiklikleri sırasında

**Nasıl alınır:**
```
Supabase Dashboard > Settings > Database > Connection String
Mode: Session (port 5432)
```

**Örnek:**
```env
DIRECT_URL="postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres"
```

---

### 3. NEXTAUTH_SECRET ✅ (ZORUNLU - Kullanıcı girişi için)
**Ne için:** NextAuth JWT token'larını şifrelemek

**Kullanıldığı yerler:**
- `lib/auth.ts` - JWT token imzalama
- Kullanıcı login/logout işlemleri
- Session güvenliği

**Nasıl oluşturulur:**
```bash
openssl rand -base64 32
```

**Örnek:**
```env
NEXTAUTH_SECRET="XyZ123abc456DEF789ghi012JKL345mno678pqr=="
```

**Ne olur eksik olursa:**
- ❌ Kullanıcı girişi çalışmaz
- ❌ Session hatası
- ❌ Admin panele erişilemez

---

### 4. ENCRYPTION_KEY ⚠️ (Tedarikçi entegrasyonu varsa ZORUNLU)
**Ne için:** Tedarikçi API credentials'ları database'de şifreli saklamak

**Kullanıldığı yerler:**
- `src/app/api/admin/suppliers/route.ts` - API key şifreleme
- `lib/jobs/syncService.ts` - API key şifre çözme
- Tedarikçi senkronizasyonu

**Nasıl oluşturulur:**
```bash
openssl rand -hex 32
```

**Örnek:**
```env
ENCRYPTION_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
```

**Ne olur eksik olursa:**
- ⚠️ Tedarikçi ekleyemezsiniz
- ⚠️ API senkronizasyonu çalışmaz
- ✅ Normal kullanıcı işlemleri etkilenmez

---

### 5. CRON_SECRET 🔧 (Opsiyonel - Production'da önerilen)
**Ne için:** Otomatik senkronizasyon endpoint'lerini korumak

**Kullanıldığı yerler:**
- `src/app/api/cron/sync-suppliers/route.ts` - Tedarikçi senkronizasyonu
- `src/app/api/cron/cleanup/route.ts` - Expired offer temizliği

**Nasıl oluşturulur:**
```bash
openssl rand -base64 32
```

**Örnek:**
```env
CRON_SECRET="AbC123dEf456GhI789jKl012MnO345pQr678StU=="
```

**Ne olur eksik olursa:**
- ⚠️ Cron endpoint'leri herkes tarafından erişilebilir olur
- ✅ Development'ta sorun yok
- ❌ Production'da güvenlik riski

---

## 📝 Tam .env Dosyası Örneği

```env
# ===========================================
# DATABASE (Supabase PostgreSQL)
# ===========================================
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxxxx:password@db.xxxxx.supabase.co:5432/postgres"

# ===========================================
# AUTHENTICATION (ZORUNLU)
# ===========================================
NEXTAUTH_SECRET="XyZ123abc456DEF789ghi012JKL345mno678pqr=="

# ===========================================
# ENCRYPTION (Tedarikçi varsa ZORUNLU)
# ===========================================
ENCRYPTION_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

# ===========================================
# CRON JOBS (Production'da önerilen)
# ===========================================
CRON_SECRET="AbC123dEf456GhI789jKl012MnO345pQr678StU=="

# ===========================================
# APPLICATION
# ===========================================
NODE_ENV="development"
```

---

## ⚡ Hızlı Kurulum

### 1. Secret'leri Oluştur

```bash
# Terminal'de çalıştır:

# NEXTAUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY
openssl rand -hex 32

# CRON_SECRET
openssl rand -base64 32
```

### 2. .env Dosyası Oluştur

Proje kök dizininde `.env` dosyası oluştur ve yukarıdaki değerleri ekle.

### 3. Tabloları Oluştur

```bash
# Prisma Client oluştur
npm run db:generate

# Tabloları oluştur
npx prisma migrate deploy

# Örnek veri ekle (admin + sample tours)
npm run db:seed
```

### 4. Test Et

```bash
npm run dev
# http://localhost:3000
# Login: admin@turuyakala.com / Sacmabirsey12!
```

---

## 🎯 Öncelik Sırası

### Minimum (Çalışması için)
1. ✅ DATABASE_URL
2. ✅ DIRECT_URL
3. ✅ NEXTAUTH_SECRET

### Tam Özellikler İçin
4. ⚠️ ENCRYPTION_KEY (tedarikçi entegrasyonu için)
5. 🔧 CRON_SECRET (otomatik senkronizasyon için)

---

## ❓ SSS

### S: NEXTAUTH_SECRET olmadan çalışır mı?
**Cevap:** Hayır. Kullanıcı girişi çalışmaz, admin panele erişilemez.

### S: ENCRYPTION_KEY olmadan ne olur?
**Cevap:** Tedarikçi ekleyemezsiniz. Eğer tedarikçi entegrasyonu kullanmayacaksanız gerekmez.

### S: Development'ta CRON_SECRET gerekli mi?
**Cevap:** Hayır. Development'ta opsiyonel, production'da şiddetle önerilir.

### S: Supabase dışında başka bir şey kullanmam gerekir mi?
**Cevap:** Hayır. Sadece Supabase PostgreSQL yeterli. Redis, Docker gibi şeylere gerek yok.

---

## 🔒 Güvenlik Notları

1. ⚠️ **Secret'leri asla Git'e ekleme**
   - `.env` dosyası `.gitignore`'da
   - Sadece `.env.example` paylaş

2. ⚠️ **Production'da farklı secret'ler kullan**
   - Development ve production farklı olmalı
   - Düzenli olarak rotate et

3. ⚠️ **ENCRYPTION_KEY'i kaybetme**
   - Kaybedersen tedarikçi credentials'larını okuyamazsın
   - Backup al!

---

**Son Güncelleme:** 2025-11-07

