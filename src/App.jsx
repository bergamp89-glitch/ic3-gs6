import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import AdminPanel from './AdminPanel';
import HomePage from './components/HomePage';
import WaitingPage from './components/WaitingPage';
import ResultPage from './components/ResultPage';
import QuestionMultipleChoice from './components/QuestionMultipleChoice';
import QuestionInstructionSet from './components/QuestionInstructionSet';
import QuestionMatchingTask from './components/QuestionMatchingTask';
import QuestionSimulatedUI from './components/QuestionSimulatedUI';
import { examQuestions as q1 } from './1-level.js';
import { examQuestions as q2 } from './2-level.js';
import { examQuestions as q3 } from './3-level.js';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('INSTRUCTIONS'); 
  const [openDropdownId, setOpenDropdownId] = useState(null); 
  const [appState, setAppState] = useState('HOME'); // 'HOME', 'WAITING', 'ADMIN', 'EXAM', 'RESULT'
  const [registration, setRegistration] = useState({ firstName: '', lastName: '', birthDate: '', email: '', level: '' });
  
  const [registrationErrors, setRegistrationErrors] = useState({ firstName: false, lastName: false, birthDate: false, email: false, level: false });
  const [requestId, setRequestId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [adminCreds, setAdminCreds] = useState({ firstName: 'admin', email: '0807' });
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(null);
  const [selectedSourceId, setSelectedSourceId] = useState(null);

  // Restore local session on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ic3_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.appState && parsed.appState !== 'HOME' && parsed.appState !== 'ADMIN') {
          setAppState(parsed.appState);
          if (parsed.sessionId) setSessionId(parsed.sessionId);
          if (parsed.requestId) setRequestId(parsed.requestId);
          if (parsed.questions && parsed.questions.length > 0) setQuestions(parsed.questions);
          if (parsed.currentIndex !== undefined) setCurrentIndex(parsed.currentIndex);
          if (parsed.registration) setRegistration(parsed.registration);
        }
      }
    } catch (e) {
      console.error("Session restore failed:", e);
    }
  }, []);

  // Save session to localStorage on active state change
  useEffect(() => {
    if (appState === 'EXAM' || appState === 'WAITING') {
      localStorage.setItem('ic3_session', JSON.stringify({
        sessionId,
        requestId,
        appState,
        questions,
        currentIndex,
        registration
      }));
    } else if (appState === 'HOME' || appState === 'ADMIN' || appState === 'RESULT') {
      localStorage.removeItem('ic3_session');
    }
  }, [appState, sessionId, requestId, questions, currentIndex, registration]);

  // Anti-cheat protection — faqat EXAM holatida ishlaydi
  useEffect(() => {
    if (appState !== 'EXAM') return;

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
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        if (navigator.clipboard) navigator.clipboard.writeText('');
      }
      // Mac screenshot shortcuts
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    const handleCopy = (e) => {
      e.preventDefault();
      if (e.clipboardData) e.clipboardData.setData('text/plain', '');
    };

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

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.body.style.filter = 'none';
    };
  }, [appState]);

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
      localStorage.removeItem('ic3_session');
      setQuestions([]);
      setCurrentIndex(0);
      setSessionId(null);
      setRequestId(null);
    }
  }, [appState]);

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
    async function loadQuestions() {
      if (appState === 'EXAM' && questions.length === 0) {
        let levelNum = 1;
        if (registration.level === '1-Level') levelNum = 1;
        if (registration.level === '2-Level') levelNum = 2;
        if (registration.level === '3-Level') levelNum = 3;

        let rawQuestions = [];

        // Avval bazadan yuklashga urinib ko'ramiz, agar bo'lmasa lokal fayldan olamiz
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('level_num', levelNum)
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          rawQuestions = data.map(dbQ => ({ id: dbQ.id, prompt: dbQ.prompt, type: dbQ.type, ...dbQ.data }));
        } else {
          // Bazada mavjud emas — lokal fayldan yuklaymiz
          if (levelNum === 1) rawQuestions = q1;
          else if (levelNum === 2) rawQuestions = q2;
          else rawQuestions = q3;
        }

        const shuffleArray = (arr) => {
          if (!Array.isArray(arr)) return arr;
          const clone = [...arr];
          for (let i = clone.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [clone[i], clone[j]] = [clone[j], clone[i]];
          }
          return clone;
        };

        const initial = rawQuestions.map((q, idx) => {
          let normalizedQ = JSON.parse(JSON.stringify(q));
          normalizedQ.id = idx + 1;
          
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

              const shuffledOptions = shuffleArray(normalizedQ.options);
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
              correctAnswer: opt.answer || opt.correctAnswer
            }));
          }

          if (normalizedQ.options && Array.isArray(normalizedQ.options)) {
            normalizedQ.options = shuffleArray(normalizedQ.options);
          }

          if (normalizedQ.statements && Array.isArray(normalizedQ.statements)) {
            normalizedQ.statements = shuffleArray(normalizedQ.statements);
          }

          if (normalizedQ.sourceItems && Array.isArray(normalizedQ.sourceItems)) {
            normalizedQ.sourceItems = shuffleArray(normalizedQ.sourceItems);
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
        const { data } = await supabase
          .from('requests')
          .select('status')
          .eq('id', requestId)
          .single();
          
        if (data) {
          if (data.status === 'approved') {
            clearInterval(intervalId);
            setQuestions([]);
            setCurrentIndex(0);
            const { data: newSession } = await supabase
              .from('exam_sessions')
              .insert([{ email: (registration.email || '').trim().toLowerCase(), registration, app_state: 'EXAM' }])
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

  if (appState === 'EXAM' && questions.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6ebf0] font-semibold text-[#1a446b]">
      <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-sm shadow-md">
        <svg className="w-6 h-6 animate-spin text-[#1a446b]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading Exam Workspace...
      </div>
    </div>
  );

  const currentQ = questions[currentIndex] || null;
  
  const startedCount = questions.filter(q => q.status !== 'Not Started').length;
  const correctCount = questions.filter(q => q.status === 'Correct').length;
  const reviewCount = questions.filter(q => q.status === 'Review').length;
  const progressPercent = questions.length > 0 ? Math.round((startedCount / questions.length) * 100) : 0;

  // --- Handlers for MULTIPLE CHOICE ---
  const toggleOption = (optId) => {
    if (!currentQ || currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    if (currentQ.type !== 'MULTIPLE CHOICE' && currentQ.type !== 'SIMULATED_UI') return;

    let newAnswers = [...(currentQ.userAnswers || [])];
    const isSelected = newAnswers.includes(optId);
    const requiredCount = currentQ.answersRequired || 1;
    
    if (isSelected) {
      newAnswers = newAnswers.filter(id => id !== optId);
    } else {
      if (newAnswers.length < requiredCount) {
        newAnswers.push(optId);
      } else if (requiredCount === 1) {
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
    if (!currentQ || currentQ.status === 'Correct' || currentQ.status === 'Review') return;

    const newAnswers = { ...(currentQ.userAnswers || {}), [stmtId]: value };
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
    if (!currentQ || currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    if (selectedSourceId === sourceId) {
      setSelectedSourceId(null);
    } else {
      setSelectedSourceId(sourceId);
    }
  };

  const handleTargetClick = (targetId) => {
    if (!currentQ || currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    if (!selectedSourceId) return;

    const newAnswers = { ...(currentQ.userAnswers || {}) };
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
    if (!currentQ || currentQ.status === 'Correct' || currentQ.status === 'Review') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('sourceId', sourceId);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!currentQ || currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    const sourceId = e.dataTransfer.getData('sourceId');
    if (!sourceId) return;

    const newAnswers = { ...(currentQ.userAnswers || {}) };
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
    if (!currentQ || currentQ.status === 'Correct' || currentQ.status === 'Review') return;
    const newAnswers = { ...(currentQ.userAnswers || {}) };
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
      const finalScore = Math.round((finalCorrectCount / (questions.length || 1)) * 100);
      let levelNum = 1;
      if (registration.level === '1-Level') levelNum = 1;
      if (registration.level === '2-Level') levelNum = 2;
      if (registration.level === '3-Level') levelNum = 3;
      
      try {
        await supabase.from('leaderboard').insert([{
          username: `${registration.firstName || ''} ${registration.lastName || ''}`.trim() || 'Student',
          level_num: levelNum,
          score: finalScore
        }]);
      } catch (err) {
        console.error("Failed to save score to leaderboard:", err);
      }
    }
  };

  const handlePrev = () => {
    setOpenDropdownId(null);
    setMobileSidebar(null);
    setSelectedSourceId(null);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const isSubmitReady = currentQ && (
    ((currentQ.type === 'MULTIPLE CHOICE' || currentQ.type === 'SIMULATED_UI') && (currentQ.userAnswers || []).length === (currentQ.answersRequired || 1)) ||
    (currentQ.type === 'INSTRUCTION SET' && Object.keys(currentQ.userAnswers || {}).length === (currentQ.statements || []).length) ||
    (currentQ.type === 'MATCHING TASK' && Object.keys(currentQ.userAnswers || {}).length === (currentQ.targetAreas || []).length)
  );

  const handleSubmitTask = () => {
    if (isSubmitReady && currentQ) {
      let isCorrect = false;

      if (currentQ.type === 'MULTIPLE CHOICE' || currentQ.type === 'SIMULATED_UI') {
        const userAns = currentQ.userAnswers || [];
        const correctList = currentQ.correctAnswers || [];
        isCorrect = 
          userAns.length === correctList.length &&
          userAns.every(ans => correctList.includes(ans));
      } else if (currentQ.type === 'INSTRUCTION SET') {
        const stmts = currentQ.statements || [];
        const userAns = currentQ.userAnswers || {};
        isCorrect = stmts.every(stmt => userAns[stmt.id] === (stmt.correctAnswer || stmt.answer));
      } else if (currentQ.type === 'MATCHING TASK') {
        const tgts = currentQ.targetAreas || [];
        const userAns = currentQ.userAnswers || {};
        isCorrect = tgts.every(tgt => userAns[tgt.id] === tgt.correctAnswer);
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
      try {
        await supabase.from('exam_sessions').delete().eq('id', sessionId);
      } catch (e) {
        console.error("Session deletion error:", e);
      }
    }
    localStorage.removeItem('ic3_session');
    setQuestions([]);
    setCurrentIndex(0);
    setSessionId(null);
    setRequestId(null);
    setAppState('HOME');
  };

  const handleStartExam = () => {
    if (isSubmitting) return;

    const trimmedFirstName = (registration.firstName || '').trim();
    const trimmedLastName = (registration.lastName || '').trim();
    const trimmedEmail = (registration.email || '').trim().toLowerCase();
    const selectedLevel = registration.level;

    const isFirstNameValid = trimmedFirstName.length > 0;
    const isLastNameValid = trimmedLastName.length > 0;
    const isEmailValid = /^[^\s@]+@gmail\.com$/.test(trimmedEmail);
    const isLevelValid = selectedLevel !== '';
    
    // Check if Admin
    const targetAdminFirstName = (adminCreds.firstName || 'admin').trim().toLowerCase();
    const targetAdminEmail = (adminCreds.email || '0807').trim().toLowerCase();

    if (
      trimmedFirstName.toLowerCase() === targetAdminFirstName &&
      trimmedEmail === targetAdminEmail
    ) {
      setAppState('ADMIN');
      return;
    }

    if (isFirstNameValid && isLastNameValid && isEmailValid && isLevelValid) {
      if (!levelsStatus[selectedLevel]) {
        setShowInactiveModal(true);
        return;
      }

      setIsSubmitting(true);

      const checkRequests = async () => {
        try {
          const { data } = await supabase
            .from('requests')
            .select('id, status')
            .ilike('email', trimmedEmail)
            .eq('level', selectedLevel)
            .in('status', ['pending', 'approved']);
            
          if (data && data.length > 0) {
            const approved = data.find(r => r.status === 'approved');
            if (approved) {
              const { data: sessionData } = await supabase
                .from('exam_sessions')
                .select('*')
                .ilike('email', trimmedEmail)
                .eq('registration->>level', selectedLevel)
                .order('updated_at', { ascending: false })
                .limit(1);
                
              if (sessionData && sessionData.length > 0 && sessionData[0].app_state !== 'RESULT') {
                 setSessionId(sessionData[0].id);
                 setQuestions(sessionData[0].questions || []);
                 setCurrentIndex(sessionData[0].current_index || 0);
                 setAppState(sessionData[0].app_state || 'EXAM');
              } else {
                 setQuestions([]);
                 setCurrentIndex(0);
                 const { data: newSession } = await supabase
                   .from('exam_sessions')
                   .insert([{ email: trimmedEmail, registration: { firstName: trimmedFirstName, lastName: trimmedLastName, email: trimmedEmail, level: selectedLevel }, app_state: 'EXAM' }])
                   .select();
                 if (newSession && newSession.length > 0) {
                   setSessionId(newSession[0].id);
                 }
                 setAppState('EXAM');
              }
              setIsSubmitting(false);
              return;
            }
            const pending = data.find(r => r.status === 'pending');
            if (pending) {
              setRequestId(pending.id);
              setAppState('WAITING');
              setIsSubmitting(false);
              return;
            }
          }

          const insertPayload = {
            firstName: trimmedFirstName,
            lastName: trimmedLastName,
            email: trimmedEmail,
            level: selectedLevel,
            status: 'pending'
          };

          let { data: insertData, error: insertErr } = await supabase
            .from('requests')
            .insert([insertPayload])
            .select();

          if (insertErr) {
            console.error("Supabase insert error:", insertErr);
          }
          
          if (insertData && insertData.length > 0) {
            setRequestId(insertData[0].id);
            setAppState('WAITING');
          } else {
            // Fallback: If select failed or empty response but insert succeeded without throwing
            setRequestId('req_' + Date.now());
            setAppState('WAITING');
          }
        } catch (e) {
          console.error("Error submitting request:", e);
          setRequestId('req_' + Date.now());
          setAppState('WAITING');
        }
        setIsSubmitting(false);
      };

      checkRequests();
    } else {
      let emailErrorMsg = false;
      if (!trimmedEmail) {
        emailErrorMsg = 'Please enter email.';
      } else if (!isEmailValid) {
        emailErrorMsg = "Email @gmail.com bo'lishi kerak (masalan: example@gmail.com)";
      }

      setRegistrationErrors({
        firstName: !isFirstNameValid,
        lastName: !isLastNameValid,
        email: emailErrorMsg,
        level: !isLevelValid
      });
    }
  };

  // --- Render Home Screen ---
  if (appState === 'HOME') {
    return (
      <HomePage 
        registration={registration}
        setRegistration={setRegistration}
        registrationErrors={registrationErrors}
        setRegistrationErrors={setRegistrationErrors}
        handleStartExam={handleStartExam}
        isSubmitting={isSubmitting}
        showInactiveModal={showInactiveModal}
        setShowInactiveModal={setShowInactiveModal}
      />
    );
  }

  // --- Render Waiting Screen ---
  if (appState === 'WAITING') {
    return <WaitingPage registration={registration} setAppState={setAppState} />;
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
    return (
      <ResultPage 
        questions={questions} 
        correctCount={correctCount} 
        handleRestartExam={handleRestartExam} 
      />
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
          Navigation
        </button>
        <div className="w-px bg-gray-200"></div>
        <button 
          onClick={() => setMobileSidebar(mobileSidebar === 'instructions' ? null : 'instructions')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider flex justify-center items-center gap-2 transition-colors ${mobileSidebar === 'instructions' ? 'text-[#1a446b] border-b-2 border-[#1a446b] bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Instructions
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
                {currentQ.type === 'MULTIPLE CHOICE' && (
                  <QuestionMultipleChoice currentQ={currentQ} isEvaluated={isEvaluated} toggleOption={toggleOption} />
                )}

                {currentQ.type === 'INSTRUCTION SET' && (
                  <QuestionInstructionSet 
                    currentQ={currentQ} 
                    isEvaluated={isEvaluated} 
                    openDropdownId={openDropdownId} 
                    setOpenDropdownId={setOpenDropdownId} 
                    handleSelectAnswer={handleSelectAnswer} 
                  />
                )}

                {currentQ.type === 'MATCHING TASK' && (
                  <QuestionMatchingTask 
                    currentQ={currentQ} 
                    isEvaluated={isEvaluated} 
                    selectedSourceId={selectedSourceId} 
                    handleSourceClick={handleSourceClick} 
                    handleTargetClick={handleTargetClick} 
                    handleDragStart={handleDragStart} 
                    handleDrop={handleDrop} 
                    handleClearTarget={handleClearTarget} 
                  />
                )}

                {currentQ.type === 'SIMULATED_UI' && (
                  <QuestionSimulatedUI currentQ={currentQ} isEvaluated={isEvaluated} toggleOption={toggleOption} />
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