@echo off
title RADSAFE HMS Launcher
color 0B

echo ===================================================
echo     RADSAFE HMS - Enterprise Hospital Management
echo             System Startup Sequence
echo ===================================================
echo.

echo [1/3] Backend Hazirlaniyor (Python / FastAPI)...
cd radsafe-hms-backend

if not exist venv (
    echo [BILGI] Sanal ortam venv bulunamadi, olusturuluyor...
    python -m venv venv
)

echo [BILGI] Backend bagimliliklari kontrol ediliyor...
call venv\Scripts\activate
pip install -r requirements.txt

echo [BILGI] Port 8000 uzerindeki eski backend kapatiliyor...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo [BILGI] FastAPI Backend baslatiliyor...
start "RADSAFE Backend" cmd /k "call venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
cd ..
echo.

echo [2/3] Frontend Hazirlaniyor (React / Vite)...
cd radsafe-hms-frontend
echo [BILGI] Frontend bagimliliklari kontrol ediliyor (npm install)...
call npm install

echo [BILGI] React Arayuzu baslatiliyor...
start "RADSAFE Frontend" cmd /k "npm run dev"
cd ..
echo.

echo [3/3] Sistemlerin ayaga kalkmasi bekleniyor...
:: Sistemlerin baslamasi icin 5 saniye bekle
timeout /t 5 /nobreak >nul

echo [BILGI] Tarayici aciliyor...
start http://localhost:5173

echo.
echo ===================================================
echo     TUM SISTEMLER BASARIYLA AKTIF EDILDI!
echo ===================================================
echo.
echo - Backend API: http://localhost:8000/docs (Swagger UI)
echo - Frontend UI: http://localhost:5173
echo.
echo Bu pencereyi kapatabilirsiniz. Acilan diger siyah ekranlari (Backend ve Frontend) kapattiginizda sistem duracaktir.
pause
