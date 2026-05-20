# RADSAFE HMS — Hastane Radyasyon Güvenliği Yönetim Sistemi

Hastane personelinin radyasyonlu alanlara giriş–çıkışını RFID/QR ile izleyen, günlük maruziyet süresini hesaplayan ve yasal limitlere göre erişimi kontrol eden web tabanlı bir yönetim sistemidir.

---

## Özellikler

- **Türkçe arayüz** — Giriş, paneller ve kiosk ekranları
- **Rol tabanlı erişim** — Yönetici, doktor, teknisyen
- **Maruziyet takibi** — Günlük kullanılan / kalan süre, ilerleme çubuğu
- **Oda giriş–çıkış** — RFID etiketi ile tarama (giriş ve çıkış aynı kart)
- **Yönetici paneli** — Canlı telemetri, maruziyet sıfırlama, RFID simülatörü
- **Çalışan yönetimi** — Admin panelinden yeni personel ekleme
- **Kapı kiosk** — QR kod ile self-servis tarama (`/kiosk`)
- **Docker desteği** — Tek komutla veritabanı + API + arayüz

---

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy (async), PostgreSQL |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Kimlik doğrulama | JWT (Bearer token) |
| Konteyner | Docker Compose |

---

## Proje yapısı

```
hastane otomaston/
├── docker-compose.yml      # PostgreSQL + backend + frontend
├── start_radsafe.bat       # Windows hızlı başlatma (geliştirme modu)
├── radsafe-hms-backend/    # FastAPI API
└── radsafe-hms-frontend/   # React arayüz
```

---

## Gereksinimler

### Docker ile çalıştırma (önerilen)

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) kurulu ve çalışır durumda

### Geliştirme modu (`start_radsafe.bat`)

- Python 3.11+
- Node.js 20+ (Vite 8 için zorunlu)
- npm

---

## Kurulum ve çalıştırma

### Yöntem 1 — Docker (üretim benzeri)

Proje klasöründe PowerShell veya CMD:

```powershell
cd "hastane otomaston"
docker compose up -d --build
```

| Servis | Adres |
|--------|--------|
| Arayüz | http://localhost |
| API | http://localhost:8000 |
| API dokümantasyonu | http://localhost:8000/docs |
| Sağlık kontrolü | http://localhost:8000/health |

Durdurmak:

```powershell
docker compose down
```

Veritabanını da silip sıfırdan başlamak:

```powershell
docker compose down -v
docker compose up -d --build
```

### Yöntem 2 — Windows hızlı başlatma

`start_radsafe.bat` dosyasına çift tıklayın. Script:

1. Backend sanal ortamını kurar ve `http://localhost:8000` üzerinde başlatır
2. Frontend bağımlılıklarını yükler ve `http://localhost:5173` üzerinde başlatır
3. Tarayıcıyı açar

> Geliştirme modunda veritabanı varsayılan olarak SQLite dosyası (`radsafe.db`) kullanır. Docker ortamında PostgreSQL kullanılır.

### Yöntem 3 — Manuel

**Backend:**

```powershell
cd radsafe-hms-backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**

```powershell
cd radsafe-hms-frontend
npm install
npm run dev
```

---

## Varsayılan kullanıcılar

İlk çalıştırmada demo kullanıcılar otomatik oluşturulur:

| Kullanıcı | Şifre | Rol | RFID |
|-----------|--------|-----|------|
| `admin` | `admin` | Yönetici | — |
| `mchen` | `pass` | Doktor | RFID-001 |
| `erostova` | `pass` | Teknisyen | RFID-002 |

> Üretim ortamında bu şifreleri mutlaka değiştirin.

---

## Kullanım kılavuzu

### Yönetici (`admin`)

1. **Genel Bakış** — Tesis özeti, canlı erişim kayıtları, maruziyet çubukları
2. **Çalışanlar** — Yeni personel ekleme (kullanıcı adı, şifre, RFID, rol, departman, günlük limit)
3. **RFID simülatörü** — Personel ve oda seçerek test taraması
4. **Kapı Kiosk** — Menüden `/kiosk` (yeni sekmede)

### Doktor / teknisyen

1. **Maruziyetim** — Bugün kullanılan, kalan ve günlük limit
2. Oda seçip **Tara** — İlk tarama giriş, ikinci tarama çıkış
3. Limit dolunca yeni giriş reddedilir

### Maruziyet simülasyonu

Geliştirme ve demo için süre hızlandırılmıştır:

- **1 gerçek saniye ≈ 2 simüle dakika** (çarpan: 120)
- İçerideyken süre her 2 saniyede bir API üzerinden güncellenir
- Çubuk altındaki sol etiket, üstteki “Bugün Kullanılan” ile aynı değeri gösterir

---

## API özeti

Tüm korumalı uçlar `Authorization: Bearer <token>` ister (tarama ve kiosk hariç).

| Metot | Uç | Açıklama |
|-------|-----|----------|
| POST | `/api/v1/auth/login` | Giriş |
| GET | `/api/v1/auth/me` | Oturum bilgisi |
| POST | `/api/v1/access/scan` | RFID giriş/çıkış |
| POST | `/api/v1/access/reset-exposure/{username}` | Bugünkü kayıtları sıfırla (yönetici) |
| GET | `/api/v1/dashboard/stats` | Özet istatistikler |
| GET | `/api/v1/dashboard/my-exposure` | Kişisel maruziyet |
| GET | `/api/v1/dashboard/live-logs` | Son erişim kayıtları |
| GET | `/api/v1/dashboard/areas` | Kısıtlı alan listesi |
| GET | `/api/v1/personnel` | Çalışan listesi (yönetici) |
| POST | `/api/v1/personnel` | Çalışan ekle (yönetici) |
| GET | `/api/v1/personnel/meta` | Rol ve departman listesi |

---

## Sorun giderme

### Giriş yapılamıyor

- Backend ayakta mı: http://localhost:8000/health → `{"status":"ok"}`
- Docker kullanıyorsanız: `docker compose ps` — `backend` ve `db` **Up** olmalı
- Yanlış şifre: demo hesaplarda `admin` / `admin`, `mchen` / `pass`

### Frontend açılmıyor (Docker)

```powershell
docker compose build frontend
docker compose up -d frontend
```

Frontend imajı **Node 22** ile derlenmelidir (Vite 8 uyumu).

### Maruziyet süresi tutarsız

Eski veritabanında hatalı kayıtlar kalmış olabilir:

```powershell
docker compose down -v
docker compose up -d --build
```

### Doktor “Tara” çalışmıyor

Hesaba **RFID etiketi** tanımlı olmalı. Yönetici panelinden **Çalışanlar** bölümünden ekleyin veya düzenleyin.

### Port çakışması

- `80` — Docker frontend
- `5173` — `npm run dev`
- `8000` — API
- `5432` — PostgreSQL (yerel Postgres varsa çakışabilir)

---

## Geliştirme notları

- Ortam değişkeni `DATABASE_URL` ile veritabanı bağlantısı ayarlanır (`docker-compose.yml` içinde tanımlı).
- İlk açılışta tablolar ve demo veriler `init_db` ile oluşturulur.
- Yönetici rolüne `manage_users`, `view_logs`, `manage_settings` izinleri atanır.
- Üretim için: güçlü `SECRET_KEY`, HTTPS, CORS kısıtlaması ve varsayılan şifrelerin değiştirilmesi önerilir.

---

## Lisans

Bu proje eğitim ve demo amaçlı geliştirilmiştir. Kurumsal kullanım öncesi güvenlik ve mevzuat uyumluluğu ayrıca değerlendirilmelidir.
