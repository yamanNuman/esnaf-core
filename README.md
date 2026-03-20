# esnaf-core

Küçük işletmeler için geliştirilmiş ERP benzeri yönetim uygulaması. Ürün, borç, vergi ve muhasebe modüllerini tek bir arayüzden yönetmenizi sağlar.

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma v7 |
| Veritabanı | PostgreSQL |
| Validasyon | Zod v4 |
| Auth | JWT + bcrypt + GitHub OAuth |
| E-posta | Resend |
| Frontend | Vite + React + TypeScript + Tailwind CSS |
| AI | Groq API (Llama 3.3 70B) |
| Deploy | Docker Compose + Cloudflare Tunnel |

## Özellikler

- **Auth** — Kayıt, giriş, e-posta doğrulama, şifre sıfırlama, JWT + refresh token, GitHub OAuth ile giriş
- **Ürün Yönetimi** — Barkod, kategori, stok, maliyet/satış fiyat geçmişi
- **Borç Takibi** — Borç ekleme, ödeme/alım işlemleri, geçmiş
- **Vergi Takvimi** — KDV, Geçici Vergi, Stopaj, Yıllık Vergi otomatik takvim
- **Muhasebe** — Günlük ciro, giderler, banko giderler, ek gelirler, kenara ayrılan, aylık özet
- **AI Asistan** — Groq (Llama 3.3 70B) ile aylık muhasebe analizi, stok uyarısı ve borç önceliklendirmesi

## Proje Yapısı

```
esnaf-core/
├── server/                  # Express API
│   ├── src/
│   │   ├── constants/       # Sabitler (env, http, hata kodları)
│   │   ├── controllers/     # Route handler'ları
│   │   ├── emails/          # E-posta şablonları (Resend)
│   │   ├── middleware/      # Auth, authorize, hata yönetimi
│   │   ├── prisma/          # Schema, migration, seed
│   │   ├── routes/          # Express router'ları
│   │   ├── schemas/         # Zod validasyon şemaları
│   │   ├── services/        # İş mantığı
│   │   ├── types/           # TypeScript tip tanımları
│   │   └── utils/           # Yardımcı fonksiyonlar
│   ├── Dockerfile
│   ├── prisma.config.ts
│   └── package.json
├── client/                  # React SPA
│   ├── src/
│   │   ├── api/             # Axios istek fonksiyonları
│   │   ├── components/      # UI bileşenleri
│   │   ├── context/         # React context (kategori, borç)
│   │   ├── hooks/           # Custom hook'lar
│   │   ├── pages/           # Sayfa bileşenleri
│   │   └── types/           # TypeScript tip tanımları
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.prod.yml  # Production Docker Compose
└── .env.prod                # Production environment değişkenleri (git'e eklenmez!)
```

---

## Kurulum ve Çalıştırma

### Geliştirme Ortamı

**Gereksinimler:**
- Node.js 20+
- Docker Desktop (PostgreSQL için)
- Resend hesabı (e-posta için)

**1. Repoyu klonla:**
```bash
git clone https://github.com/kullanici/esnaf-core.git
cd esnaf-core
```

**2. PostgreSQL başlat:**
```bash
docker run --name esnaf-postgres \
  -e POSTGRES_USER=esnaf_user \
  -e POSTGRES_PASSWORD=esnaf_pass \
  -e POSTGRES_DB=esnaf_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**3. Server kurulumu:**
```bash
cd server
npm install
```

`server/.env` dosyası oluştur:
```env
PORT=3000
DATABASE_URL="postgresql://esnaf_user:esnaf_pass@localhost:5432/esnaf_db?schema=public"
APP_ORIGIN=http://localhost:5173
JWT_SECRET=gizli-jwt-secret
JWT_REFRESH_SECRET=gizli-refresh-secret
ACCESS_TOKEN_COOKIE=accessToken
REFRSH_TOKEN_COOKIE=refreshToken
NODE_ENV=development
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_SENDER=onboarding@resend.dev
GROQ_API_KEY=gsk_xxxxxxxxxxxx
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

Migration ve seed çalıştır:
```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**4. Client kurulumu:**
```bash
cd ../client
npm install
```

`client/.env` dosyası oluştur:
```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışır.

---

## Production Deploy (Docker Compose + Cloudflare Tunnel)

Bu yöntemde uygulama ev/ofis bilgisayarında Docker ile çalışır, Cloudflare Tunnel üzerinden dışarıya açılır. Sunucu kirası yoktur.

### Mimari

```
İnternet → Cloudflare → cloudflared → Nginx (client:80) → Backend (server:3000)
                                                         → Frontend (static)
```

### Gereksinimler

- Docker Desktop
- Cloudflare hesabı (ücretsiz) — https://cloudflare.com

### Adımlar

**1. Cloudflare Tunnel Token Al:**

- https://one.dash.cloudflare.com → Networks → Tunnels → Add a tunnel
- Connector: Cloudflared → Tunnel adı: `esnaf-core` → Save
- Verilen token'ı kopyala

**2. `.env.prod` dosyası oluştur:**
```env
CLOUDFLARE_TOKEN=eyJh...token buraya...
APP_ORIGIN=https://TUNNEL_URL.trycloudflare.com
JWT_SECRET=guclu-jwt-secret-degistir
JWT_REFRESH_SECRET=guclu-refresh-secret-degistir
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_SENDER=onboarding@resend.dev
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

> **Not:** `APP_ORIGIN` başlangıçta boş bırakılabilir, tunnel başladıktan sonra URL alınıp güncellenir.

**3. Build ve başlat:**
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod build
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

**4. Tunnel URL'ini öğren:**
```bash
docker logs esnaf-cloudflared
```

Çıktıda şuna benzer bir URL görünür:
```
Your quick Tunnel has been created! Visit it at:
https://xxxx-xxxx-xxxx.trycloudflare.com
```

**5. `.env.prod` güncelle ve server'ı yeniden başlat:**
```env
APP_ORIGIN=https://xxxx-xxxx-xxxx.trycloudflare.com
```
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --force-recreate server
```

