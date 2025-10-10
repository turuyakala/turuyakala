# 🚀 AWS Amplify Deployment Guide

Bu proje AWS Amplify ile deploy edilmek üzere yapılandırılmıştır.

## 📋 Gereksinimler

- AWS Hesabı
- GitHub Repository
- PostgreSQL Database (AWS RDS önerilir)

---

## 🔧 1. Environment Variables

Amplify Console'da aşağıdaki environment değişkenlerini ayarlayın:

### Zorunlu Değişkenler:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="https://your-app-url.amplifyapp.com"
NEXTAUTH_SECRET="your-random-32-char-secret-key"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"

# Cron Security
CRON_SECRET="your-random-cron-secret-key"
```

### Opsiyonel Değişkenler:

```bash
# Application Settings
DEFAULT_WINDOW_HOURS="72"

# Cron (development only)
ENABLE_CRON="false"
```

---

## 🗄️ 2. Database Kurulumu (AWS RDS)

### 2.1. PostgreSQL Database Oluşturma

1. AWS Console → RDS → Create Database
2. PostgreSQL seçin (latest version)
3. Template: Free tier veya Production
4. DB Instance Identifier: `turuyakala-db`
5. Master username: `postgres`
6. Master password: Güvenli bir şifre seçin
7. Public access: **Yes** (Amplify'dan erişim için)
8. Security Group: PostgreSQL (5432) portunu açın

### 2.2. Database Migration

Database oluşturduktan sonra, Amplify build sırasında otomatik migration çalışacak.

`amplify.yml` içinde zaten yapılandırılmış:
```yaml
build:
  commands:
    - npm run build    # Prisma generate + Next.js build
```

**Not:** `package.json`'da `postinstall` script'i ile Prisma client otomatik oluşturulur.

---

## 🌐 3. Amplify Console'da Kurulum

### 3.1. Repository Bağlama

1. [AWS Amplify Console](https://console.aws.amazon.com/amplify)'a gidin
2. **New app** → **Host web app**
3. GitHub'ı seçin ve repository'yi bağlayın
4. Branch: `main`
5. **Next**

### 3.2. Build Settings

Amplify otomatik olarak `amplify.yml` dosyasını algılayacak.

Eğer manuel yapılandırma gerekirse:

```yaml
version: 1
applications:
  - appRoot: /
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

### 3.3. Environment Variables

1. **App settings** → **Environment variables**
2. Yukarıdaki tüm environment değişkenlerini ekleyin
3. **Save**

### 3.4. Deploy

1. **Save and deploy**
2. İlk build ~5-10 dakika sürer
3. Build tamamlandığında URL'niz hazır: `https://main.xxxxx.amplifyapp.com`

---

## ⏱️ 4. Cron Jobs Kurulumu (AWS EventBridge)

Amplify'da Vercel gibi built-in cron desteği yok. AWS EventBridge kullanmanız gerekir.

### 4.1. EventBridge Rules Oluşturma

#### Cleanup Cron (Her Saat Başı)

1. **AWS Console** → **EventBridge** → **Rules** → **Create rule**
2. Name: `turuyakala-cleanup-hourly`
3. Rule type: **Schedule**
4. Schedule pattern: `cron(0 * * * ? *)`
5. Target: **API Gateway** veya **HTTP endpoint**
6. URL: `https://your-app.amplifyapp.com/api/cron/cleanup`
7. Method: **GET**
8. Headers:
   ```
   Authorization: Bearer YOUR_CRON_SECRET
   ```
9. **Create**

#### Supplier Sync (Her 15 Dakika)

1. **EventBridge** → **Rules** → **Create rule**
2. Name: `turuyakala-sync-15min`
3. Schedule: `cron(*/15 * * * ? *)`
4. Target URL: `https://your-app.amplifyapp.com/api/cron/sync-suppliers`
5. Headers:
   ```
   Authorization: Bearer YOUR_CRON_SECRET
   ```
6. **Create**

### 4.2. Alternatif: Lambda + EventBridge

Daha güvenli bir yöntem:

1. Lambda function oluştur
2. Lambda'dan internal API'yi çağır
3. EventBridge → Lambda'yı tetikle

---

## 🔐 5. Security Best Practices

### 5.1. Environment Secrets

- ✅ Tüm secret'ları Amplify Console'da saklayın
- ✅ Asla `.env` dosyasını commit etmeyin
- ✅ Strong random key'ler kullanın (32+ karakter)

