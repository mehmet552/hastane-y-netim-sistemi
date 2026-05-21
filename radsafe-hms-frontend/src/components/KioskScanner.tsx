import { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Radiation, Scan } from 'lucide-react';
import { API_URL } from '../lib/api';
import { translateAction } from '../i18n/tr';
import { cn } from '../lib/cn';

const KioskScanner = () => {
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    personnel: string;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    );

    let isProcessing = false;

    scanner.render(
      async (decodedText) => {
        if (isProcessing) return;
        isProcessing = true;

        try {
          const res = await axios.post(`${API_URL}/access/scan`, {
            rfid_tag: decodedText,
            area_id: 1,
          });

          setScanResult({
            success: res.data.status === 'GRANTED',
            message: translateAction(res.data.message) || res.data.message,
            personnel: res.data.personnel_name,
            remaining: Math.floor(res.data.remaining_minutes ?? 0),
          });
        } catch {
          setScanResult({
            success: false,
            message: 'Sistem hatası veya geçersiz QR',
            personnel: 'Bilinmiyor',
            remaining: 0,
          });
        }

        setTimeout(() => {
          setScanResult(null);
          isProcessing = false;
        }, 4500);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden',
        scanResult?.success === true && 'bg-radsafe-success/15',
        scanResult?.success === false && 'bg-radsafe-danger/15',
        !scanResult && 'bg-radsafe-bg'
      )}
    >
      <div className="app-grid" aria-hidden />
      <div className="absolute inset-0 bg-mesh pointer-events-none" />

      <header className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-radsafe-primary to-teal-400 shadow-glow">
            <Radiation className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-wide">RADSAFE</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-radsafe-primaryLight">
              Kapı Kiosk · Terminal 01
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
          <Scan className="h-4 w-4 text-radsafe-accent animate-pulse" />
          <span className="text-xs font-medium text-slate-400">Kamera aktif</span>
        </div>
      </header>

      <div className="w-full max-w-2xl glass-card rounded-[2rem] p-8 sm:p-12 text-center relative z-10 border-radsafe-primary/20 shadow-glow">
        {!scanResult ? (
          <>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              QR Rozetinizi Okutun
            </h2>
            <p className="text-radsafe-textMuted mb-8">Personel rozetini kameraya tutun</p>
            <div className="mx-auto max-w-md overflow-hidden rounded-2xl border-2 border-radsafe-primary/40 shadow-glow p-1 bg-black/40">
              <div id="reader" className="w-full" />
            </div>
          </>
        ) : scanResult.success ? (
          <div className="py-12 animate-fade-in">
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-radsafe-success/40 bg-radsafe-success/15 shadow-glow">
              <ShieldCheck className="h-14 w-14 text-radsafe-success" />
            </div>
            <h2 className="font-display text-4xl font-black text-radsafe-success uppercase mb-2">
              {scanResult.message}
            </h2>
            <p className="text-2xl font-bold text-white mb-6">{scanResult.personnel}</p>
            <div className="inline-block rounded-xl border border-white/10 bg-white/5 px-6 py-3">
              <p className="text-lg text-slate-300">
                Kalan limit:{' '}
                <span className="font-bold text-white">{scanResult.remaining} dk</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="py-12 animate-fade-in">
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-radsafe-danger/40 bg-radsafe-danger/15 shadow-glow-danger">
              <ShieldAlert className="h-14 w-14 text-radsafe-danger" />
            </div>
            <h2 className="font-display text-4xl font-black text-radsafe-danger uppercase mb-2">
              Erişim Reddedildi
            </h2>
            <p className="text-2xl font-bold text-white mb-4">{scanResult.personnel}</p>
            <p className="text-lg text-radsafe-danger/90">{scanResult.message}</p>
          </div>
        )}
      </div>

      <p className="absolute bottom-8 font-mono text-xs text-radsafe-textDim z-10">
        Tüm işlemler kayıt altındadır · RADSAFE HMS
      </p>
    </div>
  );
};

export default KioskScanner;
