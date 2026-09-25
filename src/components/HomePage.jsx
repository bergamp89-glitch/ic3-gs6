import React from 'react';

function HomePage({ 
  registration, 
  setRegistration, 
  registrationErrors, 
  setRegistrationErrors, 
  handleStartExam, 
  isSubmitting, 
  showInactiveModal, 
  setShowInactiveModal,
  onOpenAdminLogin,
  language = 'en',
  setLanguage
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6ebf0] p-4">
      <div className="w-full max-w-4xl bg-white rounded-sm shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a446b] text-white px-5 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-3 -translate-y-3 sm:translate-x-4 sm:-translate-y-4 pointer-events-none">
             <svg className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div>
               <div className="text-[11px] sm:text-xs font-bold text-[#8baecf] uppercase tracking-wider sm:tracking-widest mb-1 sm:mb-1.5">Practice Test / Assessment</div>
               <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight sm:tracking-wide mb-1 sm:mb-1.5 md:mb-2 leading-tight">IC3 Digital Literacy Certification</h1>
               <h2 className="text-sm sm:text-base md:text-lg text-blue-100 font-medium">Global Standard 6 (GS6)</h2>
             </div>

             {/* Compact Language Selector */}
              <div className="flex items-center self-start sm:self-center flex-shrink-0">
                <div className="inline-flex p-0.5 bg-[#0e273f]/80 rounded border border-[#8baecf]/30 backdrop-blur-sm shadow-sm">
                  <button
                    type="button"
                    onClick={() => setLanguage && setLanguage('en')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      language === 'en'
                        ? 'bg-white text-[#1a446b] font-bold shadow-sm'
                        : 'text-[#8baecf] hover:text-white hover:bg-white/10'
                    }`}
                    title="English Test"
                  >
                    <span className="text-xs">🇬🇧</span>
                    <span>English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage && setLanguage('ru')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      language === 'ru'
                        ? 'bg-white text-[#1a446b] font-bold shadow-sm'
                        : 'text-[#8baecf] hover:text-white hover:bg-white/10'
                    }`}
                    title="Русский тест"
                  >
                    <span className="text-xs">🇷🇺</span>
                    <span>Русский</span>
                  </button>
                </div>
              </div>
           </div>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 md:p-10">
          <div className="max-w-xl mx-auto mb-6 md:mb-10">
            <div className="border border-gray-200 p-5 sm:p-7 md:p-8 rounded-md bg-white shadow-sm flex flex-col justify-center">
               <div className="flex items-center justify-between mb-3 sm:mb-4">
                 <h3 className="text-xs sm:text-sm font-bold text-[#1a446b] uppercase tracking-wider sm:tracking-widest flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                   Registration & Test Setup
                 </h3>
                 <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                   language === 'ru' 
                     ? 'bg-amber-50 text-amber-800 border-amber-200' 
                     : 'bg-blue-50 text-blue-800 border-blue-200'
                 }`}>
                   {language === 'ru' ? '🇷🇺 Rus tili (RU)' : '🇬🇧 Ingliz tili (EN)'}
                 </span>
               </div>
               <div className="space-y-4 sm:space-y-5">
                 <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-gray-600 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2">Select Test Level</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                      {['1-Level', '2-Level', '3-Level'].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            setRegistration({...registration, level: lvl});
                            if (registrationErrors.level) setRegistrationErrors({...registrationErrors, level: false});
                          }}
                          className={`border rounded-md py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all ${registration.level === lvl ? 'border-[#1a446b] bg-[#1a446b] text-white shadow-sm' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    {registrationErrors.level && <p className="text-[#e11d48] text-xs mt-1.5 font-medium">Please select a test level.</p>}
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                   <div>
                     <label className="block text-xs sm:text-[13px] font-bold text-gray-600 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2">First Name</label>
                     <input 
                       type="text" 
                       value={registration.firstName || ''}
                       onChange={(e) => {
                         setRegistration({...registration, firstName: e.target.value});
                         if (registrationErrors.firstName) setRegistrationErrors({...registrationErrors, firstName: false});
                       }}
                       className={`w-full border ${registrationErrors.firstName ? 'border-[#e11d48] focus:border-[#e11d48]' : 'border-gray-300 focus:border-[#1a446b]'} rounded-md px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1a446b]/15 transition-all`} 
                       placeholder="John"
                     />
                     {registrationErrors.firstName && <p className="text-[#e11d48] text-xs mt-1.5 font-medium">Required.</p>}
                   </div>
                   <div>
                     <label className="block text-xs sm:text-[13px] font-bold text-gray-600 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2">Last Name</label>
                     <input 
                       type="text" 
                       value={registration.lastName || ''}
                       onChange={(e) => {
                         setRegistration({...registration, lastName: e.target.value});
                         if (registrationErrors.lastName) setRegistrationErrors({...registrationErrors, lastName: false});
                       }}
                       className={`w-full border ${registrationErrors.lastName ? 'border-[#e11d48] focus:border-[#e11d48]' : 'border-gray-300 focus:border-[#1a446b]'} rounded-md px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1a446b]/15 transition-all`} 
                       placeholder="Doe"
                     />
                     {registrationErrors.lastName && <p className="text-[#e11d48] text-xs mt-1.5 font-medium">Required.</p>}
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs sm:text-[13px] font-bold text-gray-600 uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2">Email Address</label>
                   <input 
                     type="email" 
                     value={registration.email || ''}
                     onChange={(e) => {
                       setRegistration({...registration, email: e.target.value});
                       if (registrationErrors.email) setRegistrationErrors({...registrationErrors, email: false});
                     }}
                     className={`w-full border ${registrationErrors.email ? 'border-[#e11d48] focus:border-[#e11d48]' : 'border-gray-300 focus:border-[#1a446b]'} rounded-md px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1a446b]/15 transition-all`} 
                     placeholder="example@gmail.com"
                   />
                    {registrationErrors.email && (
                      <p className="text-[#e11d48] text-xs mt-1.5 font-medium">
                        {typeof registrationErrors.email === 'string'
                          ? registrationErrors.email
                          : "Email @gmail.com bo'lishi kerak (masalan: example@gmail.com)"}
                      </p>
                    )}
                 </div>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5 pt-2">
             <button 
               type="button"
               onClick={handleStartExam} 
               disabled={isSubmitting}
               className={`text-white px-8 py-3.5 md:px-12 md:py-4 rounded-sm font-bold tracking-widest text-[13px] md:text-[14px] transition-all flex items-center justify-center gap-2.5 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a446b] hover:bg-[#153655] hover:shadow-lg hover:-translate-y-0.5'}`}
             >
               <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
               {language === 'ru' ? 'START EXAM & FACE ID (RU)' : 'START EXAM & FACE ID (EN)'}
             </button>
             <div className="text-[11.5px] text-gray-500 font-medium">
               {language === 'ru' ? '🇷🇺 Savollar rus tilida taqdim etiladi' : '🇬🇧 Questions will be presented in English'}
             </div>
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">Level Unavailable</h3>
            <p className="text-gray-600 text-[13px] mb-6 leading-relaxed font-medium">
              The selected test level is currently inactive or unavailable. Please choose a different level.
            </p>
            <button 
              type="button"
              onClick={() => setShowInactiveModal(false)}
              className="bg-[#e11d48] text-white hover:bg-[#be123c] px-6 py-2.5 rounded-sm font-semibold w-full transition-colors tracking-wide text-sm"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