### 5.2. Database Security

- ✅ RDS Security Group'unda sadece Amplify IP'lerini whitelist'leyin
- ✅ SSL connection kullanın: `?sslmode=require`
- ✅ Master user yerine application user oluşturun

### 5.3. Cron Security

- ✅ `CRON_SECRET` kullanın
- ✅ EventBridge'de authorization header'ı ayarlayın
- ✅ Rate limiting ekleyin

---

## 📊 6. Monitoring & Logs

### Build Logs
- Amplify Console → Your App → Build history
- Her commit için otomatik build

### Application Logs
- Amplify Console → Monitoring → Logs
- CloudWatch'ta daha detaylı loglar

### Database Monitoring
- RDS Console → Your Database → Monitoring
- CPU, Memory, Connections

---

## 🚀 7. Deployment Workflow

### Otomatik Deploy (Önerilen)

```bash
# Local'de geliştirme yap
git add .
git commit -m "feat: new feature"
git push origin main

# Amplify otomatik olarak build ve deploy eder
```

### Manuel Deploy

Amplify Console'dan:
1. **Redeploy this version** butonuna tıklayın

---

## 🔄 8. Database Migration Workflow

### Yeni Model Ekleme

```bash
# 1. Local'de schema düzenle
# prisma/schema.prisma

# 2. Migration oluştur
npx prisma migrate dev --name add_new_model

# 3. Git'e push et
git add .
git commit -m "db: add new model"
git push

# 4. Amplify build sırasında otomatik migrate deploy çalışır
```

---

## ⚠️ 9. Troubleshooting

### Build Fails

**Problem:** `Prisma Client` hatası

**Çözüm:**
```bash
# package.json içinde olduğundan emin olun:
"scripts": {
  "postinstall": "prisma generate"
}
```

### Database Connection Error

**Problem:** `Can't reach database server`

**Çözüm:**
1. RDS Security Group'unda 5432 portunu açın
2. Public access enabled olmalı
3. DATABASE_URL doğru mu kontrol edin

### Cron Jobs Not Running

**Problem:** EventBridge çalışmıyor

**Çözüm:**
1. EventBridge rule enabled mı?
2. Target URL doğru mu?
3. Authorization header doğru mu?
4. CloudWatch Logs'u kontrol edin

---

## 💰 10. Cost Estimation

### Free Tier (İlk 12 Ay)

- **Amplify:** 1000 build dakikası/ay, 15 GB serve
- **RDS:** db.t3.micro (750 saat/ay)
- **EventBridge:** 1M event/ay ücretsiz

### Ortalama Aylık Maliyet (Free Tier Sonrası)

- **Amplify:** ~$10-15 (build + hosting)
- **RDS PostgreSQL (db.t3.micro):** ~$15-20
- **EventBridge:** ~$1 (minimal)

**Toplam:** ~$25-35/ay

---

## 📚 11. Useful Commands

### Local Development
```bash
npm run dev              # Development server
npm run build            # Production build test
npm run db:studio        # Prisma Studio (local)
```

### Database
```bash
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Deploy migration (prod)
npx prisma studio        # Open Prisma Studio
npx prisma db push       # Push schema without migration
```

### Git
```bash
git status               # Check changes
git add .                # Stage all
git commit -m "message"  # Commit
git push origin main     # Deploy to Amplify
```

---

## 🔗 12. Useful Links

- [AWS Amplify Console](https://console.aws.amazon.com/amplify)
- [AWS RDS Console](https://console.aws.amazon.com/rds)
- [AWS EventBridge Console](https://console.aws.amazon.com/events)
- [Amplify Documentation](https://docs.amplify.aws/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## ✅ Deployment Checklist

- [ ] AWS hesabı oluşturuldu
- [ ] RDS PostgreSQL database kuruldu
- [ ] Amplify'da repository bağlandı
- [ ] Environment variables ayarlandı
- [ ] İlk build başarılı
- [ ] Database migration çalıştı
- [ ] Uygulama çalışıyor
- [ ] EventBridge cron rules oluşturuldu
- [ ] Cleanup cron test edildi
- [ ] Sync cron test edildi
- [ ] Custom domain bağlandı (opsiyonel)
- [ ] SSL sertifikası aktif

---

**Hazırlayan:** LastMinuteTour Team  
**Tarih:** Ekim 2025  
**Platform:** AWS Amplify + RDS + EventBridge

