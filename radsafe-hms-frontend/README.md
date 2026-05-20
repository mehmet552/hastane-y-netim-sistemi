# RADSAFE HMS — Frontend

RADSAFE hastane radyasyon güvenliği sisteminin **React + TypeScript + Vite** arayüzüdür. Tam proje dokümantasyonu için üst klasördeki [README.md](../README.md) dosyasına bakın.

---

## Ne yapar?

- Türkçe giriş ve paneller (yönetici / doktor / teknisyen)
- Kişisel maruziyet özeti ve ilerleme çubuğu
- Oda seçimi + RFID ile giriş/çıkış taraması
- Yönetici: canlı telemetri, çalışan ekleme, maruziyet sıfırlama
- Kapı kiosk: `/kiosk` (QR tarama)

---

## Gereksinimler

- **Node.js 20+** (Vite 8 için zorunlu; Node 18 desteklenmez)
- npm

---

## Hızlı başlatma

```powershell
cd radsafe-hms-frontend
npm install
npm run dev
```

Tarayıcı: **http://localhost:5173**

Backend ayrıca çalışmalıdır (`http://localhost:8000`). Tüm sistemi tek seferde açmak için üst klasördeki `start_radsafe.bat` veya `docker compose` kullanın.

---

## Ortam

API adresi `src/lib/api.ts` içinde tanımlıdır:

```ts
export const API_URL = 'http://localhost:8000/api/v1';
```

Docker ile frontend **nginx** üzerinden port **80**'de sunulur; geliştirmede Vite **5173** kullanılır.

---

## Önemli klasörler

| Yol | Açıklama |
|-----|----------|
| `src/App.tsx` | Ana layout, dashboard, routing |
| `src/components/LoginPortal.tsx` | Giriş ekranı |
| `src/components/PersonnelPage.tsx` | Çalışan yönetimi (admin) |
| `src/components/KioskScanner.tsx` | Kapı kiosk |
| `src/context/AuthContext.tsx` | Oturum ve JWT |
| `src/i18n/tr.ts` | Türkçe metinler |
| `nginx.conf` | Docker production yapılandırması |

---

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production derlemesi (`dist/`) |
| `npm run preview` | Derlenmiş sürümü önizleme |
| `npm run lint` | ESLint |

---

## Docker

Üst klasörden:

```powershell
docker compose up -d --build frontend
```

Frontend imajı **Node 22** ile derlenir ve **nginx** ile servis edilir.

---

## Demo giriş

| Kullanıcı | Şifre |
|-----------|--------|
| `admin` | `admin` |
| `mchen` | `pass` |
| `erostova` | `pass` |

Detaylar ve sorun giderme: [../README.md](../README.md)
