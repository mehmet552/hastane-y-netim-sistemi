import { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Zap } from 'lucide-react';
import { API_URL } from '../lib/api';
import { translateAction } from '../i18n/tr';

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
        qrbox: { width: 250, height: 250 },
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
        }, 4000);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch((error) => console.error('Tarayıcı kapatılamadı', error));
    };
  }, []);

  let bgColor = 'bg-[#020202]';
  if (scanResult) {
    bgColor = scanResult.success ? 'bg-radsafe-success/20' : 'bg-radsafe-danger/20';
  }

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden`}>
      <div className="absolute top-10 left-10 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-radsafe-primary to-radsafe-accent flex items-center justify-center shadow-neon">
          <Zap className="text-white w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black text-white tracking-widest uppercase">RADSAFE</h1>
          <p className="text-sm font-bold text-radsafe-textMuted tracking-widest uppercase">Kapı Kiosk Terminal 01</p>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-black/60 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative z-10 text-center">
        {!scanResult ? (
          <>
            <h2 className="text-4xl font-display font-bold text-white mb-4">QR Rozetinizi Okutun</h2>
            <p className="text-slate-400 font-medium text-lg mb-8">Cihazınızı kameraya tutun</p>
            <div className="mx-auto overflow-hidden rounded-3xl border-4 border-radsafe-primary/50 shadow-neon">
              <div id="reader" className="w-full"></div>
            </div>
          </>
        ) : (
          <div className="py-20 animate-in fade-in zoom-in duration-300">
            {scanResult.success ? (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-radsafe-success/20 flex items-center justify-center mb-8 border border-radsafe-success/50 shadow-neon-success">
                  <ShieldCheck className="w-16 h-16 text-radsafe-success" />
                </div>
                <h2 className="text-5xl font-display font-black text-radsafe-success mb-4 uppercase">{scanResult.message}</h2>
                <p className="text-3xl text-white font-bold mb-4">{scanResult.personnel}</p>
                <div className="inline-block bg-white/10 px-6 py-3 rounded-xl border border-white/20">
                  <p className="text-xl text-slate-300">
                    Kalan limit: <span className="text-white font-bold">{scanResult.remaining} dk</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-radsafe-danger/20 flex items-center justify-center mb-8 border border-radsafe-danger/50 shadow-neon-danger">
                  <ShieldAlert className="w-16 h-16 text-radsafe-danger" />
                </div>
                <h2 className="text-5xl font-display font-black text-radsafe-danger mb-4 uppercase">ERİŞİM REDDEDİLDİ</h2>
                <p className="text-3xl text-white font-bold mb-4">{scanResult.personnel}</p>
                <p className="text-xl text-radsafe-danger/80">{scanResult.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-10 text-slate-600 font-mono text-sm">Tüm işlemler kayıt altındadır.</div>
    </div>
  );
};

export default KioskScanner;
