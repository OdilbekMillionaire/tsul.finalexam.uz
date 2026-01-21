import React from 'react';
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
    setStep 
  } = useExamContext();

  const t = TRANSLATIONS[language];

  // Helper to turn the rubric object into a prompt string
  const formatRubricForAI = (rubric: Rubric): string => {
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
  };

  const allAssessed = questions.every(q => answers[q.id]?.assessment);

  return (
    <div className="space-y-12 animate-fade-in">
       {/* Case Reference (Collapsible or sticky could be nice, keeping it simple for now) */}
       <div className="bg-oxford-primary/5 p-4 rounded border border-oxford-primary/10 text-sm text-slate-600 mb-8">
        <h3 className="font-bold text-oxford-primary mb-2">Reference Case:</h3>
        <p className="line-clamp-3">{masterCase}</p>
      </div>

      <div className="space-y-8">
        {questions.map((q, idx) => {
          const answer = answers[q.id];
          const isAssessing = answer?.isAssessing;
          const hasResult = !!answer?.assessment;

          return (
            <div key={q.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <span className="font-serif font-bold text-oxford-primary">Question {idx + 1}</span>
                <span className="text-xs font-semibold bg-slate-200 px-2 py-1 rounded text-slate-600">
                  Max: {q.maxWeight} pts
                </span>
              </div>
              
              <div className="p-6">
                <p className="text-lg mb-4 text-slate-800 font-medium">{q.text}</p>
                
                <textarea
                  className="w-full h-40 p-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-oxford-primary focus:border-transparent outline-none transition mb-4 resize-y"
                  placeholder={t.placeholders.answer}
                  value={answer?.text || ''}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  disabled={isAssessing || hasResult}
                />

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {hasResult && (
                      <span className="text-green-600 font-bold flex items-center gap-1">
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
          className="px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition"
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