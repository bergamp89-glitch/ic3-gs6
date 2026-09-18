import React, { useState, useEffect, useRef } from 'react';
import { detectFaceInVideo, loadFaceModels } from '../utils/faceDetector';

export default function FaceProctoringWidget({ studentName, level, onWarning }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [status, setStatus] = useState('checking'); // 'checking' | 'active' | 'warning' | 'error'
  const [statusMessage, setStatusMessage] = useState('Proctoring faollashtirilmoqda...');
  const [warningCount, setWarningCount] = useState(0);

  // Widget DOM havolasi
  const widgetRef = useRef(null);

  // Standart boshlang'ich pozitsiyani hisoblash (o'ng yuqori qism)
  const getDefaultPosition = () => {
    if (typeof window === 'undefined') return { x: 20, y: 74 };
    const width = window.innerWidth;
    const isMobile = width < 768;
    const widgetWidth = isMobile ? 120 : 140;
    return {
      x: Math.max(10, width - widgetWidth - (isMobile ? 12 : 24)),
      y: isMobile ? 54 : 74
    };
  };

  // Foydalanuvchi tanlagan erkin koordinatalar { x, y }
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('ic3_proctor_pos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const maxX = Math.max(10, window.innerWidth - 120);
          const maxY = Math.max(10, window.innerHeight - 80);
          return {
            x: Math.min(Math.max(10, parsed.x), maxX),
            y: Math.min(Math.max(10, parsed.y), maxY)
          };
        }
      }
    } catch (e) {}
    return getDefaultPosition();
  });

  // Surish (drag & drop) holati
  const [isDragging, setIsDragging] = useState(false);
  const dragInfoRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const missedFramesRef = useRef(0);

  // Ekran o'lchami o'zgarganda ekrandan chiqib ketmasligini ta'minlash
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        if (!prev) return getDefaultPosition();
        const el = widgetRef.current;
        const w = el ? el.offsetWidth : 140;
        const h = el ? el.offsetHeight : 150;
        const maxX = Math.max(8, window.innerWidth - w - 8);
        const maxY = Math.max(8, window.innerHeight - h - 8);
        return {
          x: Math.min(Math.max(8, prev.x), maxX),
          y: Math.min(Math.max(8, prev.y), maxY)
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Streamni video DOM elementiga ishonchli ulash
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

  // Erkin surish (Pointer Events orqali sichqoncha va sensor ekranlarda silliq ishlaydi)
  const handlePointerDown = (e) => {
    // Agar tugma bosilgan bo'lsa (masalan, yopish, burchak o'zgartirish), surishni boshlamaslik
    if (e.target.closest('button[data-no-drag="true"]')) return;
    // Faqat asosiy tugma (chap tugma yoki touch)
    if (e.button !== undefined && e.button !== 0) return;

    dragInfoRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragInfoRef.current.active) return;
    const deltaX = e.clientX - dragInfoRef.current.startX;
    const deltaY = e.clientY - dragInfoRef.current.startY;

    if (!dragInfoRef.current.hasMoved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      dragInfoRef.current.hasMoved = true;
    }

    if (dragInfoRef.current.hasMoved) {
      const el = widgetRef.current;
      const w = el ? el.offsetWidth : 135;
      const h = el ? el.offsetHeight : 150;

      const minX = 8;
      const minY = 8;
      const maxX = Math.max(8, window.innerWidth - w - 8);
      const maxY = Math.max(8, window.innerHeight - h - 8);

      const targetX = Math.min(Math.max(minX, dragInfoRef.current.initialX + deltaX), maxX);
      const targetY = Math.min(Math.max(minY, dragInfoRef.current.initialY + deltaY), maxY);

      setPosition({ x: targetX, y: targetY });
    }
  };

  const handlePointerUp = (e) => {
    if (!dragInfoRef.current.active) return;
    dragInfoRef.current.active = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (dragInfoRef.current.hasMoved) {
      setPosition(current => {
        try {
          localStorage.setItem('ic3_proctor_pos', JSON.stringify(current));
        } catch (err) {}
        return current;
      });
    }
  };

  // Burchaklarni tez almashtirish (agar foydalanuvchi tezda boshqa burchakka qo'ymoqchi bo'lsa)
  const cycleCornerPosition = (e) => {
    e.stopPropagation();
    const el = widgetRef.current;
    const w = el ? el.offsetWidth : 135;
    const h = el ? el.offsetHeight : 150;
    const padding = 12;

    const corners = [
      { name: 'top-right', x: window.innerWidth - w - padding, y: 74 },
      { name: 'bottom-right', x: window.innerWidth - w - padding, y: window.innerHeight - h - 60 },
      { name: 'bottom-left', x: padding, y: window.innerHeight - h - 60 },
      { name: 'top-left', x: padding, y: 74 }
    ];

    // Joriy pozitsiyaga eng yaqin burchakni topish va keyingisiga o'tish
    let closestIndex = 0;
    let minDistance = Infinity;
    corners.forEach((c, idx) => {
      const dist = Math.hypot(c.x - position.x, c.y - position.y);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    const nextIndex = (closestIndex + 1) % corners.length;
    const nextPos = { x: Math.max(8, corners[nextIndex].x), y: Math.max(8, corners[nextIndex].y) };
    setPosition(nextPos);
    try {
      localStorage.setItem('ic3_proctor_pos', JSON.stringify(nextPos));
    } catch (err) {}
  };

  return (
    <div
      ref={widgetRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none'
      }}
      className={`fixed z-40 select-none ${
        isDragging ? 'cursor-grabbing scale-[1.02] shadow-2xl ring-2 ring-blue-400/60' : 'transition-transform duration-100'
      }`}
    >
      {isMinimized ? (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={(e) => {
            // Agar surilgan bo'lsa, ochilish hodisasini bekor qilish
            if (dragInfoRef.current.hasMoved) {
              e.stopPropagation();
              return;
            }
            setIsMinimized(false);
          }}
          className={`cursor-grab active:cursor-grabbing flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-2xl border text-[10px] sm:text-xs font-bold transition-all backdrop-blur-md ${
            status === 'warning'
              ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
              : status === 'active'
              ? 'bg-[#1a446b]/95 text-white border-blue-300/40 hover:bg-[#153655]'
              : 'bg-slate-800/95 text-slate-200 border-slate-600'
          }`}
          title="Ochish uchun bosing, istalgan joyga surish uchun ushlang"
        >
          {/* Grip Icon */}
          <svg className="w-2.5 h-2.5 text-blue-200/70" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="5" cy="4" r="1.5"/>
            <circle cx="11" cy="4" r="1.5"/>
            <circle cx="5" cy="8" r="1.5"/>
            <circle cx="11" cy="8" r="1.5"/>
            <circle cx="5" cy="12" r="1.5"/>
            <circle cx="11" cy="12" r="1.5"/>
          </svg>

          <span className={`w-2 h-2 rounded-full ${
            status === 'active' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
          }`} />
          <span>AI Proctoring</span>
          {warningCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
              {warningCount}
            </span>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 text-white rounded-xl shadow-2xl border-2 border-slate-700/80 overflow-hidden w-[115px] sm:w-[135px] flex flex-col transition-all">
          {/* Draggable Header */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="cursor-grab active:cursor-grabbing bg-[#153655] hover:bg-[#1b4369] px-2 py-1 flex items-center justify-between border-b border-slate-700 text-[10px] transition-colors"
            title="Istalgan joyga surish uchun ushlang"
          >
            <div className="flex items-center gap-1.5 truncate pointer-events-none">
              {/* Drag Grip dots */}
              <svg className="w-2.5 h-3 text-blue-300/80 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="4" cy="3" r="1.5"/>
                <circle cx="10" cy="3" r="1.5"/>
                <circle cx="4" cy="8" r="1.5"/>
                <circle cx="10" cy="8" r="1.5"/>
                <circle cx="4" cy="13" r="1.5"/>
                <circle cx="10" cy="13" r="1.5"/>
              </svg>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                status === 'active' ? 'bg-emerald-400 animate-pulse' : status === 'warning' ? 'bg-rose-400 animate-ping' : 'bg-amber-400'
              }`} />
              <span className="font-bold truncate text-blue-100 text-[9px] sm:text-[10px]">AI Proctoring</span>
            </div>
            
            <div className="flex items-center gap-0.5">
              {/* Tez burchak almashtirish tugmasi */}
              <button
                data-no-drag="true"
                type="button"
                onClick={cycleCornerPosition}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
                title="Burchakka sakrash (burchaklarni almashtirish)"
              >
                <svg className="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              
              {/* Kichiklashtirish tugmasi */}
              <button
                data-no-drag="true"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
                title="Kichiklashtirish"
              >
                <svg className="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-full h-full object-cover transform scale-x-[-1] pointer-events-none"
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
