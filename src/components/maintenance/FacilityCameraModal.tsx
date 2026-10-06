import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, SwitchCamera, X, Check, RefreshCw, Upload, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';

interface FacilityCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
}

export const FacilityCameraModal: React.FC<FacilityCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setIsLoading(true);
    setCameraError(null);

    // Stop current stream before starting new one
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Peramban tidak mendukung akses kamera langsung (getUserMedia API).');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let errorMsg = 'Gagal mengakses kamera perangkat.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Izin kamera ditolak atau dibatasi peramban/iframe. Silakan gunakan opsi unggah foto file di bawah.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'Kamera tidak terdeteksi pada perangkat Anda.';
      }
      setCameraError(errorMsg);
      setActiveTab('upload');
    } finally {
      setIsLoading(false);
    }
  }, [stream]);

  // Mount/Unmount effect
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedImage) {
      startCamera(facingMode);
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, activeTab, capturedImage]);

  // Capture frame from video stream to canvas
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add watermark timestamp
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, canvas.height - 36, canvas.width, 36);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      const timestamp = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Makassar',
        dateStyle: 'medium',
        timeStyle: 'medium'
      }) + ' WITA (Roemah 54 UBT)';
      ctx.fillText(timestamp, 16, canvas.height - 14);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);
      stopCameraStream();
    } catch (err) {
      console.error('Failed to capture frame:', err);
    }
  };

  // Switch between front and back cameras
  const handleToggleFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Handle file picker fallback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm and return photo
  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    if (activeTab === 'camera') {
      startCamera(facingMode);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="facility-camera-modal-root" 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 text-white rounded-2xl md:rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-4 py-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Dokumentasi Kerusakan Fasilitas
              </h4>
              <p className="text-[11px] text-slate-400">
                Ambil foto jelas pada bagian yang mengalami kerusakan
              </p>
            </div>
          </div>

          <button
            id="button-close-camera-modal"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector (Camera vs File Upload) */}
        {!capturedImage && (
          <div className="flex border-b border-slate-800 bg-slate-900/90 text-xs">
            <button
              id="tab-mode-camera"
              onClick={() => {
                setActiveTab('camera');
                setCameraError(null);
                startCamera(facingMode);
              }}
              className={`flex-1 py-2.5 text-center font-bold transition-colors flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'camera'
                  ? 'border-teal-400 text-teal-300 bg-teal-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Kamera Perangkat</span>
            </button>
            <button
              id="tab-mode-upload"
              onClick={() => {
                setActiveTab('upload');
                stopCameraStream();
              }}
              className={`flex-1 py-2.5 text-center font-bold transition-colors flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'upload'
                  ? 'border-teal-400 text-teal-300 bg-teal-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah File / Galeri</span>
            </button>
          </div>
        )}

        {/* Main Viewfinder / Canvas Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[340px] max-h-[460px]">
          {capturedImage ? (
            /* FROZEN PREVIEW */
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950">
              <img 
                src={capturedImage} 
                alt="Captured Facility Damage" 
                className="max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-lg border border-slate-800"
              />
              <div className="absolute top-3 left-3 bg-teal-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                <Sparkles className="w-3 h-3" />
                <span>Foto Terkunci</span>
              </div>
            </div>
          ) : activeTab === 'camera' ? (
            /* LIVE CAMERA STREAM */
            cameraError ? (
              <div className="p-6 text-center space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-xs text-red-200 leading-relaxed">
                  {cameraError}
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  Gunakan Pengunggah File
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Framing Reticle / Target Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-64 border-2 border-teal-400/70 border-dashed rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]">
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-teal-400 rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-teal-400 rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-teal-400 rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-teal-400 rounded-br-lg"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-teal-300/90 text-center px-4 bg-teal-950/20">
                      Posisikan Objek Kerusakan di Kotak Ini
                    </div>
                  </div>
                </div>

                {/* Camera Flip Control */}
                <button
                  id="button-flip-camera"
                  onClick={handleToggleFacing}
                  className="absolute top-3 right-3 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full border border-slate-700 backdrop-blur-sm transition-all"
                  title="Ganti Kamera Depan/Belakang"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            )
          ) : (
            /* FILE UPLOAD FALLBACK */
            <div className="p-8 text-center space-y-4 w-full max-w-sm">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-8 cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h5 className="text-xs font-bold text-white mb-1">Pilih Foto dari Perangkat</h5>
                <p className="text-[11px] text-slate-400">JPG, PNG, atau WEBP (Maks 5 MB)</p>
                <span className="mt-3 text-[10px] font-bold text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-full border border-teal-800">
                  Telusuri Berkas
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Footer Action Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                id="button-retake-photo"
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Foto Ulang</span>
              </button>

              <button
                id="button-confirm-photo"
                onClick={handleConfirmPhoto}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Lampirkan Foto ke Laporan</span>
              </button>
            </>
          ) : activeTab === 'camera' && !cameraError ? (
            <>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Pencahayaan cukup akan mempercepat verifikasi teknisi
              </div>

              <button
                id="button-shutter-snap"
                onClick={handleSnapPhoto}
                disabled={isLoading}
                className="w-full sm:w-auto ml-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Ambil Foto Sekarang</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih Berkas Foto</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
