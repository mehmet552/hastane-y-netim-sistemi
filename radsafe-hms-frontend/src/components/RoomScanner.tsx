import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, ScanLine, X, Zap } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/v1';

interface RoomScannerProps {
  userRfidTag: string;
  onClose: () => void;
}

type ScanState = 'scanning' | 'success' | 'denied' | 'idle';

const RoomScanner = ({ userRfidTag, onClose }: RoomScannerProps) => {
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [result, setResult] = useState<any>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "room-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    );

    scannerRef.current = scanner;
    let isProcessing = false;

    scanner.render(async (decodedText) => {
      if (isProcessing) return;
      isProcessing = true;

      // The QR on the door contains the area_id (e.g. "1" for X-Ray Room)
      const areaId = parseInt(decodedText) || 1;

      try {
        const res = await axios.post(`${API_URL}/access/scan`, {
          rfid_tag: userRfidTag,
          area_id: areaId
        });

        const isGranted = res.data.status === 'GRANTED';
        setResult({
          message: res.data.message,
          personnel: res.data.personnel_name,
          remaining: Math.floor(res.data.remaining_minutes || 0)
        });
        setScanState(isGranted ? 'success' : 'denied');

      } catch {
        setResult({ message: 'SYSTEM ERROR', personnel: '', remaining: 0 });
        setScanState('denied');
      }

      // Auto-close after 2 seconds (tap to close immediately)
      setTimeout(() => {
        onClose();
      }, 2000);

    }, () => { /* ignore scan frame errors */ });

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [userRfidTag, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-lg bg-radsafe-panel rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-radsafe-primary to-radsafe-accent flex items-center justify-center shadow-neon">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Room Access Scanner</h2>
              <p className="text-xs text-slate-400 font-medium">Point camera at door QR code</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {scanState === 'scanning' && (
            <div>
              <div className="rounded-2xl overflow-hidden border-2 border-radsafe-primary/40 shadow-neon mb-4">
                <div id="room-reader" className="w-full" />
              </div>
              <div className="flex items-center justify-center gap-2 text-radsafe-primary text-sm font-bold">
                <ScanLine className="w-4 h-4 animate-pulse" />
                <span>Searching for QR code...</span>
              </div>
            </div>
          )}

          {scanState === 'success' && (
            <div onClick={onClose} className="py-8 flex flex-col items-center animate-in fade-in zoom-in duration-300 cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-radsafe-success/20 border border-radsafe-success/50 flex items-center justify-center mb-6">
                <ShieldCheck className="w-12 h-12 text-radsafe-success" />
              </div>
              <h3 className="text-3xl font-black text-radsafe-success uppercase mb-2">{result?.message}</h3>
              <p className="text-white text-xl font-bold mb-4">{result?.personnel}</p>
              <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl">
                <p className="text-slate-300 text-sm">Remaining today: <span className="text-white font-bold">{result?.remaining} min</span></p>
              </div>
              <p className="text-slate-500 text-xs mt-6">Tap to close</p>
            </div>
          )}

          {scanState === 'denied' && (
            <div onClick={onClose} className="py-8 flex flex-col items-center animate-in fade-in zoom-in duration-300 cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-radsafe-danger/20 border border-radsafe-danger/50 flex items-center justify-center mb-6">
                <ShieldAlert className="w-12 h-12 text-radsafe-danger" />
              </div>
              <h3 className="text-3xl font-black text-radsafe-danger uppercase mb-2">ACCESS DENIED</h3>
              <p className="text-slate-300 text-lg">{result?.message}</p>
              <p className="text-slate-500 text-xs mt-6">Tap to close</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomScanner;
