import { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, ScanLine, X, Radiation } from 'lucide-react';
import { API_URL } from '../lib/api';
import { translateAction } from '../i18n/tr';

interface RoomScannerProps {
  userRfidTag: string;
  onClose: () => void;
}

type ScanState = 'scanning' | 'success' | 'denied';

const RoomScanner = ({ userRfidTag, onClose }: RoomScannerProps) => {
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [result, setResult] = useState<{
    message: string;
    personnel: string;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'room-reader',
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

        const areaId = parseInt(decodedText) || 1;

        try {
          const res = await axios.post(`${API_URL}/access/scan`, {
            rfid_tag: userRfidTag,
            area_id: areaId,
          });

          const isGranted = res.data.status === 'GRANTED';
          setResult({
            message: translateAction(res.data.message) || res.data.message,
            personnel: res.data.personnel_name,
            remaining: Math.floor(res.data.remaining_minutes || 0),
          });
          setScanState(isGranted ? 'success' : 'denied');
        } catch {
          setResult({ message: 'Sistem hatası', personnel: '', remaining: 0 });
          setScanState('denied');
        }

        setTimeout(onClose, 2500);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [userRfidTag, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-lg glass-card rounded-3xl overflow-hidden border-radsafe-primary/20">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-radsafe-primary to-teal-400 shadow-glow">
              <Radiation className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Oda Erişim Tarayıcı</h2>
              <p className="text-xs text-radsafe-textMuted">Kapı QR kodunu okutun</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost !p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {scanState === 'scanning' && (
            <div>
              <div className="rounded-2xl overflow-hidden border-2 border-radsafe-primary/30 mb-4">
                <div id="room-reader" className="w-full" />
              </div>
              <div className="flex items-center justify-center gap-2 text-radsafe-primaryLight text-sm font-semibold">
                <ScanLine className="h-4 w-4 animate-pulse" />
                QR kod aranıyor...
              </div>
            </div>
          )}

          {scanState === 'success' && result && (
            <div onClick={onClose} className="py-8 flex flex-col items-center cursor-pointer animate-fade-in">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-radsafe-success/40 bg-radsafe-success/15 mb-6">
                <ShieldCheck className="h-12 w-12 text-radsafe-success" />
              </div>
              <h3 className="text-2xl font-black text-radsafe-success uppercase mb-2">{result.message}</h3>
              <p className="text-xl font-bold text-white mb-4">{result.personnel}</p>
              <p className="text-sm text-slate-400">
                Kalan: <span className="text-white font-bold">{result.remaining} dk</span>
              </p>
            </div>
          )}

          {scanState === 'denied' && (
            <div onClick={onClose} className="py-8 flex flex-col items-center cursor-pointer animate-fade-in">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-radsafe-danger/40 bg-radsafe-danger/15 mb-6">
                <ShieldAlert className="h-12 w-12 text-radsafe-danger" />
              </div>
              <h3 className="text-2xl font-black text-radsafe-danger uppercase mb-2">Erişim Reddedildi</h3>
              <p className="text-slate-300">{result?.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomScanner;
