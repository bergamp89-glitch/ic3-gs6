import React from 'react';

function QuestionMultipleChoice({ currentQ, isEvaluated, toggleOption }) {
  return (
    <>
      {currentQ.options.map((opt, optIdx) => {
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
               {String.fromCharCode(65 + optIdx)}
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
    </>
  );
}

export default QuestionMultipleChoice;
