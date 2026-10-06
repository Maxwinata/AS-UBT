import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, CheckCircle2, AlertCircle, PenTool } from 'lucide-react';
import { ETicket } from '../../types/asrama';

interface GateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedTicket: ETicket;
  onCheckInSuccess: () => void;
}

export const GateScannerModal: React.FC<GateScannerModalProps> = ({
  isOpen,
  onClose,
  expectedTicket,
  onCheckInSuccess
}) => {
  const [scanResult, setScanResult] = useState<'IDLE' | 'SUCCESS' | 'ERROR' | 'RATIFIKASI_PENDING'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScanResult('IDLE');
      
      const scanner = new Html5QrcodeScanner(
        "qr-reader-container",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        },
        false
      );
      
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.id === expectedTicket.ticketId && data.nim === expectedTicket.nim) {
              setScanResult('RATIFIKASI_PENDING');
              scanner.clear();
            } else {
              setScanResult('ERROR');
              setErrorMessage('Tiket ini bukan milik Anda atau tidak valid.');
              setTimeout(() => setScanResult('IDLE'), 3000);
            }
          } catch (e) {
            setScanResult('ERROR');
            setErrorMessage('Format QR Code tidak dikenali.');
            setTimeout(() => setScanResult('IDLE'), 3000);
          }
        },
        (error) => {
          // ignore scan errors (empty frames, etc)
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
      }
    };
  }, [isOpen, expectedTicket, onCheckInSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Pemindai Gerbang Asrama</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4 text-center">
            Arahkan kamera ke QR Code e-Ticket Anda untuk melakukan Check-In mandiri di Gerbang Asrama.
          </p>

          <div className="relative">
            <div id="qr-reader-container" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100"></div>
            
            {scanResult === 'RATIFIKASI_PENDING' && (
              <div className="absolute inset-0 bg-indigo-600/95 rounded-xl flex flex-col items-center justify-center text-white z-10 animate-in zoom-in-95 duration-200 p-6 text-center">
                <PenTool className="w-12 h-12 mb-3 text-indigo-200 animate-pulse" />
                <p className="font-bold text-lg mb-1">QR Code Valid!</p>
                <p className="text-xs text-indigo-100 mb-6">Maba terdeteksi. Sesuai JUKLAK-03 Pasal 13, arahkan mahasiswa untuk tanda tangan basah di Lembar Ratifikasi (F-22) sebelum serah terima kunci kamar.</p>
                
                <button 
                  onClick={() => {
                    setScanResult('SUCCESS');
                    setTimeout(() => {
                      onCheckInSuccess();
                      onClose();
                    }, 2000);
                  }}
                  className="bg-white text-indigo-700 px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-indigo-50 transition-colors"
                >
                  Maba Sudah Tanda Tangan (Approve)
                </button>
              </div>
            )}
            
            {scanResult === 'SUCCESS' && (
              <div className="absolute inset-0 bg-emerald-500/90 rounded-xl flex flex-col items-center justify-center text-white z-10 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-16 h-16 mb-2" />
                <p className="font-bold text-lg">Check-In Berhasil!</p>
                <p className="text-sm opacity-90">Selamat datang di Asrama UBT.</p>
              </div>
            )}

            {scanResult === 'ERROR' && (
              <div className="absolute inset-0 bg-rose-500/90 rounded-xl flex flex-col items-center justify-center text-white z-10 animate-in zoom-in-95 duration-200">
                <AlertCircle className="w-16 h-16 mb-2" />
                <p className="font-bold text-lg">Check-In Gagal</p>
                <p className="text-sm opacity-90 px-4 text-center">{errorMessage}</p>
              </div>
            )}
          </div>
          
          {/* Fallback button to simulate scan for desktop without camera */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button 
              onClick={() => {
                if (scannerRef.current) scannerRef.current.clear();
                setScanResult('RATIFIKASI_PENDING');
              }}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              Mode Simulasi (Bypass Kamera)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
