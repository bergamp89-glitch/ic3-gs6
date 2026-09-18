import React, { useState, useEffect, useRef } from 'react';

function FaceRegistrationModal({
  isOpen,
  onClose,
  onConfirm,
  registration,
  isSubmitting
}) {
  const [cameraStatus, setCameraStatus] = useState('initializing'); // 'initializing' | 'active' | 'no-camera' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera tracks helper
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
  };

  // Start webcam
  const startCamera = async () => {
    stopStream();
    setCameraStatus('initializing');
    setErrorMessage('');
    setCapturedImage(null);

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('no-camera');
      setErrorMessage("Qurilmangizda yoki brauzeringizda kamera qo'llab-quvvatlanmaydi. Testga kirish taqiqlanadi.");
      return;
    }

    try {
      // First check if any videoinput device exists
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      if (videoDevices.length === 0) {
        setCameraStatus('no-camera');
        setErrorMessage("Qurilmangizda kamera topilmadi! Imtihonda qatnashish uchun kamera bo'lishi shart. Testga kirish taqiqlanadi.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error("Play error:", e));
          setCameraStatus('active');
        };
      } else {
        setCameraStatus('active');
      }
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('denied');
        setErrorMessage("Kameradan foydalanishga ruxsat berilmadi! Testga kirish uchun brauzer sozlamalaridan kameraga ruxsat bering.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraStatus('no-camera');
        setErrorMessage("Qurilmangizda kamera mavjud emas! Test topshirish uchun kamera bo'lishi shart. Testga kirish taqiqlanadi.");
      } else {
        setCameraStatus('error');
        setErrorMessage("Kamerani yoqishda xatolik yuz berdi: " + (err.message || "Noma'lum xatolik"));
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedImage(null);
      setCountdown(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Handle capture
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Desired output resolution (square/portrait for face avatar)
    const targetSize = 400;
    canvas.width = targetSize;
    canvas.height = targetSize;

    const ctx = canvas.getContext('2d');

    // Calculate center crop from video stream
    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;
    const minDim = Math.min(vWidth, vHeight);
    const startX = (vWidth - minDim) / 2;
    const startY = (vHeight - minDim) / 2;

    // Mirror the image horizontally for natural user selfie expectation
    ctx.translate(targetSize, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);

    const base64Photo = canvas.toDataURL('image/jpeg', 0.82);
    setCapturedImage(base64Photo);
    stopStream();
  };

  const handleStartCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handleSnap();
      setCountdown(null);
    }
  }, [countdown]);

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = () => {
    if (!capturedImage) return;
    onConfirm(capturedImage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="bg-[#1a446b] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-300/30">
              <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-wide">Face ID Ro'yxatdan O'tish</h2>
              <p className="text-[11px] text-blue-200 font-medium">Shaxsiy identifikatsiyadan o'tish majburiy</p>
            </div>
          </div>
          {!isSubmitting && (
            <button
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-sm hover:bg-white/10"
              title="Yopish"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* User Info Bar */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs text-gray-700">
          <div>
            <span className="text-gray-500 font-medium">Nomzod: </span>
            <span className="font-bold text-[#1a446b]">{registration.firstName} {registration.lastName}</span>
          </div>
          <div>
            <span className="bg-[#1a446b] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
              {registration.level}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          {/* CAMERA ERROR / NO CAMERA STATE */}
          {(cameraStatus === 'no-camera' || cameraStatus === 'denied' || cameraStatus === 'error') && (
            <div className="w-full bg-rose-50 border-2 border-rose-300 rounded-lg p-5 text-center my-3">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-rose-900 mb-1">
                {cameraStatus === 'no-camera' ? "Qurilmangizda kamera mavjud emas!" : "Kameraga ruxsat berilmadi!"}
              </h3>
              <p className="text-xs sm:text-sm text-rose-700 font-medium leading-relaxed mb-4">
                {errorMessage}
              </p>
              <div className="bg-white/80 p-3 rounded border border-rose-200 text-left text-xs text-gray-700 mb-5">
                <p className="font-bold text-rose-800 mb-1">Qat'iy Talab:</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  <li>Imtihon shaffofligini ta'minlash uchun Face ID majburiy hisoblanadi.</li>
                  <li>Kamerasi mavjud bo'lmagan foydalanuvchilar imtihonga qo'yilmaydi.</li>
                  <li>Kamerangizni ulang yoki smartfon orqali kirib qayta urinib ko'ring.</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 bg-[#1a446b] hover:bg-[#153655] text-white py-2.5 px-4 rounded-sm text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Qayta urinish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    onClose();
                  }}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 py-2.5 px-4 rounded-sm text-xs sm:text-sm font-semibold transition-colors"
                >
                  Orqaga
                </button>
              </div>
            </div>
          )}

          {/* INITIALIZING CAMERA SPINNER */}
          {cameraStatus === 'initializing' && (
            <div className="w-full aspect-square max-w-[340px] bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-6 shadow-inner">
              <svg className="w-10 h-10 text-blue-400 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-xs sm:text-sm font-semibold text-gray-200">Kamera faollashtirilmoqda...</p>
              <p className="text-[11px] text-gray-400 mt-1">Iltimos, kameraga ruxsat bering</p>
            </div>
          )}

          {/* ACTIVE CAMERA VIEW (NOT YET CAPTURED) */}
          {cameraStatus === 'active' && !capturedImage && (
            <div className="flex flex-col items-center w-full">
              <div className="relative w-full aspect-square max-w-[340px] bg-black rounded-lg overflow-hidden shadow-md border-2 border-slate-300">
                {/* Video element (Mirrored) */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />

                {/* Biometric Oval Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[78%] h-[82%] border-2 border-dashed border-emerald-400/90 rounded-[50%] shadow-[0_0_20px_rgba(52,211,153,0.3)] relative">
                    {/* Corner Guides */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-emerald-300 text-[10px] font-bold bg-slate-900/60 px-2 py-0.5 rounded-full tracking-wider uppercase">
                      Yuz doirasi
                    </div>
                  </div>

                  {/* Animated Scanner Laser Line */}
                  <div className="absolute inset-x-8 top-1/4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse"></div>
                </div>

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                    <span className="text-7xl font-extrabold text-white animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-3 text-center px-2">
                Yuzingizni to'liq markazga to'g'rilang, ko'zlaringiz ochiq va yorug'lik yetarli bo'lsin.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-4 w-full max-w-[340px]">
                <button
                  type="button"
                  onClick={handleSnap}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-sm text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 hover:shadow-lg active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Yuzni suratga olish
                </button>
                <button
                  type="button"
                  onClick={handleStartCountdown}
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold py-2.5 px-3 rounded-sm text-xs transition-colors flex items-center gap-1"
                  title="3 soniyali taymer bilan olish"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  3s
                </button>
              </div>
            </div>
          )}

          {/* CAPTURED PREVIEW STATE */}
          {capturedImage && (
            <div className="flex flex-col items-center w-full">
              <div className="relative w-full aspect-square max-w-[340px] bg-slate-900 rounded-lg overflow-hidden shadow-lg border-2 border-emerald-500">
                <img
                  src={capturedImage}
                  alt="Captured Face"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  Yuz saqlandi
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 mt-3 w-full max-w-[340px] text-center">
                <p className="text-xs font-bold text-emerald-800">
                  Rasm muvaffaqiyatli saqlandi!
                </p>
                <p className="text-[11px] text-emerald-600">
                  Ushbu rasm admin tomonidan tasdiqlanishi uchun yuboriladi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 mt-4 w-full max-w-[340px]">
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isSubmitting}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-3 rounded-sm text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Qayta olish
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 bg-[#1a446b] hover:bg-[#153655] text-white py-2.5 px-4 rounded-sm text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tasdiqlash & Yuborish
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Hidden Canvas for capture processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}

export default FaceRegistrationModal;
