import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import AdminPanel from './AdminPanel';
function App() {
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || null);
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem('questions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('currentIndex');
    return saved ? Number(saved) : 0;
  });
  const [activeTab, setActiveTab] = useState('INSTRUCTIONS'); 
  const [openDropdownId, setOpenDropdownId] = useState(null); 
  const [appState, setAppState] = useState(() => localStorage.getItem('appState') || 'HOME'); // 'HOME', 'WAITING', 'ADMIN', 'EXAM', 'RESULT'
  const [registration, setRegistration] = useState(() => {
    const saved = localStorage.getItem('registration');
    return saved ? JSON.parse(saved) : { firstName: '', lastName: '', email: '', level: '' };
  });
  
  const [registrationErrors, setRegistrationErrors] = useState({ firstName: false, lastName: false, email: false, level: false });
  const [requestId, setRequestId] = useState(null);

  const [adminCreds, setAdminCreds] = useState({ firstName: 'admin', lastName: 'Doe', email: '0807' });
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(null);
  const [selectedSourceId, setSelectedSourceId] = useState(null);

  // Anti-screenshot / Anti-copy protection
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+P, Ctrl+S, Ctrl+C
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || 
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' || e.key === 'c' || e.key === 'C'))
      ) {
        e.preventDefault();
      }
      
      // Clear clipboard if PrintScreen is pressed
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    
    // Optional: Blur the app when window loses focus (helps against snipping tools)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = 'blur(10px)';
      } else {
        document.body.style.filter = 'none';
      }
    };
    
    const handleWindowBlur = () => {
      document.body.style.filter = 'blur(10px)';
    };
    
    const handleWindowFocus = () => {
      document.body.style.filter = 'none';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const [levelsStatus, setLevelsStatus] = useState({ '1-Level': true, '2-Level': true, '3-Level': true });
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const levels = data.find(d => d.key === 'levels_status');
        const admin = data.find(d => d.key === 'admin_creds');
        if (levels) setLevelsStatus(levels.value);
        if (admin) setAdminCreds(admin.value);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (appState === 'HOME' || appState === 'ADMIN') {
      localStorage.removeItem('appState');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('questions');
      localStorage.removeItem('currentIndex');
      localStorage.removeItem('registration');
    } else {
      localStorage.setItem('appState', appState);
      if (sessionId) localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('questions', JSON.stringify(questions));
      localStorage.setItem('currentIndex', currentIndex);
      localStorage.setItem('registration', JSON.stringify(registration));
    }
  }, [appState, sessionId, questions, currentIndex, registration]);

  useEffect(() => {
    if (sessionId && appState !== 'HOME' && appState !== 'ADMIN') {
      const updateSession = async () => {
        await supabase.from('exam_sessions').update({
          questions,
          current_index: currentIndex,
          app_state: appState,
          registration
        }).eq('id', sessionId);
      };
      updateSession();
    }
  }, [questions, currentIndex, appState, registration, sessionId]);
  
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (appState === 'EXAM') e.preventDefault();
    };
    const handleCopy = (e) => {
      if (appState === 'EXAM') {
        e.preventDefault();
        if (e.clipboardData) e.clipboardData.setData('text/plain', '');
      }
    };
    const handleKeyDown = (e) => {
      if (appState === 'EXAM') {
        if (e.key === 'PrintScreen' || e.keyCode === 44) {
          e.preventDefault();
          if (navigator.clipboard) navigator.clipboard.writeText('');
        }
        if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
          e.preventDefault();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [appState]);

  useEffect(() => {
    async function loadQuestions() {
      if (appState === 'EXAM' && questions.length === 0) {
        let levelNum = 1;
        if (registration.level === '1-Level') levelNum = 1;
        if (registration.level === '2-Level') levelNum = 2;
        if (registration.level === '3-Level') levelNum = 3;

        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('level_num', levelNum)
          .order('id', { ascending: true });

        if (error || !data || data.length === 0) {
          console.error("Savollarni bazadan olishda xatolik:", error);
          return;
        }

        const initial = data.map(dbQ => {
          const q = { id: dbQ.id, prompt: dbQ.prompt, type: dbQ.type, ...dbQ.data };
          let normalizedQ = { ...q };
          
          if (normalizedQ.type === 'SINGLE CHOICE') {
            normalizedQ.type = 'MULTIPLE CHOICE';
          }

          if (normalizedQ.type === 'MATCHING') {
            if (normalizedQ.options && normalizedQ.options.some(opt => opt.text && opt.text.includes('->'))) {
              normalizedQ.type = 'MATCHING TASK';
              normalizedQ.sourceItems = [];
              normalizedQ.targetAreas = [];
              
              normalizedQ.options.forEach((opt) => {
                const parts = opt.text.split('->');
                const leftText = parts[0].trim();
                const rightText = parts.slice(1).join('->').trim();
                const srcId = `src_${opt.id}`;
                const tgtId = `tgt_${opt.id}`;
                normalizedQ.targetAreas.push({ id: tgtId, label: rightText || leftText, correctAnswer: srcId });
              });

              const shuffledOptions = [...normalizedQ.options].sort(() => Math.random() - 0.5);
              shuffledOptions.forEach((opt) => {
                const parts = opt.text.split('->');
                const leftText = parts[0].trim();
                const srcId = `src_${opt.id}`;
                normalizedQ.sourceItems.push({ id: srcId, text: leftText });
              });

              delete normalizedQ.options;
              delete normalizedQ.correctAnswers;
            } else {
              normalizedQ.type = 'MULTIPLE CHOICE';
            }
          }
          
          if (normalizedQ.type === 'TRUE_FALSE_MATRIX' || normalizedQ.type === 'YES_NO_MATRIX') {
            normalizedQ.type = 'INSTRUCTION SET';
            normalizedQ.statements = (normalizedQ.options || []).map((opt, i) => ({
              id: opt.id || `s${i}`,
              text: opt.text,
              options: q.type === 'TRUE_FALSE_MATRIX' ? ['True', 'False'] : ['Yes', 'No'],
              correctAnswer: opt.answer
            }));
          }

          return {
            ...normalizedQ,
            userAnswers: (normalizedQ.type === 'INSTRUCTION SET' || normalizedQ.type === 'MATCHING TASK') ? {} : [],
            status: 'Not Started' 
          };
        });
        setQuestions(initial);
        setCurrentIndex(0);
      }
    }
    loadQuestions();
  }, [appState, registration.level, questions.length]);

  useEffect(() => {
    let intervalId;
    if (appState === 'WAITING' && requestId) {
      intervalId = setInterval(async () => {
        const { data, error } = await supabase
          .from('requests')
          .select('status')
          .eq('id', requestId)
          .single();
          
        if (data) {
          if (data.status === 'approved') {
            clearInterval(intervalId);
            const { data: newSession } = await supabase
              .from('exam_sessions')
              .insert([{ email: registration.email, registration, app_state: 'EXAM' }])
              .select();
            if (newSession && newSession.length > 0) {
              setSessionId(newSession[0].id);
            }
            setAppState('EXAM');
          } else if (data.status === 'rejected') {
            alert('Your request has been rejected.');
            setAppState('HOME');
            clearInterval(intervalId);
          }
        }
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [appState, requestId, registration]);

  if (appState === 'EXAM' && questions.length === 0) return <div>Loading...</div>;

  const currentQ = questions[currentIndex] || null;
  
  const startedCount = questions.filter(q => q.status !== 'Not Started').length;
  const correctCount = questions.filter(q => q.status === 'Correct').length;
  const reviewCount = questions.filter(q => q.status === 'Review').length;
  const progressPercent = questions.length > 0 ? Math.round((startedCount / questions.length) * 100) : 0;

  // --- Handlers for MULTIPLE CHOICE ---
  const toggleOption = (optId) => {
    if (currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    if (currentQ.type !== 'MULTIPLE CHOICE' && currentQ.type !== 'SIMULATED_UI') return;

    let newAnswers = [...currentQ.userAnswers];
    const isSelected = newAnswers.includes(optId);
    
    if (isSelected) {
      newAnswers = newAnswers.filter(id => id !== optId);
    } else {
      if (newAnswers.length < currentQ.answersRequired) {
        newAnswers.push(optId);
      } else if (currentQ.answersRequired === 1) {
        newAnswers = [optId];
      }
    }
    
    setQuestions(prev => prev.map((q, i) => {
      if (i === currentIndex) {
        return { 
          ...q, 
          userAnswers: newAnswers,
          status: newAnswers.length > 0 ? 'In Progress' : 'Not Started'
        };
      }
      return q;
    }));
  };

  // --- Handlers for INSTRUCTION SET ---
  const handleSelectAnswer = (stmtId, value) => {
    if (currentQ.status === 'Correct' || currentQ.status === 'Review') return;

    const newAnswers = { ...currentQ.userAnswers, [stmtId]: value };
    const answeredCount = Object.keys(newAnswers).length;
    
    setQuestions(prev => prev.map((q, i) => {
      if (i === currentIndex) {
        return {
          ...q,
          userAnswers: newAnswers,
          status: answeredCount > 0 ? 'In Progress' : 'Not Started'
        };
      }
      return q;
    }));
    setOpenDropdownId(null);
  };

  // --- Handlers for MATCHING TASK ---
  const handleSourceClick = (sourceId) => {
    if (currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    if (selectedSourceId === sourceId) {
      setSelectedSourceId(null);
    } else {
      setSelectedSourceId(sourceId);
    }
  };

  const handleTargetClick = (targetId) => {
    if (currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    if (!selectedSourceId) return;

    const newAnswers = { ...currentQ.userAnswers };
    for (const [key, val] of Object.entries(newAnswers)) {
      if (val === selectedSourceId) {
        delete newAnswers[key];
      }
    }
    newAnswers[targetId] = selectedSourceId;
    
    const answeredCount = Object.keys(newAnswers).length;
    setQuestions(prev => prev.map((q, i) => {
      if (i === currentIndex) {
        return {
          ...q,
          userAnswers: newAnswers,
          status: answeredCount > 0 ? 'In Progress' : 'Not Started'
        };
      }
      return q;
    }));
    
    setSelectedSourceId(null);
  };

  const handleDragStart = (e, sourceId) => {
    if (currentQ.status === 'Correct' || currentQ.status === 'Review') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('sourceId', sourceId);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    const sourceId = e.dataTransfer.getData('sourceId');
    if (!sourceId) return;

    const newAnswers = { ...currentQ.userAnswers };
    for (const [key, val] of Object.entries(newAnswers)) {
      if (val === sourceId) {
        delete newAnswers[key];
      }
    }
    newAnswers[targetId] = sourceId;
    
    const answeredCount = Object.keys(newAnswers).length;
    setQuestions(prev => prev.map((q, i) => {
      if (i === currentIndex) {
        return {
          ...q,
          userAnswers: newAnswers,
          status: answeredCount > 0 ? 'In Progress' : 'Not Started'
        };
      }
      return q;
    }));
  };

  const handleClearTarget = (targetId) => {
    if (currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    const newAnswers = { ...currentQ.userAnswers };
    delete newAnswers[targetId];
    
    const answeredCount = Object.keys(newAnswers).length;
    setQuestions(prev => prev.map((q, i) => {
      if (i === currentIndex) {
        return {
          ...q,
          userAnswers: newAnswers,
          status: answeredCount > 0 ? 'In Progress' : 'Not Started'
        };
      }
      return q;
    }));
  };

  // --- Navigation & Submission ---
  const handleNext = async () => {
    setOpenDropdownId(null);
    setMobileSidebar(null);
    setSelectedSourceId(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setAppState('RESULT'); 
      
      const finalCorrectCount = questions.filter(q => q.status === 'Correct').length;
      const finalScore = Math.round((finalCorrectCount / questions.length) * 100);
      let levelNum = 1;
      if (registration.level === '1-Level') levelNum = 1;
      if (registration.level === '2-Level') levelNum = 2;
      if (registration.level === '3-Level') levelNum = 3;
      
      await supabase.from('leaderboard').insert([{
        username: `${registration.firstName} ${registration.lastName}`,
        level_num: levelNum,
        score: finalScore
      }]);
    }
  };

  const handlePrev = () => {
    setOpenDropdownId(null);
    setMobileSidebar(null);
    setSelectedSourceId(null);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const isSubmitReady = currentQ && (
    ((currentQ.type === 'MULTIPLE CHOICE' || currentQ.type === 'SIMULATED_UI') && currentQ.userAnswers.length === currentQ.answersRequired) ||
    (currentQ.type === 'INSTRUCTION SET' && Object.keys(currentQ.userAnswers).length === currentQ.statements.length) ||
    (currentQ.type === 'MATCHING TASK' && Object.keys(currentQ.userAnswers).length === currentQ.targetAreas.length)
  );

  const handleSubmitTask = () => {
    if (isSubmitReady) {
      let isCorrect = false;

      if (currentQ.type === 'MULTIPLE CHOICE' || currentQ.type === 'SIMULATED_UI') {
        isCorrect = 
          currentQ.userAnswers.length === currentQ.correctAnswers.length &&
          currentQ.userAnswers.every(ans => currentQ.correctAnswers.includes(ans));
      } else if (currentQ.type === 'INSTRUCTION SET') {
        isCorrect = currentQ.statements.every(stmt => currentQ.userAnswers[stmt.id] === stmt.correctAnswer);
      } else if (currentQ.type === 'MATCHING TASK') {
        isCorrect = currentQ.targetAreas.every(tgt => currentQ.userAnswers[tgt.id] === tgt.correctAnswer);
      }

      setQuestions(prev => prev.map((q, i) => {
        if (i === currentIndex) {
          return { ...q, status: isCorrect ? 'Correct' : 'Review' };
        }
        return q;
      }));
    }
  };

  const isEvaluated = currentQ && (currentQ.status === 'Correct' || currentQ.status === 'Review');
  const firstUnansweredIndex = questions.findIndex(q => q.status !== 'Correct' && q.status !== 'Review');
  const maxAllowedIndex = firstUnansweredIndex === -1 ? questions.length - 1 : firstUnansweredIndex;

  const handleRestartExam = async () => {
    if (sessionId) {
      await supabase.from('exam_sessions').delete().eq('id', sessionId);
    }
    localStorage.clear();
    window.location.reload();
  };

  const handleStartExam = () => {
    const isFirstNameValid = registration.firstName.trim().length > 0;
    const isLastNameValid = registration.lastName.trim().length > 0;
    const isEmailValid = registration.email.trim().length > 0; // Removed @gmail.com check to allow admin login easier
    const isLevelValid = registration.level !== '';
    
    // Check if Admin
    if (
      registration.firstName === adminCreds.firstName &&
      registration.email === adminCreds.email
    ) {
      setAppState('ADMIN');
      return;
    }

    if (isFirstNameValid && isLastNameValid && isEmailValid && isLevelValid) {
      if (!levelsStatus[registration.level]) {
        setShowInactiveModal(true);
        return;
      }

      const checkRequests = async () => {
        const { data, error } = await supabase
          .from('requests')
          .select('id, status')
          .ilike('email', registration.email)
          .eq('level', registration.level)
          .in('status', ['pending', 'approved']);
          
        if (data && data.length > 0) {
          const approved = data.find(r => r.status === 'approved');
          if (approved) {
            const { data: sessionData } = await supabase
              .from('exam_sessions')
              .select('*')
              .ilike('email', registration.email)
              .order('updated_at', { ascending: false })
              .limit(1);
              
            if (sessionData && sessionData.length > 0 && sessionData[0].app_state !== 'RESULT') {
               setSessionId(sessionData[0].id);
               setQuestions(sessionData[0].questions || []);
               setCurrentIndex(sessionData[0].current_index || 0);
               setAppState(sessionData[0].app_state || 'EXAM');
            } else {
               const { data: newSession } = await supabase
                 .from('exam_sessions')
                 .insert([{ email: registration.email, registration, app_state: 'EXAM' }])
                 .select();
               if (newSession && newSession.length > 0) {
                 setSessionId(newSession[0].id);
               }
               setAppState('EXAM');
            }
            return;
          }
          const pending = data.find(r => r.status === 'pending');
          if (pending) {
            setRequestId(pending.id);
            setAppState('WAITING');
            return;
          }
        }

        const { data: insertData, error: insertError } = await supabase
          .from('requests')
          .insert([{
            firstName: registration.firstName,
            lastName: registration.lastName,
            email: registration.email,
            level: registration.level,
            status: 'pending'
          }])
          .select();
        
        if (insertData && insertData.length > 0) {
          setRequestId(insertData[0].id);
          setAppState('WAITING');
        } else {
          alert('So\'rov yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
        }
      };

      checkRequests();
    } else {
      setRegistrationErrors({ firstName: !isFirstNameValid, lastName: !isLastNameValid, email: !isEmailValid, level: !isLevelValid });
    }
  };

  // --- Render Home Screen ---
  if (appState === 'HOME') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e6ebf0] p-4">
        <div className="w-full max-w-4xl bg-white rounded-sm shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a446b] text-white px-6 py-8 md:px-10 md:py-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
               <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
               </svg>
            </div>
            <div className="relative z-10">
               <div className="text-[12px] font-bold text-[#8baecf] uppercase tracking-widest mb-2">Practice Test / Assessment</div>
               <h1 className="text-3xl md:text-4xl font-bold tracking-wide mb-3">IC3 Digital Literacy Certification</h1>
               <h2 className="text-lg md:text-xl text-blue-100 font-medium">Global Standard 6 (GS6)</h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3 md:p-10">
            <div className="max-w-xl mx-auto mb-6 md:mb-10">
              <div className="border border-gray-200 p-4 md:p-8 rounded-sm bg-white shadow-sm flex flex-col justify-center">
                 <h3 className="text-[11px] md:text-[13px] font-bold text-[#1a446b] uppercase tracking-widest mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                   Registration & Test Setup
                 </h3>
                 <div className="space-y-4">
                   <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Select Test Level</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['1-Level', '2-Level', '3-Level'].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => {
                              setRegistration({...registration, level: lvl});
                              if (registrationErrors.level) setRegistrationErrors({...registrationErrors, level: false});
                            }}
                            className={`border rounded-sm py-2 text-sm font-semibold transition-colors ${registration.level === lvl ? 'border-[#1a446b] bg-[#1a446b] text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                      {registrationErrors.level && <p className="text-[#e11d48] text-[10px] mt-1.5 font-medium">Please select a test level.</p>}
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <div>
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">ISMINGIZNI KIRITING</label>
                       <input 
                         type="text" 
                         value={registration.firstName}
                         onChange={(e) => {
                           setRegistration({...registration, firstName: e.target.value});
                           if (registrationErrors.firstName) setRegistrationErrors({...registrationErrors, firstName: false});
                         }}
                         className={`w-full border ${registrationErrors.firstName ? 'border-[#e11d48]' : 'border-gray-300'} rounded-sm px-2.5 py-1.5 md:px-3 md:py-2.5 text-xs md:text-sm focus:outline-none focus:border-[#1a446b]`} 
                         placeholder="John"
                       />
                       {registrationErrors.firstName && <p className="text-[#e11d48] text-[10px] mt-1.5 font-medium">Required.</p>}
                     </div>
                     <div>
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">FAMILYANGIZNI KIRITING</label>
                       <input 
                         type="text" 
                         value={registration.lastName}
                         onChange={(e) => {
                           setRegistration({...registration, lastName: e.target.value});
                           if (registrationErrors.lastName) setRegistrationErrors({...registrationErrors, lastName: false});
                         }}
                         className={`w-full border ${registrationErrors.lastName ? 'border-[#e11d48]' : 'border-gray-300'} rounded-sm px-2.5 py-1.5 md:px-3 md:py-2.5 text-xs md:text-sm focus:outline-none focus:border-[#1a446b]`} 
                         placeholder="Doe"
                       />
                       {registrationErrors.lastName && <p className="text-[#e11d48] text-[10px] mt-1.5 font-medium">Required.</p>}
                     </div>
                   </div>
                   <div>
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                     <input 
                       type="email" 
                       value={registration.email}
                       onChange={(e) => {
                         setRegistration({...registration, email: e.target.value});
                         if (registrationErrors.email) setRegistrationErrors({...registrationErrors, email: false});
                       }}
                       className={`w-full border ${registrationErrors.email ? 'border-[#e11d48]' : 'border-gray-300'} rounded-sm px-2.5 py-1.5 md:px-3 md:py-2.5 text-xs md:text-sm focus:outline-none focus:border-[#1a446b]`} 
                       placeholder="example@gmail.com"
                     />
                     {registrationErrors.email && <p className="text-[#e11d48] text-[11px] mt-1.5 font-medium">Please enter a valid @gmail.com address.</p>}
                   </div>
                 </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
               <button 
                 onClick={handleStartExam} 
                 className="bg-[#1a446b] text-white px-8 py-3 md:px-12 md:py-4 rounded-sm font-bold tracking-widest text-[13px] md:text-[15px] hover:bg-[#153655] transition-all hover:shadow-lg hover:-translate-y-0.5"
               >
                 START PRACTICE EXAM
               </button>
            </div>
          </div>
        </div>

        {showInactiveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-sm shadow-xl p-6 max-w-sm w-full text-center transform transition-all border-t-4 border-[#e11d48]">
              <div className="w-16 h-16 bg-[#fff1f2] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e11d48]/20">
                <svg className="w-8 h-8 text-[#e11d48]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bu level mavjud emas</h3>
              <p className="text-gray-600 text-[13px] mb-6 leading-relaxed font-medium">
                Hozirgi vaqtda siz tanlagan daraja (level) bo'yicha test o'chirilgan yoki mavjud emas. Iltimos, boshqa levelni tanlang.
              </p>
              <button 
                onClick={() => setShowInactiveModal(false)}
                className="bg-[#e11d48] text-white hover:bg-[#be123c] px-6 py-2.5 rounded-sm font-semibold w-full transition-colors tracking-wide text-sm"
              >
                TUSHUNARLI
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Render Waiting Screen ---
  if (appState === 'WAITING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e6ebf0] p-4">
        <div className="bg-white p-10 rounded-sm shadow-md text-center max-w-md w-full border-t-4 border-[#1a446b]">
           <svg className="w-16 h-16 text-[#1a446b] mx-auto mb-6 animate-spin" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           <h2 className="text-2xl font-bold text-[#1a446b] mb-4">Sizning so'rovingiz yuborildi</h2>
           <p className="text-gray-600 font-medium leading-relaxed">
              <strong className="text-[#1a446b]">{registration.level}</strong> uchun ruxsat so'rovi adminga jo'natildi.
           </p>
           <p className="text-sm text-gray-400 mt-6 bg-gray-50 py-2 rounded-sm border border-gray-100 mb-6">Iltimos, tasdiqlanishini kuting. Sahifani yangilamang.</p>
           <button 
             onClick={() => setAppState('HOME')} 
             className="bg-transparent border border-[#1a446b] text-[#1a446b] px-6 py-2 rounded-sm font-semibold hover:bg-blue-50 transition-colors w-full"
           >
             Bosh sahifaga qaytish
           </button>
        </div>
      </div>
    );
  }

  // --- Render Admin Panel ---
  if (appState === 'ADMIN') {
    return (
      <AdminPanel 
        setAppState={setAppState} 
        registration={registration} 
        setRegistration={setRegistration} 
        requests={requests} 
        setRequests={setRequests} 
        levelsStatus={levelsStatus} 
        setLevelsStatus={setLevelsStatus} 
        adminCreds={adminCreds} 
        setAdminCreds={setAdminCreds} 
      />
    );
  }

  // --- Render Result Screen ---
  if (appState === 'RESULT') {
    const score = Math.round((correctCount / questions.length) * 100);
    const reviewed = questions.length - correctCount;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e6ebf0] p-4">
        <div className="w-full max-w-4xl bg-white rounded-sm shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a446b] text-white px-8 py-6">
            <div className="text-[11px] font-bold text-[#8baecf] uppercase tracking-widest mb-1.5">Exam Summary</div>
            <h1 className="text-[26px] font-semibold tracking-wide">IC3 Test Results</h1>
          </div>
          
          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
              {/* Score Box */}
              <div className="border border-gray-200 rounded-sm p-6">
                <div className="text-[11px] font-bold text-[#6f93b5] uppercase tracking-widest mb-4">Score</div>
                <div className="text-5xl font-bold text-[#1a446b]">{score}%</div>
              </div>
              
              {/* Correct Tasks Box */}
              <div className="border border-gray-200 rounded-sm p-6">
                <div className="text-[11px] font-bold text-[#6f93b5] uppercase tracking-widest mb-4">Correct Tasks</div>
                <div className="text-5xl font-bold text-[#047857]">{correctCount}</div>
              </div>

              {/* Reviewed Tasks Box */}
              <div className="border border-gray-200 rounded-sm p-6">
                <div className="text-[11px] font-bold text-[#6f93b5] uppercase tracking-widest mb-4">Reviewed Tasks</div>
                <div className="text-5xl font-bold text-[#e11d48]">{reviewed}</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-sm p-5 mb-8 bg-gray-50/30">
              <p className="text-[15px] text-gray-700 font-medium">You answered {correctCount} out of {questions.length} tasks correctly.</p>
            </div>

            <button onClick={handleRestartExam} className="bg-[#1a446b] text-white px-8 py-3.5 rounded-sm font-semibold tracking-wide hover:bg-[#153655] transition-colors text-sm">
              RESTART EXAM
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Main Exam Screen ---
  return (
    <div className="min-h-screen flex flex-col font-sans select-none selection:bg-[#1a446b] selection:text-white" onClick={(e) => {
      if (!e.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    }}>
      {/* Header */}
      <header className="min-h-[60px] py-3 md:py-0 bg-[#1a446b] text-white flex flex-col md:flex-row justify-between items-center px-4 md:px-6 flex-shrink-0 gap-3 md:gap-0">
        <div className="text-center md:text-left">
          <div className="text-[10px] text-[#8baecf] font-bold tracking-widest uppercase mb-[2px]">Testing Workspace</div>
          <h1 className="text-[15px] md:text-[17px] font-semibold tracking-wide">IC3 Test Session {registration.level ? `- ${registration.level}` : ''}</h1>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          <div className="bg-[#153655] rounded-sm px-4 py-1.5 border border-[#1a446b] flex flex-col items-center">
            <div className="text-[#8baecf] text-[9px] font-bold tracking-widest uppercase mb-[2px]">Current Task</div>
            <div className="text-[13px] font-semibold tracking-wide">Question {currentIndex + 1} of {questions.length}</div>
          </div>
          <div className="bg-[#153655] rounded-sm px-4 py-1.5 border border-[#1a446b] flex flex-col items-center">
            <div className="text-[#8baecf] text-[9px] font-bold tracking-widest uppercase mb-[2px]">Completed</div>
            <div className="text-[13px] font-semibold tracking-wide">{correctCount + reviewCount} / {questions.length}</div>
          </div>
          <button onClick={() => setAppState('HOME')} className="text-[#8baecf] hover:text-white flex items-center gap-1.5 bg-transparent px-3 py-[6px] rounded-sm font-semibold hover:bg-white/10 transition-colors text-sm ml-2" title="Bosh sahifaga qaytish">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Home
          </button>
          <button onClick={handleRestartExam} className="border border-white text-white bg-transparent px-4 py-[6px] rounded-sm font-semibold hover:bg-white/10 transition-colors text-sm ml-2">
            Restart Exam
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden flex bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm flex-shrink-0">
        <button 
          onClick={() => setMobileSidebar(mobileSidebar === 'nav' ? null : 'nav')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider flex justify-center items-center gap-2 transition-colors ${mobileSidebar === 'nav' ? 'text-[#1a446b] border-b-2 border-[#1a446b] bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          Navigatsiya
        </button>
        <div className="w-px bg-gray-200"></div>
        <button 
          onClick={() => setMobileSidebar(mobileSidebar === 'instructions' ? null : 'instructions')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider flex justify-center items-center gap-2 transition-colors ${mobileSidebar === 'instructions' ? 'text-[#1a446b] border-b-2 border-[#1a446b] bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Yo'riqnoma
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-2 sm:p-4 flex flex-col lg:flex-row gap-4 overflow-y-auto lg:overflow-hidden">
        
        {/* Left Sidebar - Task Navigation */}
        <aside className={`w-full lg:w-[280px] bg-white border border-gray-200 rounded-sm shadow-sm flex-col flex-shrink-0 lg:overflow-hidden ${mobileSidebar === 'nav' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-[10px] font-bold text-[#6f93b5] uppercase tracking-widest">Task Navigation</h3>
          </div>
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 font-medium mb-2">
              <span>Session progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#e6ebf0] rounded-none h-[3px]">
              <div className="bg-[#1a446b] h-[3px] rounded-none transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-5 gap-[6px]">
              {questions.map((q, idx) => {
                let statusClass = '';
                if (idx === currentIndex) {
                  statusClass = 'current';
                } else if (q.status === 'Correct') {
                  statusClass = 'border-[#059669] text-[#059669] bg-white font-bold';
                } else if (q.status === 'Review') {
                  statusClass = 'border-[#e11d48] text-[#e11d48] bg-white font-bold';
                } else if (q.status === 'In Progress') {
                  statusClass = 'border-[#ffc107] text-[#ffc107] bg-white';
                }

                return (
                  <button 
                    key={q.id} 
                    onClick={() => {
                      setCurrentIndex(idx);
                      setOpenDropdownId(null);
                      setMobileSidebar(null);
                      setSelectedSourceId(null);
                    }}
                    disabled={idx > maxAllowedIndex}
                    className={`grid-btn ${statusClass} ${idx > maxAllowedIndex ? 'opacity-50 cursor-not-allowed hover:bg-white text-gray-300' : ''}`}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-100 bg-[#f8f9fb]">
            <div className="space-y-1.5 mb-5 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-gray-500">Started</span>
                <span className="text-[#1a446b] font-semibold">{startedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Correct</span>
                <span className="text-[#059669] font-semibold">{correctCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Review</span>
                <span className="text-[#e11d48] font-semibold">{reviewCount}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-[6px] text-[9px] font-bold text-center tracking-widest">
              <div className="border border-gray-200 text-gray-400 uppercase py-1.5 rounded-sm bg-white">Pending</div>
              <div className="border border-[#ffc107] text-[#ffc107] uppercase py-1.5 rounded-sm bg-white">Progress</div>
              <div className="border border-[#059669] text-[#059669] uppercase py-1.5 rounded-sm bg-white">Correct</div>
              <div className="border border-[#e11d48] text-[#e11d48] uppercase py-1.5 rounded-sm bg-white">Review</div>
            </div>
          </div>
        </aside>

        {/* Center Workspace */}
        <section className={`flex-1 flex flex-col gap-4 min-w-0 ${mobileSidebar !== null ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
             <div>
                <div className="text-[10px] font-bold text-[#6f93b5] uppercase tracking-widest mb-1">Exam Workspace</div>
                <h2 className="text-lg font-semibold text-gray-800">Question {currentQ.id}</h2>
             </div>
             <div className="flex gap-3">
                <span className="badge-outline multiple-choice">
                  {currentQ.type} {currentQ.type === 'MULTIPLE CHOICE' && `(${currentQ.answersRequired})`}
                </span>
                <span className={`badge-outline uppercase ${
                  currentQ.status === 'Correct' ? 'border-[#059669] text-[#059669] bg-[#ecfdf5]' :
                  currentQ.status === 'Review' ? 'border-[#e11d48] text-[#e11d48] bg-[#fff1f2]' : 
                  currentQ.status === 'In Progress' ? 'border-[#ffc107] text-[#ffc107] bg-[#fffbeb]' : 'not-started'
                }`}>
                  {currentQ.status === 'In Progress' ? 'IN PROGRESS' : 
                   currentQ.status === 'Correct' ? 'ACCEPTED' : 
                   currentQ.status === 'Review' ? 'NEEDS REVIEW' : 'NOT STARTED'}
                </span>
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 flex-1 flex flex-col overflow-y-auto">
             <div className="bg-[#f5f8fa] p-5 rounded-sm border border-gray-200 mb-6">
                <div className="text-[10px] font-bold text-[#6f93b5] uppercase tracking-widest mb-3">Task Prompt</div>
                <p className="text-[15px] text-gray-800 font-medium leading-relaxed">{currentQ.prompt}</p>
             </div>

             <div className="w-full flex-1">
               {currentQ.type === 'MULTIPLE CHOICE' && currentQ.options.map(opt => {
                 const isSelected = currentQ.userAnswers.includes(opt.id);
                 const isCorrectAnswer = currentQ.correctAnswers.includes(opt.id);
                 
                 let boxClass = 'border-gray-200 bg-white hover:border-[#1a446b]/50 hover:bg-gray-50';
                 let letterClass = 'border-gray-300 text-gray-500 bg-white';
                 let textClass = 'text-gray-700';
                 let showCorrectLabel = false;

                 if (isEvaluated) {
                    if (isCorrectAnswer) {
                       boxClass = 'border-[#059669] bg-[#ecfdf5] ring-1 ring-[#059669]/50 shadow-sm';
                       textClass = 'text-[#065f46] font-semibold';
                       showCorrectLabel = true;
                       if (isSelected) {
                         letterClass = 'border-[#059669] bg-[#059669] text-white shadow-sm font-bold';
                       } else {
                         letterClass = 'border-[#059669] text-[#059669] bg-white font-bold';
                       }
                    } else if (isSelected && !isCorrectAnswer) {
                       boxClass = 'border-[#e11d48] bg-[#fff1f2] ring-1 ring-[#e11d48]/50 shadow-sm';
                       textClass = 'text-[#9f1239] font-semibold';
                       letterClass = 'border-[#e11d48] bg-[#e11d48] text-white shadow-sm font-bold';
                    } else {
                       boxClass = 'border-gray-300 bg-gray-100 opacity-60';
                       textClass = 'text-gray-500';
                       letterClass = 'border-gray-300 text-gray-400 bg-white';
                    }
                 } else if (isSelected) {
                    boxClass = 'border-[#1a446b] bg-[#f8fbff] ring-1 ring-[#1a446b] shadow-md transform translate-x-1';
                    letterClass = 'border-[#1a446b] bg-[#1a446b] text-white shadow-sm font-bold scale-105';
                    textClass = 'text-[#1a446b] font-semibold';
                 }

                 return (
                   <div 
                    key={opt.id} 
                    className={`w-full text-left px-5 py-4 border rounded-lg mb-3 flex items-start gap-4 transition-all duration-300 ease-in-out ${!isEvaluated ? 'cursor-pointer hover:shadow-md' : ''} ${boxClass}`}
                    onClick={() => toggleOption(opt.id)}
                   >
                     <div className={`w-8 h-8 rounded-md border flex items-center justify-center text-sm flex-shrink-0 mt-0.5 transition-all duration-300 ${letterClass}`}>
                        {opt.id}
                     </div>
                     <div className="flex flex-col justify-center min-h-[32px]">
                        <div className={`text-[15px] transition-colors duration-300 leading-snug ${textClass}`}>{opt.text}</div>
                        {showCorrectLabel && (
                           <div className="text-[11px] font-bold text-[#059669] uppercase tracking-widest mt-1.5 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              Correct Answer
                           </div>
                        )}
                     </div>
                   </div>
                 );
               })}

               {/* 2. INSTRUCTION SET */}
               {currentQ.type === 'INSTRUCTION SET' && currentQ.statements.map((stmt, idx) => {
                 const selectedVal = currentQ.userAnswers[stmt.id];
                 const isCorrectAnswer = selectedVal === stmt.correctAnswer;
                 const isOpen = openDropdownId === stmt.id;
                 
                 let boxBorder = 'border-gray-200';
                 if (isEvaluated) {
                   boxBorder = isCorrectAnswer ? 'border-[#059669] bg-[#ecfdf5] ring-1 ring-[#059669]/30' : 'border-[#e11d48] bg-[#fff1f2] ring-1 ring-[#e11d48]/30';
                 }

                 return (
                   <div key={stmt.id} className={`bg-white border rounded-sm mb-4 transition-colors ${boxBorder}`}>
                     <div className="px-5 py-4">
                       <div className="text-[10px] font-bold text-[#6f93b5] uppercase tracking-widest mb-2">Statement {idx + 1}</div>
                       <div className="text-[13px] text-gray-800 font-medium mb-4">{stmt.text}</div>
                       
                         <div className="relative dropdown-container">
                         <div 
                           onClick={() => !isEvaluated && setOpenDropdownId(isOpen ? null : stmt.id)} 
                           className={`w-full border rounded-md p-3.5 flex justify-between items-center transition-all duration-200 ${isEvaluated ? 'bg-white/50 cursor-default' : 'bg-white cursor-pointer hover:border-[#1a446b]/60 hover:shadow-sm'} ${isOpen ? 'border-[#1a446b] ring-2 ring-[#1a446b]/10 shadow-sm' : 'border-gray-300'}`}
                         >
                           <span className={selectedVal ? "text-[#1a446b] text-[14px] font-semibold" : "text-gray-400 text-[14px]"}>
                             {selectedVal || "Select an answer"}
                           </span>
                           <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1a446b]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                         </div>
                         
                         {isOpen && !isEvaluated && (
                           <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-xl z-10 overflow-hidden transform origin-top transition-all">
                             {stmt.options.map(opt => (
                               <div 
                                 key={opt}
                                 onClick={() => handleSelectAnswer(stmt.id, opt)} 
                                 className={`p-3.5 border-b border-gray-50 last:border-0 hover:bg-[#f8fbff] flex items-center gap-3 cursor-pointer transition-colors ${selectedVal === opt ? 'bg-blue-50/30' : ''}`}
                               >
                                 <div className={`w-4 h-4 border rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${selectedVal === opt ? 'border-[#1a446b] bg-[#1a446b]' : 'border-gray-300 bg-white'}`}>
                                   {selectedVal === opt && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                 </div>
                                 <span className={`text-[14px] ${selectedVal === opt ? 'text-[#1a446b] font-semibold' : 'text-gray-700 font-medium'}`}>{opt}</span>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>

                       {isEvaluated && (
                         <div className={`text-[11px] font-bold uppercase tracking-widest mt-3 flex items-center gap-1.5 ${isCorrectAnswer ? 'text-[#059669]' : 'text-[#e11d48]'}`}>
                           {isCorrectAnswer ? (
                             <>
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                               Correct Answer
                             </>
                           ) : (
                             <>
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                               Incorrect (Correct is: {stmt.correctAnswer})
                             </>
                           )}
                         </div>
                       )}
                     </div>
                   </div>
                 );
               })}

               {/* 3. MATCHING TASK */}
               {currentQ.type === 'MATCHING TASK' && (
                 <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mt-4 h-full">
                   {/* Left Column - Source Items */}
                   <div className="flex-1 border border-gray-200 rounded-sm p-5 flex flex-col">
                     <div className="text-[10px] font-bold text-[#6f93b5] uppercase tracking-widest mb-4">Source Items</div>
                     <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                       {currentQ.sourceItems.map(src => {
                          const placedTargetId = Object.keys(currentQ.userAnswers).find(tId => currentQ.userAnswers[tId] === src.id);
                          const placedTarget = placedTargetId ? currentQ.targetAreas.find(t => t.id === placedTargetId) : null;
                          
                          return (
                            <div 
                              key={src.id}
                              draggable={!isEvaluated}
                              onDragStart={(e) => handleDragStart(e, src.id)}
                              onClick={() => handleSourceClick(src.id)}
                              className={`border border-gray-200 rounded-md p-4 bg-white transition-all duration-200 ${!isEvaluated ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-[#1a446b]/40 hover:-translate-y-0.5' : ''} ${placedTarget ? 'opacity-50 scale-95' : ''} ${selectedSourceId === src.id ? 'ring-2 ring-[#1a446b] border-[#1a446b] bg-blue-50/20 transform scale-[1.02]' : ''}`}
                            >
                              <div className="text-[13px] text-gray-800 font-medium">{src.text}</div>
                              {placedTarget && (
                                <div className="text-[10px] font-bold text-[#1a446b] uppercase tracking-widest mt-2">
                                  Placed in: {placedTarget.label}
                                </div>
                              )}
                            </div>
                          );
                       })}
                     </div>
                   </div>

                   {/* Right Column - Target Areas */}
                   <div className="flex-1 border border-gray-200 rounded-sm p-5 flex flex-col">
                     <div className="text-[10px] font-bold text-[#6f93b5] uppercase tracking-widest mb-4">Target Areas</div>
                     <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                       {currentQ.targetAreas.map(tgt => {
                          const placedSourceId = currentQ.userAnswers[tgt.id];
                          const placedSource = placedSourceId ? currentQ.sourceItems.find(s => s.id === placedSourceId) : null;
                          
                          const isCorrectAnswer = isEvaluated && placedSourceId === tgt.correctAnswer;
                          const isWrongAnswer = isEvaluated && placedSourceId && placedSourceId !== tgt.correctAnswer;

                          let dropZoneClass = 'border-dashed border-gray-300 text-gray-400 bg-gray-50/50 hover:border-[#1a446b]/40 hover:bg-[#f8fbff]';
                          if (placedSource) {
                            dropZoneClass = 'border-solid border-[#1a446b]/30 bg-[#f8fbff] ring-1 ring-[#1a446b]/10 shadow-sm';
                          }
                          if (isEvaluated) {
                            if (isCorrectAnswer) {
                              dropZoneClass = 'border-solid border-[#059669] bg-[#ecfdf5] ring-1 ring-[#059669]/50 shadow-sm';
                            } else if (isWrongAnswer) {
                              dropZoneClass = 'border-solid border-[#e11d48] bg-[#fff1f2] ring-1 ring-[#e11d48]/50 shadow-sm';
                            } else {
                              dropZoneClass = 'border-solid border-gray-300 bg-gray-100 opacity-60';
                            }
                          }

                          return (
                            <div key={tgt.id} className="mb-4 group">
                              <div className="text-[10px] font-bold text-[#6f93b5] uppercase tracking-widest mb-2">{tgt.label}</div>
                              <div 
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDrop={(e) => handleDrop(e, tgt.id)}
                                onClick={() => handleTargetClick(tgt.id)}
                                className={`border rounded-md p-4 transition-all duration-300 min-h-[76px] flex flex-col justify-center ${dropZoneClass} ${selectedSourceId && !isEvaluated ? 'cursor-pointer hover:ring-2 hover:ring-[#1a446b]/50' : ''}`}
                              >
                                {!placedSource ? (
                                  <div className="text-[13px]">{isEvaluated ? "No item placed" : "Drop an item here"}</div>
                                ) : (
                                  <div className="flex justify-between items-center w-full">
                                    <div className={`text-[14px] font-medium ${isCorrectAnswer ? 'text-[#065f46]' : isWrongAnswer ? 'text-[#9f1239]' : 'text-[#1a446b]'}`}>
                                      {placedSource.text}
                                    </div>
                                    {!isEvaluated && (
                                      <button 
                                        onClick={() => handleClearTarget(tgt.id)}
                                        className="border border-[#1a446b]/20 text-[#1a446b] bg-white rounded flex items-center justify-center p-1.5 hover:bg-[#1a446b] hover:text-white transition-colors"
                                        title="Clear"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                )}
                                {isEvaluated && isCorrectAnswer && (
                                  <div className="text-[11px] font-bold text-[#059669] uppercase tracking-widest mt-2 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    Correct Answer
                                  </div>
                                )}
                                {isEvaluated && isWrongAnswer && (
                                  <div className="text-[11px] font-bold text-[#e11d48] uppercase tracking-widest mt-2 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Incorrect (Correct is: {currentQ.sourceItems.find(s => s.id === tgt.correctAnswer)?.text})
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                       })}
                     </div>
                   </div>
                 </div>
               )}

               {/* 4. SIMULATED UI */}
               {currentQ.type === 'SIMULATED_UI' && (
                 <div className="border border-gray-300 rounded-lg shadow-xl overflow-hidden bg-white mt-4 flex flex-col relative max-w-full">
                    {/* Browser Header */}
                    <div className="bg-[#e6ebf0] border-b border-gray-300 px-4 py-2 flex items-center gap-4 select-none">
                       <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500"></div>
                       </div>
                       <div className="flex-1 bg-white rounded-md border border-gray-300 px-3 py-1 text-[11px] text-gray-500 flex items-center gap-2 shadow-inner">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                          https://simulated-environment.local
                       </div>
                    </div>
                    
                    {/* Browser Content */}
                    <div className="p-8 min-h-[300px] flex flex-col items-center justify-center bg-gray-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')]">
                       <div className="max-w-2xl w-full text-center mb-8">
                          <div className="text-2xl font-bold text-[#1a446b] mb-4 tracking-tight">Interactive Simulation</div>
                          <p className="text-gray-500 text-sm">Select the correct interface element below to accomplish the task described in the prompt.</p>
                       </div>
                       
                       <div className="flex flex-wrap gap-4 justify-center">
                         {currentQ.options.map(opt => {
                           const isSelected = currentQ.userAnswers.includes(opt.id);
                           const isCorrectAnswer = currentQ.correctAnswers.includes(opt.id);
                           
                           const mainText = opt.text.split('(')[0].trim();
                           const subText = opt.text.includes('(') ? opt.text.substring(opt.text.indexOf('(') + 1, opt.text.lastIndexOf(')')) : '';

                           let btnClass = 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400';
                           let icon = null;

                           if (isEvaluated) {
                             if (isCorrectAnswer) {
                               btnClass = 'border-[#059669] bg-[#ecfdf5] text-[#065f46] ring-2 ring-[#059669] shadow-sm';
                               icon = <svg className="w-5 h-5 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
                             } else if (isSelected && !isCorrectAnswer) {
                               btnClass = 'border-[#e11d48] bg-[#fff1f2] text-[#9f1239] ring-2 ring-[#e11d48] shadow-sm';
                               icon = <svg className="w-5 h-5 text-[#e11d48]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>;
                             } else {
                               btnClass = 'border-gray-200 bg-gray-50 text-gray-400 opacity-60';
                             }
                           } else if (isSelected) {
                             btnClass = 'border-[#1a446b] bg-[#1a446b] text-white ring-2 ring-offset-2 ring-[#1a446b] shadow-lg transform scale-[1.02]';
                           }

                           return (
                             <button 
                               key={opt.id}
                               onClick={() => toggleOption(opt.id)}
                               disabled={isEvaluated}
                               className={`flex flex-col items-center justify-center p-5 rounded-lg border-2 transition-all duration-300 max-w-[280px] min-w-[200px] ${btnClass}`}
                             >
                               <div className="flex items-center justify-center gap-2 mb-2 w-full">
                                 {icon}
                                 <span className="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">{mainText || opt.text}</span>
                               </div>
                               {subText && (
                                 <span className={`text-[11px] text-center leading-relaxed ${isSelected && !isEvaluated ? 'text-blue-100' : 'text-gray-500'}`}>{subText}</span>
                               )}
                             </button>
                           );
                         })}
                       </div>
                    </div>
                 </div>
               )}

             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center min-h-[76px] gap-4 md:gap-0 mt-auto">
             {isEvaluated ? (
                <span className="text-[12px] md:text-[13px] text-gray-600 font-medium md:w-1/2 text-center md:text-left">
                   Task submitted. Review the highlighted response before moving on.
                </span>
             ) : (
                <span className="text-[12px] md:text-[13px] text-gray-500 font-medium text-center md:text-left">
                   Answer the task and use Submit Task when ready.
                </span>
             )}
             
             <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                <button className="action-btn" onClick={handlePrev} disabled={currentIndex === 0}>PREVIOUS</button>
                
                {!isEvaluated ? (
                   <button className="action-btn" onClick={handleSubmitTask} disabled={!isSubmitReady}>
                      SUBMIT TASK
                   </button>
                ) : (
                   <button className={`action-btn evaluated ${currentQ.status === 'Correct' ? 'correct' : 'review'}`} disabled>
                      {currentQ.status === 'Correct' ? 'ACCEPTED' : 'REVIEW NEEDED'}
                   </button>
                )}

                <button className="action-btn" onClick={handleNext} disabled={!isEvaluated}>
                   {currentIndex === questions.length - 1 ? 'FINISH EXAM' : 'NEXT TASK'}
                </button>
             </div>
          </div>
        </section>

        {/* Right Sidebar - Instructions & Review */}
        <aside className={`w-full lg:w-[300px] flex-col gap-4 flex-shrink-0 ${mobileSidebar === 'instructions' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex gap-2 h-[42px]">
            <button 
              onClick={() => setActiveTab('INSTRUCTIONS')}
              className={`flex-1 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === 'INSTRUCTIONS' ? 'bg-[#1a446b] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
            >
              INSTRUCTIONS
            </button>
            <button 
              onClick={() => setActiveTab('REVIEW')}
              className={`flex-1 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === 'REVIEW' ? 'bg-[#1a446b] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
            >
              REVIEW
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex-1 p-0 flex flex-col overflow-hidden">
            {activeTab === 'INSTRUCTIONS' ? (
              <div className="p-6 space-y-6 overflow-y-auto h-full">
                <div>
                   <div className="rs-title">Overview</div>
                   <div className="w-full h-px bg-gray-100 mb-3"></div>
                   <p className="text-[13px] text-gray-600 leading-relaxed font-medium">Work only on the current task. Submit the task before moving to the next one.</p>
                </div>
                
                <div>
                   <div className="rs-title">Location</div>
                   <div className="w-full h-px bg-gray-100 mb-3"></div>
                   <p className="text-[13px] text-gray-600 leading-relaxed font-medium">You are currently on question {currentQ.id} of {questions.length}.</p>
                </div>

                <div>
                   <div className="rs-title">Requirement</div>
                   <div className="w-full h-px bg-gray-100 mb-3"></div>
                   <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                     {currentQ.type === 'MULTIPLE CHOICE' 
                       ? `Select exactly ${currentQ.answersRequired} answers, then submit the task.`
                       : currentQ.type === 'MATCHING TASK'
                       ? `Match all source items to their correct target areas, then submit.`
                       : `Select an answer for all statements, then submit the task.`}
                   </p>
                </div>

                <div>
                   <div className="rs-title">Session Status</div>
                   <div className="w-full h-px bg-gray-100 mb-3"></div>
                   <div className="space-y-2 mt-3 text-[13px] font-medium">
                     <div className="flex justify-between text-gray-500">
                        <span>Current status</span>
                        <span className={`font-semibold uppercase text-[10px] tracking-wider ${
                          currentQ.status === 'Correct' ? 'text-[#059669]' :
                          currentQ.status === 'Review' ? 'text-[#e11d48]' : 
                          currentQ.status === 'In Progress' ? 'text-[#ffc107]' : 'text-gray-500'
                        }`}>{currentQ.status === 'Correct' ? 'ACCEPTED' : currentQ.status === 'Review' ? 'NEEDS REVIEW' : currentQ.status}</span>
                     </div>
                     <div className="flex justify-between text-gray-500">
                        <span>Submitted tasks</span>
                        <span className="text-gray-800">{correctCount + reviewCount}</span>
                     </div>
                     <div className="flex justify-between text-gray-500">
                        <span>Correct tasks</span>
                        <span className="text-[#059669] font-semibold">{correctCount}</span>
                     </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-100">
                   <div className="rs-title mb-0">Task Review</div>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-2">
                  {questions.map((q, idx) => (
                    <div 
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`flex justify-between items-center p-3 border rounded-sm cursor-pointer transition-colors ${idx === currentIndex ? 'border-[#1a446b] bg-blue-50/10' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <span className="text-[13px] font-medium text-[#333333]">Question {q.id}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        q.status === 'Correct' ? 'text-[#059669]' :
                        q.status === 'Review' ? 'text-[#e11d48]' : 'text-gray-400'
                      }`}>
                        {q.status === 'Correct' ? 'ACCEPTED' : 
                         q.status === 'Review' ? 'NEEDS REVIEW' : 'NOT STARTED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

      </main>
    </div>
  );
}

export default App;
