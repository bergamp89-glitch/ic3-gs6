import React from 'react';

function QuestionInstructionSet({ currentQ, isEvaluated, openDropdownId, setOpenDropdownId, handleSelectAnswer }) {
  const statements = currentQ?.statements || [];
  const userAnswers = (currentQ?.userAnswers && typeof currentQ.userAnswers === 'object' && !Array.isArray(currentQ.userAnswers))
    ? currentQ.userAnswers
    : {};

  const normalizeAnswer = (val) => {
    if (!val) return '';
    const s = String(val).trim().toLowerCase();
    if (s === 'true' || s === 'верно' || s === 'правда') return 'true';
    if (s === 'false' || s === 'неверно' || s === 'ложь') return 'false';
    if (s === 'yes' || s === 'да') return 'yes';
    if (s === 'no' || s === 'нет') return 'no';
    return s;
  };

  const isRu = /[а-яА-ЯёЁ]/.test(currentQ?.prompt || '');

  return (
    <>
      {statements.map((stmt, idx) => {
        const selectedVal = userAnswers[stmt.id];
        const isCorrectAnswer = normalizeAnswer(selectedVal) === normalizeAnswer(stmt.correctAnswer);
        const isOpen = openDropdownId === stmt.id;
        const stmtOptions = stmt.options || [];
        
        let boxBorder = 'border-gray-200';
        if (isEvaluated) {
          boxBorder = isCorrectAnswer ? 'border-[#059669] bg-[#ecfdf5] ring-1 ring-[#059669]/30' : 'border-[#e11d48] bg-[#fff1f2] ring-1 ring-[#e11d48]/30';
        }

        return (
          <div key={stmt.id} className={`bg-white border rounded-sm mb-2.5 transition-colors ${boxBorder}`}>
            <div className="px-4 py-2.5 sm:py-3">
              <div className="text-[9.5px] font-bold text-[#6f93b5] uppercase tracking-widest mb-1">
                {isRu ? `Утверждение ${idx + 1}` : `Statement ${idx + 1}`}
              </div>
              <div className="text-[13px] text-gray-800 font-medium mb-2.5">{stmt.text}</div>
              
              <div className="relative dropdown-container">
                <div 
                  onClick={() => !isEvaluated && setOpenDropdownId(isOpen ? null : stmt.id)} 
                  className={`w-full border rounded-md p-2.5 sm:p-3 flex justify-between items-center transition-all duration-200 ${isEvaluated ? 'bg-white/50 cursor-default' : 'bg-white cursor-pointer hover:border-[#1a446b]/60 hover:shadow-sm'} ${isOpen ? 'border-[#1a446b] ring-2 ring-[#1a446b]/10 shadow-sm' : 'border-gray-300'}`}
                >
                  <span className={selectedVal ? "text-[#1a446b] text-[13.5px] font-semibold" : "text-gray-400 text-[13.5px]"}>
                    {selectedVal || (isRu ? "Выберите ответ" : "Select an answer")}
                  </span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#1a446b]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {isOpen && !isEvaluated && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-xl z-10 overflow-hidden transform origin-top transition-all">
                    {stmtOptions.map(opt => (
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
                      {isRu ? 'Правильный ответ' : 'Correct Answer'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      {isRu ? `Неверно (Правильно: ${stmt.correctAnswer})` : `Incorrect (Correct is: ${stmt.correctAnswer})`}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default QuestionInstructionSet;
