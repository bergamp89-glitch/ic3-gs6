import React, { useState, useEffect, useRef } from 'react';
import { detectFaceInVideo, loadFaceModels } from '../utils/faceDetector';

export default function FaceProctoringWidget({ studentName, level, onWarning }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [status, setStatus] = useState('checking'); // 'checking' | 'active' | 'warning' | 'error'
  const [statusMessage, setStatusMessage] = useState('Proctoring faollashtirilmoqda...');
  const [warningCount, setWarningCount] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const missedFramesRef = useRef(0);

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
        setStatusMessage('Proctoring faol ✓');

        // Monitoring loop (har 3.5 soniyada yuzni tekshirish)
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
        }, 3500);

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

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border text-xs font-bold transition-all ${
            status === 'warning'
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : status === 'active'
              ? 'bg-[#1a446b] text-white border-blue-400'
              : 'bg-slate-800 text-slate-200 border-slate-600'
          }`}
          title="Proctoring kamerasini kattalashtirish"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${
            status === 'active' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
          }`} />
          <span>AI Proctoring</span>
          {warningCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
              {warningCount}
            </span>
          )}
        </button>
      ) : (
        <div className="bg-slate-900 text-white rounded-xl shadow-2xl border-2 border-slate-700 overflow-hidden w-[160px] sm:w-[190px] flex flex-col transition-all">
          {/* Header */}
          <div className="bg-[#153655] px-2.5 py-1.5 flex items-center justify-between border-b border-slate-700 text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                status === 'active' ? 'bg-emerald-400 animate-pulse' : status === 'warning' ? 'bg-rose-400 animate-ping' : 'bg-amber-400'
              }`} />
              <span className="font-bold truncate text-blue-100">AI Proctoring</span>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-white p-0.5"
              title="Kichiklashtirish"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Video Container */}
          <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            {status === 'warning' && (
              <div className="absolute inset-0 bg-rose-600/30 border-2 border-rose-500 pointer-events-none animate-pulse flex items-center justify-center">
                <span className="bg-rose-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                  Ogohlantirish!
                </span>
              </div>
            )}
          </div>

          {/* Status Footer */}
          <div className="p-1.5 bg-slate-950/90 text-[10px] border-t border-slate-800 text-center truncate">
            <span className={`font-semibold ${
              status === 'active' ? 'text-emerald-400' : status === 'warning' ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}>
              {statusMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
