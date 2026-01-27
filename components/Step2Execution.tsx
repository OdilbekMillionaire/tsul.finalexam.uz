
import React, { useState } from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';
import { assessAnswer } from '../services/geminiService';
import { Rubric } from '../types';

const Step2Execution: React.FC = () => {
  const { 
    language, 
    masterCase, 
    questions, 
    rubric, 
    answers, 
    updateAnswer, 
    setAssessment, 
    setAssessingStatus,
    setStep,
    resetAnswers,
    checkUsage,
    incrementUsage,
    setView
  } = useExamContext();

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const t = TRANSLATIONS[language];

  // Helper to turn the rubric object into a prompt string
  const formatRubricForAI = (rubric: Rubric): string => {
    if (rubric.type === 'custom') {
       return `CUSTOM GRADING INSTRUCTIONS FROM TEACHER:\n${rubric.customInstructions}\n\nNOTE TO AI: YOU MUST FOLLOW THESE INSTRUCTIONS ABOVE STRICTLY. IGNORE DEFAULT GRADING PATTERNS IF THEY CONFLICT WITH THESE INSTRUCTIONS.`;
    }

    let output = `Grading Rubric Type: ${rubric.type}\nCriteria:\n`;
    const activeItems = rubric.items.filter(i => i.enabled);
    
    activeItems.forEach((item, idx) => {
      output += `${idx + 1}. ${item.label} (Weight/Max: ${item.weight}). Description: ${item.description || 'N/A'}\n`;
    });
    
    // Add total context
    const total = activeItems.reduce((acc, i) => acc + i.weight, 0);
    output += `\nTotal Rubric Weight: ${total}. Scale student score accordingly relative to Question Max Weight.`;
    return output;
  };

  const handleAssess = async (questionId: string) => {
    // 1. CHECK USAGE LIMIT
    if (!checkUsage()) {
       if (confirm("You have reached your daily limit of 3 free AI assessments. Upgrade to Pro for unlimited grading?")) {
           setView('plans');
       }
       return;
    }

    const question = questions.find(q => q.id === questionId);
    const answer = answers[questionId];

    if (!question || !answer || !answer.text.trim()) return;

    setAssessingStatus(questionId, true);
    
    const rubricString = formatRubricForAI(rubric);
    
    // Pass the language LABEL for clarity to the AI.
    const langLabel = language === 'ru' ? 'Russian' : language.startsWith('uz') ? 'Uzbek' : 'English';
    
    const realResult = await assessAnswer(
      masterCase,
      question.text,
      question.maxWeight,
      rubricString,
      answer.text,
      langLabel
    );

    setAssessment(questionId, realResult);
    setAssessingStatus(questionId, false);
    
    // 2. INCREMENT USAGE
    incrementUsage();
  };

  const handleManualSave = () => {
    // App.tsx handles the actual saving to localStorage via useEffect
    // This just gives visual feedback
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const allAssessed = questions.every(q => answers[q.id]?.assessment);

  return (
    <div className="space-y-12 animate-fade-in relative">
       {/* Case Reference (Collapsible or sticky could be nice, keeping it simple for now) */}
       <div className="bg-oxford-primary/5 dark:bg-slate-800 p-4 rounded border border-oxford-primary/10 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 mb-8 transition-colors">
        <h3 className="font-bold text-oxford-primary dark:text-white mb-2">Reference Case:</h3>
        <p className="line-clamp-3">{masterCase}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleManualSave}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
            showSaveConfirm 
              ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
              : 'bg-white dark:bg-slate-800 text-oxford-primary dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {showSaveConfirm ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {t.saved}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              {t.saveProgress}
            </>
          )}
        </button>

        <button 
           onClick={resetAnswers}
           className="text-sm font-bold text-oxford-secondary hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          {t.resetAnswers}
        </button>
      </div>

      <div className="space-y-8">
        {questions.map((q, idx) => {
          const answer = answers[q.id];
          const isAssessing = answer?.isAssessing;
          const hasResult = !!answer?.assessment;

          return (
            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-serif font-bold text-oxford-primary dark:text-white">Question {idx + 1}</span>
                <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                  Max: {q.maxWeight} pts
                </span>
              </div>
              
              <div className="p-6">
                <p className="text-lg mb-4 text-slate-800 dark:text-slate-100 font-medium">{q.text}</p>
                
                <div className="relative">
                  <textarea
                    className="w-full h-40 p-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md focus:ring-2 focus:ring-oxford-primary focus:border-transparent outline-none transition mb-4 resize-y disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                    placeholder={t.placeholders.answer}
                    value={answer?.text || ''}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    disabled={isAssessing} // Removed hasResult check to allow re-writing
                  />
                  {isAssessing && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur border border-slate-100 p-1.5 rounded-full shadow-sm animate-pulse" title="AI is thinking...">
                      <svg className="animate-spin h-5 w-5 text-oxford-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {hasResult && (
                      <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Graded: {answer.assessment?.score}/{q.maxWeight}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAssess(q.id)}
                    disabled={!answer?.text || isAssessing}
                    className={`px-6 py-2 rounded font-bold text-white transition flex items-center gap-2
                      ${isAssessing ? 'bg-slate-400 cursor-wait' : hasResult ? 'bg-green-600 hover:bg-green-700' : 'bg-oxford-secondary hover:bg-opacity-90'}
                    `}
                  >
                     {isAssessing ? (
                       <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.assessing}
                       </>
                     ) : hasResult ? 'Re-Assess' : t.assess}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-8">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          &larr; {t.back}
        </button>
        <button
          onClick={() => setStep(3)}
          className="px-8 py-3 bg-oxford-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition shadow-lg"
        >
          {t.next} &rarr;
        </button>
      </div>
    </div>
  );
};

export default Step2Execution;
