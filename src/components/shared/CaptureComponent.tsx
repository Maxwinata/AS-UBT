import React, { useState, useRef, useEffect } from 'react';
import { Camera, SwitchCamera, X, AlertCircle, Scan, CheckCircle2, Info, CreditCard, UserSquare, Smartphone } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

interface CaptureComponentProps {
  target: 'ktp' | 'selfie';
  onCapture: (capturedData: { objectUrl: string; base64: string; blob: Blob }) => Promise<void>;
  onCancel: () => void;
}

export function CaptureComponent({ target, onCapture, onCancel }: CaptureComponentProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>(target === 'ktp' ? 'environment' : 'user');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [captureData, setCaptureData] = useState<{ objectUrl: string; base64: string; blob: Blob } | null>(null);
    const [isLandscape, setIsLandscape] = useState(false);
  
  useEffect(() => {
    const checkOrientation = () => {
      // Check if the device is likely mobile/tablet and held in landscape
      const isMobileSize = window.innerWidth <= 1024;
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(isMobileSize && landscape);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadFailed, setUploadFailed] = useState<boolean>(false);
  
  // Real-time Visual Feedback State
  const [isDetected, setIsDetected] = useState<boolean>(false);
  const [distanceFeedback, setDistanceFeedback] = useState<'too-far' | 'too-close' | 'perfect' | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(3/4);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Enhanced Haptic Feedback Logic
  useEffect(() => {
    if ('vibrate' in navigator) {
      try {
        if (target === 'selfie' && isDetected && distanceFeedback === 'perfect') {
          // Double pulse for perfect face distance
          navigator.vibrate([30, 50, 30]); 
        } else if (target === 'ktp' && isDetected) {
          // Single crisp pulse when KTP is stable
          navigator.vibrate(50);
        } else if (target === 'selfie' && isDetected && (distanceFeedback === 'too-close' || distanceFeedback === 'too-far')) {
          // Very subtle warning tick
          navigator.vibrate(10);
        }
      } catch (e) {
        // Ignore if not supported or permission denied
      }
    }
  }, [isDetected, distanceFeedback, target]);

  useEffect(() => {
    let active = true;
    let model: blazeface.BlazeFaceModel | null = null;
    let intervalId: any;
    let lastImageData: ImageData | null = null;

    const runDetection = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      if (!active || capturedPreview) return;

      if (target === 'selfie') {
        try {
          if (!model) {
            await tf.ready();
            model = await blazeface.load();
          }
          if (!active) return;
          const predictions = await model.estimateFaces(videoRef.current, false);
          
          if (predictions.length > 0) {
            setIsDetected(true);
            const face = predictions[0];
            const topLeft = face.topLeft;
            const bottomRight = face.bottomRight;
            
            const faceWidth = (bottomRight as [number, number])[0] - (topLeft as [number, number])[0];
            const videoWidth = videoRef.current.videoWidth || 640;
            
            const ratio = faceWidth / videoWidth;
            
            if (ratio < 0.28) {
              setDistanceFeedback('too-far');
            } else if (ratio > 0.48) {
              setDistanceFeedback('too-close');
            } else {
              setDistanceFeedback('perfect');
            }
          } else {
            setIsDetected(false);
            setDistanceFeedback(null);
          }
        } catch (e) {
          console.error("BlazeFace detection error:", e);
        }
      } else if (target === 'ktp') {
        // Stability check for KTP scanning simulation
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 64; 
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 64, 64);
            const currentData = ctx.getImageData(0, 0, 64, 64);
            if (lastImageData) {
              let diff = 0;
              for (let i = 0; i < currentData.data.length; i += 4) {
                // simple grayscale diff
                const r1 = currentData.data[i];
                const g1 = currentData.data[i + 1];
                const b1 = currentData.data[i + 2];
                const r2 = lastImageData.data[i];
                const g2 = lastImageData.data[i + 1];
                const b2 = lastImageData.data[i + 2];
                diff += Math.abs((r1 + g1 + b1) / 3 - (r2 + g2 + b2) / 3);
              }
              const avgDiff = diff / (64 * 64);
              // if avg diff per pixel is low, it means the user is holding the KTP still
              setIsDetected(avgDiff < 8);
            }
            lastImageData = currentData;
          }
        } catch (e) {
          console.error("Stability check error:", e);
        }
      }
    };

    if (stream && !capturedPreview) {
      setIsScanning(true);
      intervalId = setInterval(runDetection, target === 'selfie' ? 400 : 800);
    } else {
      setIsScanning(false);
      setIsDetected(false);
    }

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [stream, capturedPreview, target]);

  useEffect(() => {
    if (!showGuide) {
      initCamera(facing, activeDeviceId);
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facing, activeDeviceId, showGuide]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
  };


  const initCamera = async (requestedFacing: 'user' | 'environment', deviceId?: string | null) => {
    stopCamera();
    // Brief delay to ensure hardware is released (Fix for camera switch lock on mobile)
    await new Promise(resolve => setTimeout(resolve, 150));
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('API Kamera tidak didukung oleh browser ini.');
      }
      
      let newStream: MediaStream | null = null;
      let lastError: any = null;

      // 1. Try explicit deviceId if provided (Explicit explicitly overrides)
      if (deviceId) {
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (e: any) {
          console.warn("Explicit deviceId failed:", e);
        }
      }

      // 1a. Try EXACT facing mode to force front/back camera
      if (!newStream) {
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: requestedFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (e: any) {
          console.warn("Exact facing constraints failed:", e);
        }
      }

      // 1b. Try ideal constraints if exact failed (e.g. desktop webcams)
      if (!newStream) {
        try {
          newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: requestedFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (e: any) {
          lastError = e;
          console.warn("Ideal constraints failed:", e);
        }
      }

      // 2. If failed (e.g., could not start video source on mobile), try cycling through devices
      if (!newStream && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          
          videoDevices.sort((a, b) => {
            const aLabel = a.label.toLowerCase();
            const bLabel = b.label.toLowerCase();
            if (requestedFacing === 'user') {
              if (aLabel.includes('front') && !bLabel.includes('front')) return -1;
              if (!aLabel.includes('front') && bLabel.includes('front')) return 1;
            } else {
              if ((aLabel.includes('back') || aLabel.includes('rear')) && !(bLabel.includes('back') || bLabel.includes('rear'))) return -1;
              if (!(aLabel.includes('back') || aLabel.includes('rear')) && (bLabel.includes('back') || bLabel.includes('rear'))) return 1;
            }
            return 0;
          });

          for (const device of videoDevices) {
            try {
              newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: device.deviceId } },
                audio: false,
              });
              if (newStream) break;
            } catch (e: any) { 
               lastError = e;
            }
          }
        } catch (e: any) {
          console.warn("Failed to enumerate devices:", e);
        }
      }

      // 3. Ultimate Fallback: Any video without strict constraints
      if (!newStream) {
        try {
          newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (e: any) {
          lastError = e;
        }
      }

      if (!newStream) {
         throw lastError || new Error("Tidak dapat memulai kamera.");
      }

      streamRef.current = newStream;
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Populate available cameras after permissions are granted
      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
        
        // Find current device ID from stream
        const track = newStream.getVideoTracks()[0];
        if (track) {
          const settings = track.getSettings();
          if (settings.deviceId && !activeDeviceId) {
            setActiveDeviceId(settings.deviceId);
          }
        }
      }
    } catch (err: any) {
      // Suppress console error if it's just missing device in preview environment
      if (err.name !== 'NotFoundError' && !err.message?.includes('Requested device not found')) {
         console.error("Camera init error:", err);
      }
      
      let errMsg = 'Akses kamera gagal.';
      if (err.name === 'NotFoundError' || err.message?.includes('Requested device not found')) {
        errMsg = 'Kamera tidak ditemukan pada perangkat ini.';
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    }
  };

  const handleSwitchCamera = () => {
    if (availableDevices.length > 1) {
      let nextDevice: MediaDeviceInfo | undefined;
      const isCurrentlyUser = facing === 'user';
      
      // Attempt heuristic selection
      nextDevice = availableDevices.find(d => {
        const label = d.label.toLowerCase();
        if (isCurrentlyUser) {
          return label.includes('back') || label.includes('rear') || label.includes('environment');
        } else {
          return label.includes('front') || label.includes('user') || label.includes('face');
        }
      });

      // If heuristic fails, cycle sequentially
      if (!nextDevice) {
        const currentIndex = availableDevices.findIndex(d => d.deviceId === activeDeviceId);
        const nextIndex = (currentIndex + 1) % availableDevices.length;
        nextDevice = availableDevices[nextIndex];
      }

      if (nextDevice) {
        setActiveDeviceId(nextDevice.deviceId);
        const nextLabel = nextDevice.label.toLowerCase();
        if (nextLabel.includes('front') || nextLabel.includes('user') || nextLabel.includes('face')) {
          setFacing('user');
        } else if (nextLabel.includes('back') || nextLabel.includes('rear') || nextLabel.includes('environment')) {
          setFacing('environment');
        } else {
          setFacing(prev => prev === 'user' ? 'environment' : 'user');
        }
        return;
      }
    }
    
    // Fallback if no robust enumeration
    setFacing(prev => prev === 'user' ? 'environment' : 'user');
    setActiveDeviceId(null); 
  };

  const handleTakeSnap = () => {
    // Shutter button haptic feedback
    if ('vibrate' in navigator) {
      try { navigator.vibrate([15, 30, 15]); } catch(e) {}
    }
    
    if (videoRef.current && videoRef.current.parentElement) {
      const video = videoRef.current;
      const parent = video.parentElement;
      if (!parent) return;
      
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      
      const videoRect = video.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();

      let sX = 0, sY = 0, sW = vw, sH = vh;

      if (target === 'ktp') {
        const boxW = Math.min(parentRect.width * 0.85, 340);
        const boxH = boxW / 1.58;
        const padding = boxW * 0.05; // 5% padding
        const cropW = boxW + padding * 2;
        const cropH = boxH + padding * 2;
        const cropX = (parentRect.width - cropW) / 2;
        const cropY = (parentRect.height - cropH) / 2;
        
        // Map from parent space to video element space
        const cropX_in_video = cropX - (videoRect.left - parentRect.left);
        const cropY_in_video = cropY - (videoRect.top - parentRect.top);
  
        // Map from video element space to video intrinsic space (accounting for object-cover)
        const scale = Math.max(videoRect.width / vw, videoRect.height / vh);
        const scaledW = vw * scale;
        const scaledH = vh * scale;
        const offsetX = (videoRect.width - scaledW) / 2;
        const offsetY = (videoRect.height - scaledH) / 2;
  
        sX = (cropX_in_video - offsetX) / scale;
        sY = (cropY_in_video - offsetY) / scale;
        sW = cropW / scale;
        sH = cropH / scale;
      } else if (target === 'selfie') {
        // Guarantee exactly 9:16 portrait from the center of intrinsic video dimensions,
        // avoiding letterboxing and stretching regardless of physical camera resolution.
        const targetAspect = 9 / 16;
        const currentAspect = vw / vh;
        
        if (currentAspect > targetAspect) {
          // Intrinsic video is wider than 9:16 (e.g. 4:3 or 16:9 landscape) -> crop sides
          sH = vh;
          sW = vh * targetAspect;
          sX = (vw - sW) / 2;
          sY = 0;
        } else {
          // Intrinsic video is taller than 9:16 -> crop top/bottom
          sW = vw;
          sH = vw / targetAspect;
          sX = 0;
          sY = (vh - sH) / 2;
        }
      }

      // Clamp coordinates
      sX = Math.max(0, Math.min(sX, vw));
      sY = Math.max(0, Math.min(sY, vh));
      sW = Math.max(0, Math.min(sW, vw - sX));
      sH = Math.max(0, Math.min(sH, vh - sY));

      const canvas = document.createElement('canvas');
      canvas.width = sW;
      canvas.height = sH;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, sX, sY, sW, sH, 0, 0, sW, sH);
        
        // Export to Blob for object URL and base64 for API
        canvas.toBlob((blob) => {
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            const base64 = canvas.toDataURL('image/jpeg', 0.90);
            setCapturedPreview(objectUrl);
            setCaptureData({ objectUrl, base64, blob });
          }
        }, 'image/jpeg', 0.90);
      }
    }
  };

  const handleRetake = () => {
    if (captureData?.objectUrl) {
      URL.revokeObjectURL(captureData.objectUrl);
    }
    setCapturedPreview(null);
    setCaptureData(null);
  };

  const handleConfirm = async () => {
    if (captureData) {
      setIsUploading(true);
      setUploadFailed(false);
      try {
        await onCapture(captureData);
      } catch (err) {
        setUploadFailed(true);
      } finally {
        setIsUploading(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col justify-center items-center p-4"
    >
      <div className="bg-slate-950 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[95vh]">

        {showGuide ? (
          <div className="flex flex-col h-full bg-slate-950 text-slate-300">
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
              <div className="max-w-xl mx-auto space-y-8 mt-4 sm:mt-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center border border-slate-800 shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-xl"></div>
                    {target === 'ktp' ? <CreditCard className="w-8 h-8 text-emerald-400 relative z-10" /> : <UserSquare className="w-8 h-8 text-emerald-400 relative z-10" />}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Panduan {target === 'ktp' ? 'Foto e-KTP' : 'Foto Selfie'}
                  </h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Ikuti panduan berikut agar hasil verifikasi wajah dan dokumen Anda lebih cepat diproses oleh sistem dan Admin.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  {target === 'ktp' ? (
                    <>
                      <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-2xl flex gap-4 items-start hover:border-slate-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 text-emerald-400 shadow-inner">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm mb-1">Posisikan Pas di Bingkai</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Pastikan seluruh bagian e-KTP (sudut-sudutnya) masuk ke dalam bingkai yang disediakan di layar.</p>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-2xl flex gap-4 items-start hover:border-slate-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 text-emerald-400 shadow-inner">
                          <Info className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm mb-1">Cahaya Terang & Jelas</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Hindari pantulan silau (flash) atau bayangan gelap yang menutupi teks NIK dan pasfoto KTP Anda.</p>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-2xl flex gap-4 items-start hover:border-slate-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 text-emerald-400 shadow-inner">
                          <Scan className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm mb-1">Tahan Sebentar</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Sistem akan membaca stabilitas perangkat. Ponsel akan bergetar saat posisi dinilai stabil.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-2xl flex gap-4 items-start hover:border-slate-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 text-emerald-400 shadow-inner">
                          <UserSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm mb-1">Wajah Terlihat Jelas</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Posisikan wajah Anda di tengah bingkai layar. Lepaskan masker, kacamata, atau aksesoris wajah.</p>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-2xl flex gap-4 items-start hover:border-slate-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 text-emerald-400 shadow-inner">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm mb-1">Dekatkan e-KTP Anda</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Pegang e-KTP di bawah dagu atau di samping wajah. Pastikan KTP tidak menutupi wajah Anda.</p>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-5 rounded-2xl flex gap-4 items-start hover:border-slate-700 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 text-emerald-400 shadow-inner">
                          <Scan className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm mb-1">Tunggu Indikator Hijau</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Jika bingkai berubah hijau dan ponsel bergetar ganda, jarak sudah sempurna. Segera ambil foto.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950 flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.4)] flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Mengerti, Buka Kamera</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center border border-slate-700">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {target === 'ktp' ? 'Akses Kamera - Scan KTP' : 'Akses Kamera - Selfie + KTP'}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {capturedPreview ? 'Pratinjau Hasil Crop' : 'Sesuaikan posisi dalam bingkai'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="m-4 bg-rose-950/80 border border-rose-700 p-3.5 rounded-2xl text-xs text-rose-200 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-rose-100">
              <AlertCircle className="w-4 h-4" /> Error Kamera
            </div>
            <p>{error}</p>
            <div className="pt-2">
              <label className="bg-rose-900 hover:bg-rose-800 text-white font-bold py-2 px-4 rounded-xl cursor-pointer text-xs inline-block transition-colors">
                Unggah Foto Secara Manual
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const objectUrl = URL.createObjectURL(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        onCapture({
                          objectUrl,
                          base64: reader.result as string,
                          blob: file
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </label>
            </div>
          </div>
        )}


        {/* Viewport */}
        {isLandscape && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-3 text-xs sm:text-sm font-bold border border-slate-700 animate-in fade-in slide-in-from-top-4 pointer-events-none">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 rotate-90 animate-pulse" />
            <span>Putar perangkat ke mode portrait (berdiri) untuk hasil terbaik.</span>
          </div>
        )}

        <div className="flex-1 min-h-[300px] sm:min-h-[400px] flex items-center justify-center bg-black p-4 overflow-hidden relative">
          <div className={`relative bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center mx-auto ${target === 'selfie' ? 'w-full max-w-sm aspect-[9/16] max-h-[75vh]' : 'w-full max-w-2xl min-h-[260px]'}`}>
            
            {/* OVERLAYS FOR UPLOADING / RETRY */}
            {isUploading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white font-bold text-sm">Memproses Foto...</p>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-2 max-w-[200px] text-center">Tunggu sebentar, sistem sedang mengunggah dan menganalisis foto Anda.</p>
              </div>
            )}
            
            {uploadFailed && !isUploading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md px-4">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
                <h3 className="text-white font-bold text-lg mb-2">Pengiriman Gagal</h3>
                <p className="text-slate-400 text-xs sm:text-sm text-center max-w-[250px] mb-6">
                  Terjadi masalah koneksi atau batas waktu (timeout) saat mengirim foto ke server.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setUploadFailed(false)} 
                    className="px-4 py-2.5 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 font-bold text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleConfirm} 
                    className="px-5 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 font-bold text-xs transition-colors shadow-lg flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                    Coba Lagi (Retry)
                  </button>
                </div>
              </div>
            )}

            {capturedPreview ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img src={capturedPreview} alt="Captured preview" className={`w-full h-full object-cover object-center ${target === 'selfie' ? '' : 'max-h-72'}`} />
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                  Hasil Crop Otomatis
                </span>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && stream && !el.srcObject) {
                      el.srcObject = stream;
                    }
                  }}
                  autoPlay
                  playsInline
                  onLoadedMetadata={(e) => {
                    const target = e.target as HTMLVideoElement;
                    if (target.videoWidth && target.videoHeight) {
                      setVideoAspectRatio(target.videoWidth / target.videoHeight);
                    }
                  }}
                  muted
                  className={`w-full h-full object-cover object-center ${target === 'selfie' ? '' : 'max-h-72'}`}
                />
                
                {/* SVG Overlays */}
                <div className="absolute inset-0 pointer-events-none">
                  {target === 'ktp' ? (
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <div className={`relative w-[85%] max-w-[340px] aspect-[1.58] border-2 rounded-xl transition-all duration-500 ease-in-out flex flex-col items-center justify-center ${
                        isDetected 
                          ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4),0_0_0_9999px_rgba(0,0,0,0.7)]' 
                          : 'border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]'
                      }`}>
                        <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl transition-colors duration-500 ${isDetected ? 'border-emerald-400' : 'border-white'}`} />
                        <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl transition-colors duration-500 ${isDetected ? 'border-emerald-400' : 'border-white'}`} />
                        <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl transition-colors duration-500 ${isDetected ? 'border-emerald-400' : 'border-white'}`} />
                        <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-xl transition-colors duration-500 ${isDetected ? 'border-emerald-400' : 'border-white'}`} />
                        
                        {/* Dynamic Feedback Badge */}
                        <div 
                          className={`flex items-center space-x-1.5 font-bold tracking-wider text-[10px] px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
                            isDetected 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 scale-105' 
                              : 'bg-black/60 text-white/80 border-white/20'
                          }`}
                        >
                          {isDetected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>POSISI KTP STABIL</span>
                            </>
                          ) : (
                            <>
                              <Scan className="w-3.5 h-3.5 opacity-70 animate-pulse" />
                              <span>POSISIKAN KTP DI SINI</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 overflow-hidden">
                      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                        <defs>
                          <mask id="selfieMask">
                            <rect width="100%" height="100%" fill="white" />
                            <ellipse cx="50%" cy="38%" rx="95" ry="125" fill="black" />
                            <rect x="50%" y="78%" width="180" height="114" rx="8" transform="translate(-90, -40)" fill="black" />
                          </mask>
                        </defs>
                        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#selfieMask)" />
                        
                        <ellipse 
                          cx="50%" cy="38%" rx="95" ry="125" fill="none" 
                          stroke={isDetected && distanceFeedback === 'perfect' ? "#34d399" : isDetected && distanceFeedback === 'too-close' ? "#fbbf24" : isDetected && distanceFeedback === 'too-far' ? "#38bdf8" : "#f43f5e"} 
                          strokeWidth="3" strokeDasharray={isDetected ? "" : "6 6"} 
                          style={{ transition: 'all 0.5s ease-in-out', filter: isDetected && distanceFeedback === 'perfect' ? 'drop-shadow(0 0 8px rgba(52,211,153,0.8))' : isDetected && distanceFeedback === 'too-close' ? 'drop-shadow(0 0 8px rgba(251,191,36,0.8))' : isDetected && distanceFeedback === 'too-far' ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none' }}
                        />
                        <rect 
                          x="50%" y="78%" width="180" height="114" rx="8" transform="translate(-90, -40)" fill="none" 
                          stroke={isDetected && distanceFeedback === 'perfect' ? "#34d399" : isDetected && distanceFeedback === 'too-close' ? "#fbbf24" : isDetected && distanceFeedback === 'too-far' ? "#38bdf8" : "#94a3b8"} 
                          strokeWidth="2" strokeDasharray="6 6" 
                          style={{ transition: 'all 0.5s ease-in-out' }}
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center pointer-events-none z-10">
                        {/* Face Badge */}
                        <div className="absolute top-[12%]">
                          <div 
                            className={`flex items-center space-x-1.5 font-bold tracking-wider text-[10px] px-3 py-1.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
                              isDetected && distanceFeedback === 'perfect'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 scale-105' 
                                : isDetected && distanceFeedback === 'too-close'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                                : isDetected && distanceFeedback === 'too-far'
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 animate-pulse'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                            }`}
                          >
                            {isDetected && distanceFeedback === 'perfect' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>POSISI PAS</span>
                              </>
                            ) : isDetected && distanceFeedback === 'too-close' ? (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>MUNDUR SEDIKIT</span>
                              </>
                            ) : isDetected && distanceFeedback === 'too-far' ? (
                              <>
                                <Scan className="w-3.5 h-3.5 text-sky-400" />
                                <span>MAJU SEDIKIT</span>
                              </>
                            ) : (
                              <>
                                <Scan className="w-3.5 h-3.5 opacity-70 animate-pulse" />
                                <span>MENCARI WAJAH...</span>
                              </>
                            )}
                          </div>
                        </div>
                        {/* KTP Area Label */}
                        <span className={`absolute top-[75%] mt-1 font-bold tracking-wider text-[10px] transition-colors duration-300 ${isDetected ? 'text-emerald-300' : 'text-slate-400'}`}>
                          Area KTP
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {!capturedPreview && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors border border-slate-700 flex items-center gap-2"
              >
                <SwitchCamera className="w-4 h-4" />
                <span className="hidden sm:inline">Balik Kamera</span>
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            {capturedPreview ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isUploading}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl transition-all border border-slate-700"
                >
                  Ulangi
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isUploading}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  <span>Gunakan Foto Ini</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleTakeSnap}
                disabled={!stream}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Ambil Foto Snap</span>
              </button>
            )}
          </div>
        </div>
          </div>
        )}
      </div>
    </div>
  );
}
