import React, { useState, useEffect, useRef } from 'react';

export default function AntiScreenCaptureShield({ registration = {}, sessionId }) {
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [shieldReason, setShieldReason] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const triggerTimeoutRef = useRef(null);

  const activateShield = (reason) => {
    setShieldReason(reason);
    setIsShieldActive(true);
    // Clear clipboard immediately on any suspicion
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('');
      }
    } catch (e) {}
  };

  const deactivateShield = () => {
    setIsShieldActive(false);
    setShieldReason('');
  };

  useEffect(() => {
    // 1. Ekran yozishni (getDisplayMedia) to'sib qo'yish (Neutralize browser screen recording)
    let originalGetDisplayMedia = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = async function (...args) {
        activateShield("Ekranni yozib olish (Screen Recording) vositasi aniqlandi!");
        throw new Error("Screen recording is blocked on this platform.");
      };
    }

    // 2. Klaviatura orqali skrinshotlarni tutish (PrintScreen, Win+Shift+S, Mac Cmd+Shift+3/4/5)
    const handleKeyDown = (e) => {
      // PrintScreen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        activateShield("Skrinshot olishga urinish (PrintScreen) aniqlandi!");
        setWarningCount(c => c + 1);
        return;
      }

      // Windows Snipping Tool (Win + Shift + S) or Ctrl + Shift + S
      if ((e.key === 'S' || e.key === 's') && (e.shiftKey && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        activateShield("Skrinshot vositasi (Snip & Sketch) ochildi!");
        setWarningCount(c => c + 1);
        return;
      }

      // Mac screenshot combinations (Cmd + Shift + 3 / 4 / 5)
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        activateShield("Skrinshot olishga urinish (macOS Screenshot) aniqlandi!");
        setWarningCount(c => c + 1);
        return;
      }

      // Ctrl + P (Chop etish / PDF saqlash)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        activateShield("Sahifani chop etish yoki PDF sifatida saqlash taqiqlanadi!");
        return;
      }

      // Ctrl + S (Sahifani saqlash)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
        activateShield("Skrinshot olindi, ammo bufer tozalandi!");
      }
    };

    // 3. Oyna fokusini yo'qotishi (Snipping Tool ochilganda yoki boshqa ilovaga o'tilganda)
    const handleWindowBlur = () => {
      activateShield("Brauzer fokusdan chiqdi (Boshqa ilova yoki skrinshot vositasi ochildi)");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        activateShield("Sahifa yashirildi yoki boshqa tabga o'tildi");
      }
    };

    // 4. Sichqoncha ekrandan chiqib ketganda (Masalan, Snipping Tool yoki ikkinchi monitorga o'tganda)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        // Sichqoncha brauzer chetidan chiqdi
        if (triggerTimeoutRef.current) clearTimeout(triggerTimeoutRef.current);
        triggerTimeoutRef.current = setTimeout(() => {
          activateShield("Kursor brauzer oynasidan tashqariga chiqdi");
        }, 150);
      }
    };

    const handleMouseEnter = () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
        triggerTimeoutRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (triggerTimeoutRef.current) clearTimeout(triggerTimeoutRef.current);

      if (originalGetDisplayMedia && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      }
    };
  }, []);

  const fullName = `${registration.firstName || ''} ${registration.lastName || ''}`.trim() || 'Nomzod';
  const email = registration.email || '';
  const watermarkText = `${fullName} • ${email} • ${registration.level || 'IC3'}`;

  return (
    <>
      {/* 1. DINAMIK SUV BELGISI (ANTI-LEAK IDENTITY WATERMARK) */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none z-30 overflow-hidden flex flex-wrap gap-12 p-6 select-none opacity-[0.055] font-mono font-bold text-slate-900"
      >
        {Array.from({ length: 48 }).map((_, i) => (
          <div 
            key={i} 
            className="transform -rotate-12 whitespace-nowrap text-xs tracking-wider"
          >
            {watermarkText}
          </div>
        ))}
      </div>

      {/* 2. TO'LIQ QORA XAVFSIZLIK QALQONI (BLACKOUT SHIELD OVERLAY) */}
      {isShieldActive && (
        <div 
          className="fixed inset-0 z-[999999] bg-black text-white flex flex-col items-center justify-center p-6 select-none animate-none"
          style={{ backgroundColor: '#000000' }}
        >
          <div className="max-w-md w-full text-center flex flex-col items-center">
            {/* Warning Shield Icon */}
            <div className="w-20 h-20 rounded-full bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center text-rose-500 mb-6 animate-pulse">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest bg-rose-950/80 px-3 py-1 rounded-full border border-rose-700/50 mb-3">
              Xavfsizlik Tizimi Himoyasi
            </span>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              Skrinshot va Ekran Yozish Taqiqlanadi!
            </h2>

            <p className="text-sm text-slate-300 font-medium mb-5 leading-relaxed">
              Imtihon savollarini suratga olish yoki boshqa dasturlar orqali yozib olish qat'iyan man etiladi. 
              Xavfsizlik maqsadida test maydoni to'liq qoraytirildi.
            </p>

            {shieldReason && (
              <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-rose-300 mb-6 font-mono">
                Aniqlangan harakat: <span className="text-white font-semibold">{shieldReason}</span>
              </div>
            )}

            <div className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 mb-6 text-[11px] text-slate-400">
              Nomzod: <span className="text-slate-200 font-bold">{fullName}</span> ({email})
            </div>

            <button
              onClick={deactivateShield}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Fokusni Qaytarish va Testni Davom Ettirish
            </button>
          </div>
        </div>
      )}
    </>
  );
}
