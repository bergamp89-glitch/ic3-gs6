import React from 'react';

function WaitingPage({ registration, setAppState }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6ebf0] p-4">
      <div className="bg-white p-10 rounded-sm shadow-md text-center max-w-md w-full border-t-4 border-[#1a446b]">
         <svg className="w-16 h-16 text-[#1a446b] mx-auto mb-6 animate-spin" fill="none" viewBox="0 0 24 24">
           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
         <h2 className="text-2xl font-bold text-[#1a446b] mb-4">Your request has been submitted</h2>
         <p className="text-gray-600 font-medium leading-relaxed">
            Permission request for <strong className="text-[#1a446b]">{registration.level}</strong> has been sent to admin.
         </p>
         <p className="text-sm text-gray-500 mt-6 bg-gray-50 py-2 rounded-sm border border-gray-100 mb-6">Iltimos, admin tasdiqlashini kuting. Sahifa avtomatik yangilanadi.</p>
         <button 
           onClick={() => {
             localStorage.removeItem('ic3_session');
             window.location.hash = '#/home';
             setAppState('HOME');
           }} 
           className="bg-transparent border border-[#1a446b] text-[#1a446b] px-6 py-2 rounded-sm font-semibold hover:bg-blue-50 transition-colors w-full"
         >
           Return to Home
         </button>
      </div>
    </div>
  );
}

export default WaitingPage;
