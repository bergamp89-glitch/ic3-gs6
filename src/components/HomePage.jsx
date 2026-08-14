import React from 'react';

function HomePage({ 
  registration, 
  setRegistration, 
  registrationErrors, 
  setRegistrationErrors, 
  handleStartExam, 
  isSubmitting, 
  showInactiveModal, 
  setShowInactiveModal 
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
                     <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Last Name</label>
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
                   {registrationErrors.email && <p className="text-[#e11d48] text-[11px] mt-1.5 font-medium">Please enter a valid email address.</p>}
                 </div>
               </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
             <button 
               onClick={handleStartExam} 
               disabled={isSubmitting}
               className={`text-white px-8 py-3 md:px-12 md:py-4 rounded-sm font-bold tracking-widest text-[13px] md:text-[15px] transition-all ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a446b] hover:bg-[#153655] hover:shadow-lg hover:-translate-y-0.5'}`}
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">Level Unavailable</h3>
            <p className="text-gray-600 text-[13px] mb-6 leading-relaxed font-medium">
              The selected test level is currently inactive or unavailable. Please choose a different level.
            </p>
            <button 
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
