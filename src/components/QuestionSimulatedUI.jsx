import React from 'react';

function QuestionSimulatedUI({ currentQ, isEvaluated, toggleOption }) {
  const options = currentQ?.options || [];
  const userAnswers = Array.isArray(currentQ?.userAnswers) ? currentQ.userAnswers : [];
  const correctAnswers = Array.isArray(currentQ?.correctAnswers) ? currentQ.correctAnswers : [];

  return (
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
            {options.map(opt => {
              const isSelected = userAnswers.includes(opt.id);
              const isCorrectAnswer = correctAnswers.includes(opt.id);
              
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
  );
}

export default QuestionSimulatedUI;
