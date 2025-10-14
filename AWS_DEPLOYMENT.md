# AWS'e Deployment ve Domain Bağlama Rehberi

## 🎯 Genel Bakış

Bu rehber, lastminutetour projesini AWS'e deploy etmek ve domain bağlamak için adım adım talimatlar içerir.

## 📋 Ön Koşullar

- [ ] AWS Hesabı (henüz yoksa [aws.amazon.com](https://aws.amazon.com) üzerinden ücretsiz hesap açın)
- [ ] GitHub/GitLab/Bitbucket repository'si (kodunuz burada olmalı)
- [ ] Domain adı (GoDaddy, Namecheap, vb. üzerinden satın alınmış)
- [ ] PostgreSQL veritabanı (AWS RDS veya başka bir sağlayıcı)

---

## 🚀 ADIM 1: AWS Amplify ile Deployment

### 1.1. AWS Console'a Giriş
1. [AWS Console](https://console.aws.amazon.com)'a gidin
2. Sağ üstten **İstanbul (eu-south-1)** bölgesini seçin (Türkiye için en hızlı)
3. Arama çubuğuna "**Amplify**" yazın ve **AWS Amplify** servisini açın

### 1.2. Yeni Uygulama Oluşturma
1. **"Create new app"** veya **"New app" > "Host web app"** butonuna tıklayın
2. **Git sağlayıcınızı seçin**: GitHub, GitLab veya Bitbucket
3. **"Authorize AWS Amplify"** ile yetkilendirme yapın
4. Repository'nizi ve branch'inizi seçin (genellikle `main` veya `master`)
5. **"Next"** butonuna tıklayın

### 1.3. Build Ayarları
AWS otomatik olarak Next.js projenizi algılayacak ve build ayarlarını önerecektir. Aşağıdaki `amplify.yml` yapılandırmasının kullanıldığından emin olun:

```yaml
version: 1
applications:
  - appRoot: /
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - npx prisma generate
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

**Önemli:** Prisma kullanıyorsanız `preBuild` aşamasına `npx prisma generate` eklenmelidir.

### 1.4. Environment Variables (Çevre Değişkenleri)
"**Advanced settings**" > "**Environment variables**" bölümünden aşağıdaki değişkenleri ekleyin:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-generated-secret-key-here
NEXTAUTH_URL=https://your-temporary-amplify-url.amplifyapp.com
NODE_ENV=production
```

**NEXTAUTH_SECRET oluşturmak için:**
```bash
openssl rand -base64 32
```

### 1.5. Deploy Başlatma
1. Tüm ayarları gözden geçirin
2. **"Save and Deploy"** butonuna tıklayın
3. Deploy işlemi 5-10 dakika sürebilir
4. Deploy tamamlandığında size `https://main.d1234abcd.amplifyapp.com` gibi bir URL verilecektir

---

## 🌐 ADIM 2: Domain Bağlama

### 2.1. AWS Amplify'da Domain Ekleme
1. AWS Amplify Console'da projenizi açın
2. Sol menüden **"Domain management"** seçeneğine tıklayın
3. **"Add domain"** butonuna tıklayın
4. Domain adınızı girin (örn: `turuyakala.com`)
5. **"Configure domain"** butonuna tıklayın

### 2.2. Subdomain Yapılandırması
AWS size şu seçenekleri sunar:
- `www.turuyakala.com` → Ana site
- `turuyakala.com` (root domain) → www'ye redirect

**Önerilen yapılandırma:**
- ✅ `turuyakala.com` (root) → Ana site
- ✅ `www.turuyakala.com` → turuyakala.com'a redirect

### 2.3. SSL Sertifikası
AWS otomatik olarak **ücretsiz SSL sertifikası** (HTTPS) sağlar. Herhangi bir işlem yapmanıza gerek yok.

### 2.4. DNS Kayıtlarını Güncelleme

AWS size DNS kayıtları verecektir. Domain sağlayıcınızda (GoDaddy, Namecheap, vb.) aşağıdaki kayıtları eklemeniz gerekiyor:

#### Seçenek A: CNAME Kaydı (Önerilen)
Domain sağlayıcınızın DNS yönetim paneline gidin ve:

```
Type: CNAME
Name: www
Value: [AWS'in verdiği CNAME değeri]
TTL: 300
```

```
Type: CNAME  
Name: @  (veya boş)
Value: [AWS'in verdiği CNAME değeri]
TTL: 300
```

**Not:** Bazı domain sağlayıcılar root domain (@) için CNAME desteklemez. O zaman A kaydı kullanın.

#### Seçenek B: A Kaydı (Alternatif)
```
Type: A
Name: @
Value: [AWS'in verdiği IP adresi]
TTL: 300
```

```
Type: A
Name: www
Value: [AWS'in verdiği IP adresi]
TTL: 300
```

### 2.5. DNS Yayılımını Bekleme
- DNS değişiklikleri **15 dakika - 48 saat** arasında yayılabilir
- Genellikle 1-2 saat içinde aktif olur
- Kontrol etmek için: [https://dnschecker.org](https://dnschecker.org)

### 2.6. SSL Sertifikası Onayı
1. AWS, SSL sertifikası için DNS onayı isteyebilir
2. AWS Console'da size gösterilen CNAME kayıtlarını domain sağlayıcınıza eklemeniz gerekecek
3. Onay genellikle 5-30 dakika sürer

---

## 🗄️ ADIM 3: Veritabanı Kurulumu

### Seçenek A: AWS RDS (PostgreSQL) - Önerilen
1. AWS Console'da **RDS** servisine gidin
2. **"Create database"** tıklayın
3. **PostgreSQL** seçin
4. **Free tier** veya **Production** seçin
5. Database ayarları:
   - DB instance identifier: `lastminutetour-db`
   - Master username: `postgres`
   - Master password: (güçlü bir şifre)
   - Instance type: `db.t3.micro` (Free tier)
6. **"Create database"** tıklayın
7. Database endpoint'ini alın (örn: `lastminutetour-db.c1234.eu-south-1.rds.amazonaws.com`)
8. `DATABASE_URL` environment variable'ı güncelleyin:
   ```
   DATABASE_URL=postgresql://postgres:password@endpoint:5432/postgres
   ```

### Seçenek B: Dış Sağlayıcı
- [Neon.tech](https://neon.tech) - Ücretsiz PostgreSQL (önerilen)
- [Supabase](https://supabase.com) - Ücretsiz PostgreSQL + Auth
- [PlanetScale](https://planetscale.com) - MySQL (Prisma ile uyumlu)

---

## 🔧 ADIM 4: Post-Deployment Kontroller

### 4.1. Environment Variables Güncellemesi
Domain bağlandıktan sonra `NEXTAUTH_URL`'i güncelleyin:

```
NEXTAUTH_URL=https://turuyakala.com
```

AWS Amplify'da:
1. **App settings** > **Environment variables**
2. `NEXTAUTH_URL`'i düzenleyin
3. **Save** > **Redeploy** yapın

### 4.2. Database Migration
İlk deployment'tan sonra database'i migrate edin:

```bash
npx prisma migrate deploy
```

Veya AWS Amplify build aşamasına ekleyin:
```yaml
build:
  commands:
    - npx prisma migrate deploy
    - npm run build
```

### 4.3. Test Etme
- [ ] Ana sayfa yükleniyor mu?
- [ ] Login/Register çalışıyor mu?
- [ ] Veritabanı bağlantısı aktif mi?
- [ ] SSL (HTTPS) çalışıyor mu?
- [ ] www ve root domain düzgün yönleniyor mu?

---

## 🔄 ADIM 5: Otomatik Deployment

AWS Amplify, GitHub/GitLab'da yaptığınız her commit'i otomatik olarak deploy eder:

1. Kodu GitHub'a push edin
2. AWS Amplify otomatik olarak build başlatır
3. Build başarılı olursa canlıya alır
4. Hata varsa deploy durur ve size bildirim gönderir

### Branch Stratejisi
- `main` branch → Production (turuyakala.com)
- `develop` branch → Staging (develop.turuyakala.com)

---

## 🐛 Sık Karşılaşılan Sorunlar

### 1. "Module not found: Can't resolve '@prisma/client'"
**Çözüm:** `amplify.yml` dosyasına `npx prisma generate` ekleyin:
```yaml
preBuild:
  commands:
    - npm ci
    - npx prisma generate
```

### 2. "Database connection failed"
**Çözüm:** 
- `DATABASE_URL` environment variable doğru mu kontrol edin
- RDS Security Group'ta Amplify IP'lerini whitelist'e ekleyin
- Veya dış sağlayıcı kullanın (Neon, Supabase)

### 3. "NEXTAUTH_URL mismatch"
**Çözüm:** 
- Domain bağlandıktan sonra `NEXTAUTH_URL`'i güncelleyin
- Redeploy yapın

### 4. Domain yönlenmiyor
**Çözüm:**
- DNS kayıtlarını kontrol edin
- 48 saat bekleyin
- DNS cache'i temizleyin: `ipconfig /flushdns` (Windows)

### 5. SSL hatası (Mixed content)
**Çözüm:**
- Tüm içeriklerinizin HTTPS kullandığından emin olun
- Next.js config'de `images.unoptimized: true` ayarını kontrol edin

---

## 💰 Maliyet Tahmini

### AWS Amplify Hosting
- İlk 1000 build dakikası: Ücretsiz
- İlk 15 GB bandwidth: Ücretsiz
- Sonrası: ~$0.01/build dakikası, ~$0.15/GB bandwidth

### AWS RDS (Free Tier)
- 12 ay ücretsiz: 750 saat/ay db.t2.micro veya db.t3.micro
- 20 GB storage
- Sonrası: ~$15-30/ay

### Alternatif (Daha Ucuz)
- **Amplify Hosting**: ~$0 (low traffic için)
- **Neon/Supabase DB**: Ücretsiz (hobby projeler için)
- **Domain**: ~$10-15/yıl

**Toplam:** İlk yıl ~$10-15 (sadece domain), sonraki yıllar ~$0-50/ay

---

## 📚 Faydalı Linkler

- [AWS Amplify Docs](https://docs.amplify.aws/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Amplify](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-aws-amplify)
- [Custom Domain Setup](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html)

---

## 🆘 Yardıma mı İhtiyacınız Var?

Takıldığınız bir yer varsa:
1. Bu dosyadaki ilgili bölümü tekrar okuyun
2. AWS Console'daki hata mesajlarını kontrol edin
3. CloudWatch Logs'u inceleyin (Amplify > Monitoring > Logs)
4. GitHub Issues'ta benzer sorunlar arayın

---

**Son Güncelleme:** 13 Ekim 2025
**Proje:** LastMinuteTour (turuyakala.com)
**Next.js Versiyon:** 15.5.4
