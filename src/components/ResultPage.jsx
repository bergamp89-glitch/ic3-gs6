import React from 'react';

function ResultPage({ questions = [], correctCount = 0, handleRestartExam }) {
  const total = questions.length || 1;
  const score = Math.round((correctCount / total) * 100);
  const reviewed = total - correctCount;

  const isPassed = score >= 70;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6ebf0] p-4">
      <div className="w-full max-w-4xl bg-white rounded-sm shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a446b] text-white px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-[#8baecf] uppercase tracking-widest mb-1.5">Exam Summary</div>
            <h1 className="text-[26px] font-semibold tracking-wide">IC3 Test Results</h1>
          </div>
          <div>
            <span className={`inline-flex items-center px-4 py-2 rounded text-sm font-bold tracking-wider uppercase shadow-sm ${
              isPassed 
                ? 'bg-emerald-500 text-white' 
                : 'bg-rose-500 text-white'
            }`}>
              {isPassed ? '✓ PASSED / Muvaffaqiyatli' : '✕ DID NOT PASS / O\'tmadi'}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Status Message */}
          <div className={`p-4 rounded-md border mb-6 flex items-center gap-3 ${
            isPassed 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="text-2xl flex-shrink-0">
              {isPassed ? '🎉' : '⚠️'}
            </div>
            <div>
              <div className="font-bold text-sm">
                {isPassed 
                  ? 'Tabriklaymiz! Siz IC3 GS6 talab qilingan o\'tish balidan muvaffaqiyatli o\'tdingiz.' 
                  : 'Siz talab qilingan minimal 70% o\'tish balini to\'play olmadingiz.'}
              </div>
              <div className="text-xs opacity-90 mt-0.5">
                Minimal o'tish talabi: 70% | Sizning natijangiz: {score}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* Score Box */}
            <div className="border border-gray-200 rounded-sm p-6">
              <div className="text-[11px] font-bold text-[#6f93b5] uppercase tracking-widest mb-4">Score</div>
              <div className={`text-5xl font-bold ${isPassed ? 'text-emerald-600' : 'text-[#1a446b]'}`}>{score}%</div>
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

          <button onClick={handleRestartExam} className="bg-[#1a446b] text-white px-8 py-3.5 rounded-sm font-semibold tracking-wide hover:bg-[#153655] transition-colors text-sm shadow-sm">
            RESTART EXAM
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
