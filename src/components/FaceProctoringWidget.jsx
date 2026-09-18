import React, { useState, useEffect, useRef } from 'react';
import { detectFaceInVideo, loadFaceModels } from '../utils/faceDetector';

export default function FaceProctoringWidget({ studentName, level, onWarning }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [status, setStatus] = useState('checking'); // 'checking' | 'active' | 'warning' | 'error'
  const [statusMessage, setStatusMessage] = useState('Proctoring faollashtirilmoqda...');
  const [warningCount, setWarningCount] = useState(0);
  
  // Pozitsiya: standart holatda desktopda headerdan pastda, telefonda navigation ostida
  // 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'
  const [cornerPosition, setCornerPosition] = useState('top-right');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const missedFramesRef = useRef(0);

  // Streamni video DOM elementiga ishonchli ulash (re-render va unminimize dan keyin ham)
  const handleVideoRef = (el) => {
    videoRef.current = el;
    if (el && streamRef.current) {
      if (el.srcObject !== streamRef.current) {
        el.srcObject = streamRef.current;
      }
      el.play().catch(e => console.warn("Proctoring video play error:", e));
    }
  };

  const stopCamera = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => {
        try { t.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initProctoring() {
      try {
        await loadFaceModels();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isMounted) {
            setStatus('error');
            setStatusMessage('Kamera topilmadi');
          }
          return;
        }

        // Avvalgi stream to'liq tozalanishi uchun qisqa kechikish
        await new Promise(r => setTimeout(r, 200));
        if (!isMounted) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            facingMode: 'user'
          },
          audio: false
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Proctoring video play:", e));
        }

        setStatus('active');
        setStatusMessage('Nazorat ostida ✓');

        // Monitoring loop (har 3 soniyada yuzni tekshirish)
        checkIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          const res = await detectFaceInVideo(videoRef.current);

          if (!res.detected) {
            missedFramesRef.current += 1;
            if (missedFramesRef.current >= 2) {
              setStatus('warning');
              setStatusMessage(res.message || 'Yuz aniqlanmadi!');
              setWarningCount(prev => prev + 1);
              if (onWarning) onWarning(res.message);
            }
          } else if (res.quality === 'multiple') {
            setStatus('warning');
            setStatusMessage('Begona shaxs aniqlandi!');
            setWarningCount(prev => prev + 1);
            if (onWarning) onWarning('Kadrda bir nechta shaxs bor');
          } else {
            missedFramesRef.current = 0;
            setStatus('active');
            setStatusMessage('Nazorat ostida ✓');
          }
        }, 3200);

      } catch (err) {
        console.warn("Proctoring camera init error:", err);
        if (isMounted) {
          setStatus('error');
          setStatusMessage("Kamera ulanmadi");
        }
      }
    }

    initProctoring();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  // Burchakni almashtirish (agar foydalanuvchi boshqa joyga o'tkazmoqchi bo'lsa)
  const toggleCornerPosition = () => {
    setCornerPosition(prev => {
      if (prev === 'top-right') return 'bottom-right';
      if (prev === 'bottom-right') return 'bottom-left';
      if (prev === 'bottom-left') return 'top-left';
      return 'top-right';
    });
  };

  // Pozitsiya klasslari:
  // Kompyuterda top-[74px] bo'ladi — header (60px) tugmalarini (Home, Restart Exam) mutlaqo to'smaydi!
  // Telefonda top-[54px] bo'ladi — navigation (45px) ostida, pastdagi Previous/Next tugmalarini to'smaydi!
  const getPositionClasses = () => {
    switch (cornerPosition) {
      case 'bottom-right':
        return 'bottom-16 md:bottom-6 right-2 md:right-4';
      case 'bottom-left':
        return 'bottom-16 md:bottom-6 left-2 md:left-4';
      case 'top-left':
        return 'top-[54px] md:top-[74px] left-2 md:left-4';
      case 'top-right':
      default:
        return 'top-[54px] md:top-[74px] right-2 md:right-4';
    }
  };

  return (
    <div className={`fixed z-40 select-none transition-all duration-300 ${getPositionClasses()}`}>
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-xl border text-[10px] sm:text-xs font-bold transition-all backdrop-blur-md ${
            status === 'warning'
              ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
              : status === 'active'
              ? 'bg-[#1a446b]/95 text-white border-blue-300/40 hover:bg-[#153655]'
              : 'bg-slate-800/95 text-slate-200 border-slate-600'
          }`}
          title="Proctoring kamerasini ochish"
        >
          <span className={`w-2 h-2 rounded-full ${
            status === 'active' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
          }`} />
          <span>AI Proctoring</span>
          {warningCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
              {warningCount}
            </span>
          )}
        </button>
      ) : (
        <div className="bg-slate-900 text-white rounded-xl shadow-2xl border-2 border-slate-700/80 overflow-hidden w-[115px] sm:w-[135px] flex flex-col transition-all">
          {/* Header */}
          <div className="bg-[#153655] px-2 py-1 flex items-center justify-between border-b border-slate-700 text-[10px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                status === 'active' ? 'bg-emerald-400 animate-pulse' : status === 'warning' ? 'bg-rose-400 animate-ping' : 'bg-amber-400'
              }`} />
              <span className="font-bold truncate text-blue-100 text-[9px] sm:text-[10px]">AI Proctoring</span>
            </div>
            
            <div className="flex items-center gap-0.5">
              {/* Burchakni almashtirish tugmasi */}
              <button
                type="button"
                onClick={toggleCornerPosition}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
                title="Burchakni o'zgartirish (pastga/tepaga)"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              
              {/* Kichiklashtirish tugmasi */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
                title="Kichiklashtirish"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
            <video
              ref={handleVideoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={(e) => {
                try { e.target.play(); } catch (err) {}
              }}
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            {status === 'warning' && (
              <div className="absolute inset-0 bg-rose-600/30 border-2 border-rose-500 pointer-events-none animate-pulse flex items-center justify-center">
                <span className="bg-rose-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                  Ogohlantirish!
                </span>
              </div>
            )}
          </div>

          {/* Status Footer */}
          <div className="py-1 px-1.5 bg-slate-950/95 text-[9px] sm:text-[10px] border-t border-slate-800 text-center leading-snug">
            <span className={`font-bold ${
              status === 'active' ? 'text-emerald-400' : status === 'warning' ? 'text-rose-400 font-bold' : 'text-slate-300'
            }`}>
              {statusMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