**6. Veritabanı yedeği varsa restore et:**
```bash
# Backup dosyasını UTF-8'e çevir (Windows'ta gerekli)
$content = Get-Content backup.sql -Encoding Default -Raw
[System.IO.File]::WriteAllText("backup_utf8.sql", $content, [System.Text.UTF8Encoding]::new($false))

# Container'a kopyala ve restore et
docker cp backup_utf8.sql esnaf-postgres-prod:/backup.sql
docker exec -i esnaf-postgres-prod psql -U esnaf_user -d esnaf_db -f /backup.sql
```

### Container Yönetimi

```bash
# Tüm containerları durdur
docker compose -f docker-compose.prod.yml down

# Logları izle
docker logs -f esnaf-server-prod
docker logs -f esnaf-cloudflared

# Sadece bir servisi yeniden başlat
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --force-recreate server

# Veritabanı yedeği al
docker exec -t esnaf-postgres-prod pg_dump -U esnaf_user esnaf_db > yedek.sql
```

### Önemli Notlar

- `trycloudflare.com` URL'i bilgisayar yeniden başlatıldığında değişir — `.env.prod` dosyasındaki `APP_ORIGIN` güncellenmeli
- Kalıcı URL için Cloudflare'e domain eklenip named tunnel kullanılabilir
- Docker Desktop'ın Windows başlangıcında otomatik açılması için: Settings → General → "Start Docker Desktop when you sign in" ✅

---

## API Endpoints

<details>
<summary>Auth</summary>

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /auth/register | Kayıt |
| POST | /auth/login | Giriş |
| GET | /auth/logout | Çıkış |
| GET | /auth/refresh | Token yenile |
| GET | /auth/verify-email/:code | E-posta doğrula |
| POST | /auth/forgot-password | Şifre sıfırlama isteği |
| POST | /auth/reset-password | Şifre sıfırla |
</details>

<details>
<summary>Ürünler</summary>

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /products | Ürün listesi |
| GET | /products/:id | Ürün detayı |
| GET | /products/categories | Kategoriler |
| GET | /products/:id/price-history | Fiyat geçmişi |
| POST | /products | Ürün ekle (ADMIN) |
| PUT | /products/:id | Ürün güncelle (ADMIN) |
| DELETE | /products/:id | Ürün sil (ADMIN) |
</details>

<details>
<summary>Borçlar</summary>

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /debts | Borç listesi |
| GET | /debts/:id | Borç detayı |
| GET | /debts/names | Borç isimleri |
| POST | /debts | Borç ekle (ADMIN) |
| POST | /debts/:id/transaction | İşlem ekle (ADMIN) |
| PUT | /debts/:id | Borç güncelle (ADMIN) |
| DELETE | /debts/:id | Borç sil (ADMIN) |
</details>

<details>
<summary>Vergiler</summary>

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /taxes | Vergi takvimi |
| POST | /taxes/generate/:year | Yıl takvimi oluştur (ADMIN) |
| PUT | /taxes/:id | Vergi güncelle (ADMIN) |
</details>

<details>
<summary>Muhasebe</summary>

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /accounting/daily | Günlük girişler |
| POST | /accounting/daily | Günlük giriş ekle/güncelle |
| DELETE | /accounting/daily/:id | Günlük giriş sil |
| GET | /accounting/summary | Aylık özet |
| POST | /accounting/generate | Ay oluştur |
| GET/POST/PUT/DELETE | /accounting/expenses | Giderler |
| GET/POST/PUT/DELETE | /accounting/monthly/fixed | Aylık sabit giderler |
| GET/PUT | /accounting/monthly/income | Aylık ek gelirler |
| GET/POST/DELETE | /accounting/set-aside | Kenara ayrılan |
</details>

<details>
<summary>AI</summary>

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /ai/summary?year&month | Aylık muhasebe analizi |
| GET | /ai/stock | Stok durumu analizi |
| GET | /ai/debt | Borç önceliklendirme analizi |
</details>

---

| Değişken | Açıklama |
|----------|----------|
| `PORT` | Server portu (varsayılan: 3000) |
| `DATABASE_URL` | PostgreSQL bağlantı URL'i |
| `APP_ORIGIN` | Frontend URL (CORS için) |
| `JWT_SECRET` | Access token imzalama anahtarı |
| `JWT_REFRESH_SECRET` | Refresh token imzalama anahtarı |
| `ACCESS_TOKEN_COOKIE` | Access token cookie adı |
| `REFRSH_TOKEN_COOKIE` | Refresh token cookie adı |
| `NODE_ENV` | development / production |
| `RESEND_API_KEY` | Resend API anahtarı |
| `EMAIL_SENDER` | Gönderici e-posta adresi |
| `GROQ_API_KEY` | Groq API anahtarı (AI özellikleri için) |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL |
| `CLOUDFLARE_TOKEN` | Cloudflare Tunnel token (production) |

---

## Lisans

Copyright (c) 2026 Yaman. All rights reserved.

Bu kaynak kod yalnızca inceleme ve portfolyo amaçlı paylaşılmıştır. Yazılı izin olmaksızın kopyalanamaz, dağıtılamaz veya kullanılamaz.
