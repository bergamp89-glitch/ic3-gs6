import React from 'react';

function ResultPage({ questions, correctCount, handleRestartExam }) {
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

export default ResultPage;
