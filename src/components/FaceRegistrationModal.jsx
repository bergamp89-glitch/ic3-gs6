import React, { useState, useEffect, useRef } from 'react';
import { compareFaces, getFaceDescriptor } from '../utils/faceMatcher';
import { detectFaceInVideo, loadFaceModels } from '../utils/faceDetector';

function FaceRegistrationModal({
  isOpen,
  onClose,
  onConfirm,
  onVerifySuccess,
  mode = 'ENROLL', // 'ENROLL' (yuzni avtomatik ro'yxatdan o'tkazish) | 'VERIFY' (qayta kirishda tekshirish)
  adminApprovedPhoto = null,
  registration = {},
  isSubmitting = false
}) {
  const [cameraStatus, setCameraStatus] = useState('initializing'); // 'initializing' | 'active' | 'no-camera' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Live face detection state with strict biometric checks
  const [detection, setDetection] = useState({
    detected: false,
    quality: 'low',
    message: "Kamera ulanmoqda...",
    box: null
  });

  // Biometric scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPrompt, setScanPrompt] = useState("Yuzingizni ramka markaziga to'g'rilang");
  const [isCompleted, setIsCompleted] = useState(false);

  // Verification state (Face Unlock)
  const [verifyStatus, setVerifyStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'failed'
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyConfidence, setVerifyConfidence] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectIntervalRef = useRef(null);
  const scanTimerRef = useRef(null);
  const isScanningRef = useRef(false);
  const hasSubmittedRef = useRef(false);
  const stableFramesRef = useRef(0);

  // Stop camera stream
  const stopStream = () => {
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Safely attach stream to video element
  const attachStreamToVideo = (stream) => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => {
        setCameraStatus('active');
        startLiveDetection();
      }).catch(err => {
        console.warn("Video play error:", err);
        setCameraStatus('active');
        startLiveDetection();
      });
    }
  };

  // Start camera and preload models
  const startCamera = async () => {
    stopStream();
    setCameraStatus('initializing');
    setErrorMessage('');
    setIsScanning(false);
    isScanningRef.current = false;
    hasSubmittedRef.current = false;
    stableFramesRef.current = 0;
    setScanProgress(0);
    setIsCompleted(false);
    setScanPrompt("Yuzingizni ramka markaziga to'g'rilang");
    setVerifyStatus('idle');
    setVerifyMessage('');
    setVerifyConfidence(null);
    setDetection({
      detected: false,
      quality: 'low',
      message: "Kamera ulanmoqda...",
      box: null
    });

    // Start loading AI models in background
    loadFaceModels().catch(e => console.warn("Model preloading:", e));

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('no-camera');
      setErrorMessage("Qurilmangizda kamera qo'llab-quvvatlanmaydi. Iltimos, boshqa brauzer yoki smartfondan kiring.");
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      if (videoDevices.length === 0) {
        setCameraStatus('no-camera');
        setErrorMessage("Qurilmangizda kamera topilmadi! Face ID uchun kamera bo'lishi shart.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      attachStreamToVideo(stream);
      setCameraStatus('active');
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
        setErrorMessage("Kameradan foydalanishga ruxsat berilmadi. Brauzer URL qatoridagi qulf belgisidan kameraga ruxsat bering.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraStatus('no-camera');
        setErrorMessage("Qurilmangizda kamera topilmadi.");
      } else {
        setCameraStatus('error');
        setErrorMessage("Kamerani yoqishda xatolik: " + (err.message || "Noma'lum xato"));
      }
    }
  };

  // Real-time strict biometric loop
  const startLiveDetection = () => {
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);

    detectIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || hasSubmittedRef.current) return;
      const res = await detectFaceInVideo(videoRef.current);
      setDetection(res);

      if (res.detected && res.quality === 'good') {
        stableFramesRef.current += 1;

        // 1. ENROLL REJIMI: 4 ta kadr barqaror tursa avtomatik skanerlash
        if (
          mode === 'ENROLL' && 
          !isScanningRef.current && 
          !hasSubmittedRef.current && 
          stableFramesRef.current >= 4
        ) {
          triggerAutoScan();
        }

        // 2. VERIFY REJIMI (Tasdiqlangan foydalanuvchi qayta kirganda avtomatik tekshirish)
        if (
          mode === 'VERIFY' &&
          !isScanningRef.current &&
          verifyStatus === 'idle' &&
          stableFramesRef.current >= 3
        ) {
          handleVerifyFace();
        }
      } else {
        stableFramesRef.current = 0;
        if (isScanningRef.current && !hasSubmittedRef.current && mode === 'ENROLL') {
          cancelScan(res.message);
        }
      }
    }, 200);
  };

  const cancelScan = (reason) => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    isScanningRef.current = false;
    setIsScanning(false);
    setScanProgress(0);
    setScanPrompt(reason || "Yuzingizni qimirlatmay, oval markazida tuting");
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setIsScanning(false);
      isScanningRef.current = false;
      hasSubmittedRef.current = false;
      setScanProgress(0);
      setIsCompleted(false);
      setVerifyStatus('idle');
      setVerifyConfidence(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen, mode]);

  const handleVideoRef = (el) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      attachStreamToVideo(streamRef.current);
    }
  };

  // Capture clean frame
  const captureFrame = () => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      return null;
    }

    const video = videoRef.current;
    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;

    if (vWidth === 0 || vHeight === 0) return null;

    const canvas = document.createElement('canvas');
    const targetW = 420;
    const targetH = 500;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    const cropW = Math.min(vWidth, vHeight * (targetW / targetH));
    const cropH = cropW * (targetH / targetW);
    const startX = (vWidth - cropW) / 2;
    const startY = (vHeight - cropH) / 2;

    // Mirroring horizontal
    ctx.translate(targetW, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, targetW, targetH);

    return canvas.toDataURL('image/jpeg', 0.90);
  };

  // --- HAQIQIY AVTOMATIK SKANERLASH VA ADMINGA YUBORISH (ENROLLMENT) ---
  const triggerAutoScan = () => {
    if (isScanningRef.current || hasSubmittedRef.current) return;

    isScanningRef.current = true;
    setIsScanning(true);
    setScanProgress(0);
    setScanPrompt("Yuzingiz to'liq aniqlandi. Qimirlamang, biometrik skanerlanmoqda...");

    let current = 0;
    scanTimerRef.current = setInterval(async () => {
      current += 4;
      setScanProgress(current);

      if (current >= 100) {
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
        setScanProgress(100);
        setIsScanning(false);
        setScanPrompt("Biometrik tahlil yakunlandi ✓ Tasdiqlanmoqda...");

        // Rasmni kesib olish
        const photo = captureFrame();
        if (!photo) {
          cancelScan("Tasvir olinmadi, qaytadan urinib ko'ring");
          return;
        }

        // Haqiqiy AI Face Descriptor tekshiruvi (surat sifatsiz yoki noaniq bo'lsa qabul qilmaydi)
        try {
          const descriptor = await getFaceDescriptor(photo);
          if (!descriptor) {
            cancelScan("Yuzingiz to'liq tushmadi yoki xira chiqdi! Iltimos, yaxshiroq yorug'likda to'g'riga qarang.");
            return;
          }
        } catch (e) {
          console.warn("Descriptor check err:", e);
        }

        if (!hasSubmittedRef.current) {
          hasSubmittedRef.current = true;
          setIsCompleted(true);
          setScanPrompt("Yuz to'liq ro'yxatga olindi! Adminga yuborilmoqda... ✓");

          setTimeout(() => {
            stopStream();
            onConfirm(photo);
          }, 800);
        }
      }
    }, 45);
  };

  // --- FACE UNLOCK (VERIFY AGAINST ADMIN-APPROVED FACE USING AI) ---
  const handleVerifyFace = async () => {
    if (isScanningRef.current || cameraStatus !== 'active') return;

    if (!detection.detected || detection.quality !== 'good') {
      return;
    }

    isScanningRef.current = true;
    setVerifyStatus('verifying');
    setVerifyMessage("AI neyron tarmog'i shaxsingiz va yuzingizni tekshirmoqda...");
    setIsScanning(true);
    setScanProgress(20);

    let progress = 20;
    const progressTimer = setInterval(() => {
      progress += 15;
      setScanProgress(Math.min(90, progress));
    }, 100);

    setTimeout(async () => {
      clearInterval(progressTimer);
      const livePhoto = captureFrame();

      if (!livePhoto) {
        isScanningRef.current = false;
        setIsScanning(false);
        setVerifyStatus('failed');
        setVerifyMessage("Kameradan tasvir olinmadi. Yuzingizni ramkaga to'g'rilang.");
        setScanProgress(0);
        return;
      }

      if (!adminApprovedPhoto) {
        isScanningRef.current = false;
        setIsScanning(false);
        setVerifyStatus('failed');
        setVerifyMessage("Ushbu email uchun admin tasdiqlagan fotosurat topilmadi!");
        setScanProgress(0);
        return;
      }

      try {
        const result = await compareFaces(adminApprovedPhoto, livePhoto, 60);
        setVerifyConfidence(result.confidence);
        setIsScanning(false);

        if (result.match) {
          setScanProgress(100);
          setVerifyStatus('success');
          setVerifyMessage(`Yuz va Email tasdiqlandi! (Moslik: ${result.confidence}%). Xush kelibsiz!`);

          setTimeout(() => {
            stopStream();
            if (onVerifySuccess) {
              onVerifySuccess(livePhoto);
            }
          }, 900);
        } else {
          isScanningRef.current = false;
          setScanProgress(0);
          setVerifyStatus('failed');
          const errMsg = `Yuz mos kelmadi! (Moslik: ${result.confidence}%). Siz ushbu email (${registration.email}) egasi emassiz. Kirish taqiqlanadi!`;
          setVerifyMessage(errMsg);
        }
      } catch (e) {
        isScanningRef.current = false;
        setIsScanning(false);
        setVerifyStatus('failed');
        setVerifyMessage("Taqqoslashda xatolik yuz berdi: " + e.message);
      }
    }, 600);
  };

  const handleRetryVerify = () => {
    isScanningRef.current = false;
    hasSubmittedRef.current = false;
    stableFramesRef.current = 0;
    setVerifyStatus('idle');
    setVerifyMessage('');
    setVerifyConfidence(null);
    setScanProgress(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto text-slate-800">
        
        {/* Header */}
        <div className="bg-[#1a446b] px-5 py-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-blue-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-wide">
                  {mode === 'VERIFY' ? 'Face ID — Shaxsni Tekshirish' : 'AI Yuzni Ro\'yxatdan O\'tkazish'}
                </h2>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                  mode === 'VERIFY' 
                    ? 'bg-amber-400/20 text-amber-300 border-amber-300/30' 
                    : 'bg-emerald-400/20 text-emerald-300 border-emerald-300/30'
                }`}>
                  {mode === 'VERIFY' ? 'Autentifikatsiya' : 'Face ID'}
                </span>
              </div>
              <p className="text-[11px] text-blue-100 font-medium">
                {mode === 'VERIFY' 
                  ? 'Tasdiqlangan shaxs ekanligingiz biometrik tekshiriladi' 
                  : 'Yuzingiz to\'liq aniqlangach adminga yuboriladi'}
              </p>
            </div>
          </div>

          {!isSubmitting && verifyStatus !== 'success' && !isCompleted && (
            <button
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="text-white/80 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
              title="Yopish"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* User Info Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            {mode === 'VERIFY' && adminApprovedPhoto && (
              <img 
                src={adminApprovedPhoto} 
                alt="Approved Face" 
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                title="Admin tasdiqlagan etalon fotosurat"
              />
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#1a446b]">{registration.firstName} {registration.lastName}</span>
                {mode === 'VERIFY' && (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                    Tasdiqlangan
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">{registration.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="bg-[#1a446b] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
              {registration.level}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex flex-col items-center">

          {/* CAMERA ERROR */}
          {(cameraStatus === 'no-camera' || cameraStatus === 'denied' || cameraStatus === 'error') && (
            <div className="w-full bg-rose-50 border-2 border-rose-300 rounded-xl p-5 text-center my-2">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2.5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-rose-900 mb-1">
                {cameraStatus === 'no-camera' ? "Qurilmangizda kamera topilmadi!" : "Kameraga ruxsat berilmadi!"}
              </h3>
              <p className="text-xs text-rose-700 font-medium mb-4">
                {errorMessage}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 bg-[#1a446b] hover:bg-[#153655] text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors"
                >
                  Qayta urinish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    onClose();
                  }}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-3 rounded-lg text-xs font-semibold"
                >
                  Orqaga
                </button>
              </div>
            </div>
          )}

          {/* LIVE SCANNING VIEWPORT */}
          {cameraStatus !== 'no-camera' && cameraStatus !== 'denied' && (
            <div className="flex flex-col items-center w-full">
              
              {/* Biometric Aperture */}
              <div className={`relative w-[270px] h-[340px] rounded-[135px] overflow-hidden bg-slate-900 shadow-2xl border-4 transition-all duration-300 flex items-center justify-center ${
                isCompleted || verifyStatus === 'success'
                  ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.8)]'
                  : verifyStatus === 'failed'
                  ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.8)]'
                  : isScanning
                  ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.7)]'
                  : detection.detected && detection.quality === 'good'
                  ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]'
                  : 'border-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
              }`}>
                
                {/* VIDEO ELEMENT */}
                <video
                  ref={handleVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />

                {/* Head Guide Contour */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className={`w-[82%] h-[85%] rounded-[50%] border-2 transition-all duration-300 ${
                    isCompleted || verifyStatus === 'success'
                      ? 'border-emerald-400'
                      : isScanning
                      ? 'border-cyan-300 border-solid'
                      : detection.detected && detection.quality === 'good'
                      ? 'border-emerald-400 border-solid'
                      : 'border-amber-300 border-dashed'
                  }`}>
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-white/80 rounded-full"></div>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-white/80 rounded-full"></div>
                  </div>

                  {/* Laser Scanning Beam */}
                  {isScanning && (
                    <div className="absolute inset-x-2 top-1/4 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#06b6d4] animate-pulse"></div>
                  )}
                </div>

                {/* Success Overlay Checkmark */}
                {(verifyStatus === 'success' || isCompleted) && (
                  <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center z-20">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl animate-bounce">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Failure Overlay */}
                {verifyStatus === 'failed' && (
                  <div className="absolute inset-0 bg-rose-950/70 flex flex-col items-center justify-center z-20 p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xl mb-2">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-white text-xs font-bold bg-rose-900/80 px-2 py-0.5 rounded">
                      Yuz mos kelmadi!
                    </span>
                  </div>
                )}

                {/* Live Status Pill with exact guidance */}
                <div className={`absolute bottom-3 inset-x-3 py-1.5 px-2.5 rounded-full text-[11px] font-bold text-center shadow flex items-center justify-center gap-1.5 transition-colors ${
                  isCompleted || verifyStatus === 'success'
                    ? 'bg-emerald-600 text-white'
                    : verifyStatus === 'failed'
                    ? 'bg-rose-600 text-white'
                    : isScanning
                    ? 'bg-cyan-600 text-white'
                    : detection.detected && detection.quality === 'good'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900/90 text-amber-300 border border-amber-500/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    isCompleted || verifyStatus === 'success'
                      ? 'bg-white' 
                      : verifyStatus === 'failed'
                      ? 'bg-white'
                      : isScanning 
                      ? 'bg-white animate-ping' 
                      : detection.detected && detection.quality === 'good'
                      ? 'bg-white animate-pulse' 
                      : 'bg-amber-400'
                  }`}></span>
                  <span className="truncate max-w-[210px]">
                    {isCompleted 
                      ? "Yuz ro'yxatga olindi ✓" 
                      : verifyStatus === 'success'
                      ? "Shaxs tasdiqlandi ✓"
                      : verifyStatus === 'failed'
                      ? "Yuz mos kelmadi ✕"
                      : isScanning 
                      ? (mode === 'VERIFY' ? `Shaxs tekshirilmoqda: ${scanProgress}%` : `Skanerlanmoqda: ${scanProgress}%`) 
                      : detection.message}
                  </span>
                </div>
              </div>

              {/* Progress Bar (when scanning) */}
              {isScanning && (
                <div className="w-[270px] mt-2.5 bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full transition-all duration-75 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              )}

              {/* Status Message */}
              <div className="mt-3 text-center px-4 min-h-[38px] w-full">
                {mode === 'ENROLL' ? (
                  <p className={`text-xs font-semibold ${
                    isCompleted 
                      ? 'text-emerald-600 font-bold' 
                      : detection.detected && detection.quality === 'good'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}>
                    {scanPrompt}
                  </p>
                ) : (
                  <p className={`text-xs font-bold leading-relaxed ${
                    verifyStatus === 'success'
                      ? 'text-emerald-600'
                      : verifyStatus === 'failed'
                      ? 'text-rose-600'
                      : 'text-[#1a446b]'
                  }`}>
                    {verifyMessage || "Yuzingizni oval markaziga to'g'rilang — AI avtomatik tekshiradi"}
                  </p>
                )}
              </div>

              {/* Action Button / Feedback Container */}
              <div className="w-full max-w-[280px] mt-2">
                {mode === 'ENROLL' ? (
                  <div className="flex items-center justify-center">
                    {isCompleted || isSubmitting ? (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold w-full justify-center shadow-sm">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adminga so'rov yuborilmoqda...
                      </div>
                    ) : (
                      <div className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-center border transition-all ${
                        isScanning
                          ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                          : detection.detected && detection.quality === 'good'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-amber-50 border-amber-300 text-amber-800'
                      }`}>
                        {isScanning 
                          ? "Qimirlamay turing, yuz o'qilmoqda..." 
                          : detection.detected && detection.quality === 'good'
                          ? "Yuz aniqlandi ✓ Skanerlash boshlanmoqda..."
                          : "Yuzingizni to'g'ri qilib ovalga sig'diring"}
                      </div>
                    )}
                  </div>
                ) : (
                  // MODE === 'VERIFY'
                  <div>
                    {verifyStatus === 'failed' ? (
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleRetryVerify}
                          className="w-full bg-[#1a446b] hover:bg-[#153655] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Qayta tekshirish
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            stopStream();
                            onClose();
                          }}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-xl text-xs font-semibold"
                        >
                          Chiqish
                        </button>
                      </div>
                    ) : verifyStatus === 'verifying' ? (
                      <div className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-center bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Admin fotosurati bilan solishtirilmoqda...
                      </div>
                    ) : verifyStatus === 'success' ? (
                      <div className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-center bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Tasdiqlandi! Imtihonga kirilmoqda...
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleVerifyFace}
                        disabled={!detection.detected || detection.quality !== 'good'}
                        className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                          !detection.detected || detection.quality !== 'good'
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#1a446b] to-emerald-600 hover:from-[#153655] hover:to-emerald-500 text-white active:scale-95 shadow-lg'
                        }`}
                      >
                        <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Shaxsni Tekshirish va Kirish
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default FaceRegistrationModal;
