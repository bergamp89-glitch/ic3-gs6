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
  onOpenAdminLogin
}) {
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
                          type="button"
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
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">First Name</label>
                     <input 
                       type="text" 
                       value={registration.firstName || ''}
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
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Last Name</label>
                     <input 
                       type="text" 
                       value={registration.lastName || ''}
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
                     value={registration.email || ''}
                     onChange={(e) => {
                       setRegistration({...registration, email: e.target.value});
                       if (registrationErrors.email) setRegistrationErrors({...registrationErrors, email: false});
                     }}
                     className={`w-full border ${registrationErrors.email ? 'border-[#e11d48]' : 'border-gray-300'} rounded-sm px-2.5 py-1.5 md:px-3 md:py-2.5 text-xs md:text-sm focus:outline-none focus:border-[#1a446b]`} 
                     placeholder="example@gmail.com"
                   />
                    {registrationErrors.email && (
                      <p className="text-[#e11d48] text-[11px] mt-1.5 font-medium">
                        {typeof registrationErrors.email === 'string'
                          ? registrationErrors.email
                          : "Email @gmail.com bo'lishi kerak (masalan: example@gmail.com)"}
                      </p>
                    )}
                 </div>

                  {/* Face ID & Camera Requirement Notice */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 flex items-start gap-2.5 text-xs text-slate-700">
                    <svg className="w-5 h-5 text-[#1a446b] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <span className="font-bold text-[#1a446b]">Face ID & Kamera talabi: </span>
                      Barcha kataklarni to'ldirish va yuzni Face ID orqali ro'yxatdan o'tkazish majburiy. Qurilmangizda kamera bo'lmasa, testga kirish taqiqlanadi.
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
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
               START EXAM & FACE ID
             </button>

             {onOpenAdminLogin && (
               <button
                 type="button"
                 onClick={onOpenAdminLogin}
                 className="text-gray-400 hover:text-[#1a446b] text-xs font-semibold flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
               >
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
                 Admin Panelga Kirish
               </button>
             )}
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
