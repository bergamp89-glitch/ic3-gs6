import React from 'react';

function QuestionMatchingTask({ 
  currentQ, 
  isEvaluated, 
  selectedSourceId, 
  handleSourceClick, 
  handleTargetClick, 
  handleDragStart, 
  handleDrop, 
  handleClearTarget 
}) {
  const sourceItems = currentQ?.sourceItems || [];
  const targetAreas = currentQ?.targetAreas || [];
  const userAnswers = (currentQ?.userAnswers && typeof currentQ.userAnswers === 'object' && !Array.isArray(currentQ.userAnswers))
    ? currentQ.userAnswers
    : {};

  return (
    <div className="flex flex-col gap-3 mt-2 h-full">
      <div className="bg-[#f0f4f8] text-[#1a446b] text-xs font-semibold px-4 py-2 rounded-sm border border-[#1a446b]/20 flex items-center justify-between">
        <span>💡 Direct Drag & Drop or tap an item to select and click a target area.</span>
        {selectedSourceId && (
          <span className="text-[#059669] font-bold">Item selected — now click a target area!</span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Left Column - Source Items */}
        <div className="flex-1 border border-gray-200 rounded-sm p-3.5 sm:p-4 flex flex-col bg-white shadow-sm">
          <div className="text-[9.5px] font-bold text-[#6f93b5] uppercase tracking-widest mb-2.5">Source Items</div>
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {sourceItems.map(src => {
               const placedTargetId = Object.keys(userAnswers).find(tId => userAnswers[tId] === src.id);
               const placedTarget = placedTargetId ? targetAreas.find(t => t.id === placedTargetId) : null;
               
               return (
                 <div 
                   key={src.id}
                   draggable={!isEvaluated}
                   onDragStart={(e) => handleDragStart(e, src.id)}
                   onClick={() => handleSourceClick(src.id)}
                   className={`border rounded-md p-2.5 sm:p-3 bg-white transition-all duration-200 ${!isEvaluated ? 'cursor-pointer hover:shadow-sm hover:border-[#1a446b]/40' : ''} ${placedTarget ? 'opacity-50 scale-95 border-gray-200 bg-gray-50' : 'border-gray-200'} ${selectedSourceId === src.id ? 'ring-2 ring-[#1a446b] border-[#1a446b] bg-blue-50/30 font-semibold' : ''}`}
                 >
                   <div className="text-[12.5px] sm:text-[13px] text-gray-800 font-medium">{src.text}</div>
                   {placedTarget && (
                     <div className="text-[9.5px] font-bold text-[#1a446b] uppercase tracking-widest mt-1.5 flex items-center gap-1">
                       <svg className="w-3 h-3 text-[#1a446b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                       Placed in: {placedTarget.label}
                     </div>
                   )}
                 </div>
               );
            })}
          </div>
        </div>

        {/* Right Column - Target Areas */}
        <div className="flex-1 border border-gray-200 rounded-sm p-3.5 sm:p-4 flex flex-col bg-white shadow-sm">
          <div className="text-[9.5px] font-bold text-[#6f93b5] uppercase tracking-widest mb-2.5">Target Areas</div>
          <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
            {targetAreas.map(tgt => {
               const placedSourceId = userAnswers[tgt.id];
               const placedSource = placedSourceId ? sourceItems.find(s => s.id === placedSourceId) : null;
               
               const isCorrectAnswer = isEvaluated && placedSourceId === tgt.correctAnswer;
               const isWrongAnswer = isEvaluated && placedSourceId && placedSourceId !== tgt.correctAnswer;

               let dropZoneClass = 'border-dashed border-gray-300 text-gray-400 bg-gray-50/50 hover:border-[#1a446b]/40 hover:bg-[#f8fbff]';
               if (placedSource) {
                 dropZoneClass = 'border-solid border-[#1a446b]/30 bg-[#f8fbff] ring-1 ring-[#1a446b]/10 shadow-sm';
               }
               if (isEvaluated) {
                 if (isCorrectAnswer) {
                   dropZoneClass = 'border-solid border-[#059669] bg-[#ecfdf5] ring-1 ring-[#059669]/50 shadow-sm';
                 } else if (isWrongAnswer) {
                   dropZoneClass = 'border-solid border-[#e11d48] bg-[#fff1f2] ring-1 ring-[#e11d48]/50 shadow-sm';
                 } else {
                   dropZoneClass = 'border-solid border-gray-300 bg-gray-100 opacity-60';
                 }
               }

               return (
                 <div key={tgt.id} className="mb-4 group">
                   <div className="text-[10px] font-bold text-[#6f93b5] uppercase tracking-widest mb-2">{tgt.label}</div>
                   <div 
                     onDragOver={(e) => { e.preventDefault(); }}
                     onDrop={(e) => handleDrop(e, tgt.id)}
                     onClick={() => handleTargetClick(tgt.id)}
                     className={`border rounded-md p-4 transition-all duration-300 min-h-[76px] flex flex-col justify-center ${dropZoneClass} ${selectedSourceId && !isEvaluated ? 'cursor-pointer hover:ring-2 hover:ring-[#1a446b]/50' : ''}`}
                   >
                     {!placedSource ? (
                       <div className="text-[13px]">{isEvaluated ? "No item placed" : selectedSourceId ? "Click here to place selected item" : "Drop an item here or click after selecting item"}</div>
                     ) : (
                       <div className="flex justify-between items-center w-full">
                         <div className={`text-[14px] font-medium ${isCorrectAnswer ? 'text-[#065f46]' : isWrongAnswer ? 'text-[#9f1239]' : 'text-[#1a446b]'}`}>
                           {placedSource.text}
                         </div>
                         {!isEvaluated && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleClearTarget(tgt.id); }}
                             className="border border-[#1a446b]/20 text-[#1a446b] bg-white rounded flex items-center justify-center p-1.5 hover:bg-[#1a446b] hover:text-white transition-colors ml-2 flex-shrink-0"
                             title="Clear placement"
                           >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                           </button>
                         )}
                       </div>
                     )}
                     {isEvaluated && isCorrectAnswer && (
                       <div className="text-[11px] font-bold text-[#059669] uppercase tracking-widest mt-2 flex items-center gap-1">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         Correct Answer
                       </div>
                     )}
                     {isEvaluated && isWrongAnswer && (
                       <div className="text-[11px] font-bold text-[#e11d48] uppercase tracking-widest mt-2 flex items-center gap-1">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                         Incorrect (Correct is: {sourceItems.find(s => s.id === tgt.correctAnswer)?.text || tgt.correctAnswer})
                       </div>
                     )}
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionMatchingTask;
