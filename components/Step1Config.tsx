
import React, { useState, useEffect } from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';
import { Question, RubricItem, StudentAnswer } from '../types';
import { parseExamContent } from '../services/geminiService';

const Step1Config: React.FC = () => {
  const { 
    language, 
    masterCase, 
    setMasterCase, 
    questions, 
    setQuestions, 
    rubric, 
    setRubric,
    setStep,
    importExamData // New context method
  } = useExamContext();

  const t = TRANSLATIONS[language];

  // --- Smart Import State ---
  const [rawExamText, setRawExamText] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  // --- Undo/Redo History Logic ---
  const [history, setHistory] = useState<{ c: string; q: Question[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Initialize history on mount
  useEffect(() => {
    // Only set if history is empty to avoid overwriting on re-renders
    if (history.length === 0) {
      setHistory([{ c: masterCase, q: questions }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushHistory = (newCase: string, newQuestions: Question[]) => {
    setHistory(prev => {
      const current = prev.slice(0, historyIndex + 1);
      return [...current, { c: newCase, q: newQuestions }];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const snapshot = history[prevIndex];
      setMasterCase(snapshot.c);
      setQuestions(snapshot.q);
      setHistoryIndex(prevIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const snapshot = history[nextIndex];
      setMasterCase(snapshot.c);
      setQuestions(snapshot.q);
      setHistoryIndex(nextIndex);
    }
  };

  const handleManualSave = () => {
    // App.tsx handles the actual saving to localStorage via useEffect
    // This just gives visual feedback
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // --- Event Handlers Wrappers ---

  // Master Case
  const handleMasterCaseBlur = () => {
    const currentSnapshot = history[historyIndex];
    // Only push if changed
    if (currentSnapshot && (currentSnapshot.c !== masterCase)) {
      pushHistory(masterCase, questions);
    }
  };

  // Questions
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: crypto.randomUUID(),
      text: '',
      maxWeight: 10
    };
    const newQuestions = [...questions, newQ];
    setQuestions(newQuestions);
    pushHistory(masterCase, newQuestions);
  };

  const handleUpdateQuestion = (id: string, field: keyof Question, value: string | number) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleQuestionBlur = () => {
    const currentSnapshot = history[historyIndex];
    if (currentSnapshot && JSON.stringify(currentSnapshot.q) !== JSON.stringify(questions)) {
      pushHistory(masterCase, questions);
    }
  };

  const handleRemoveQuestion = (id: string) => {
    const newQuestions = questions.filter(q => q.id !== id);
    setQuestions(newQuestions);
    pushHistory(masterCase, newQuestions);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) return;
    
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    // Swap
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    
    setQuestions(newQuestions);
    pushHistory(masterCase, newQuestions);
  };

  // Rubric Logic
  const handleToggleItem = (id: string) => {
    setRubric({
      ...rubric,
      items: rubric.items.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    });
  };

  const handleUpdateItem = (id: string, field: keyof RubricItem, value: any) => {
    setRubric({
      ...rubric,
      items: rubric.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const handleAddCustomItem = () => {
    const newItem: RubricItem = {
      id: crypto.randomUUID(),
      label: '',
      description: '',
      weight: 5, // Default Medium
      maxWeight: 10,
      enabled: true
    };
    setRubric({ ...rubric, items: [...rubric.items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    setRubric({ ...rubric, items: rubric.items.filter(item => item.id !== id) });
  };

  const getSliderColorClass = (val: number) => {
      if (val < 4) return 'accent-red-500'; // Low
      if (val < 8) return 'accent-yellow-500'; // Medium
      return 'accent-green-500'; // High
  };

  const getBadgeColorClass = (val: number) => {
    if (val < 4) return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    if (val < 8) return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
  };

  const getWeightLabel = (val: number) => {
     if (val < 4) return t.rubricUI.levels.low;
     if (val < 8) return t.rubricUI.levels.medium;
     return t.rubricUI.levels.high;
  };

  const toggleRubricType = (type: 'quick' | 'custom') => {
     setRubric({ ...rubric, type });
  };

  // --- Smart Import Handler ---
  const handleSmartImport = async () => {
    if (!rawExamText.trim()) return;
    setIsParsing(true);
    
    // Call the updated service that extracts Case, Questions, Answers, and Max Weights
    const result = await parseExamContent(rawExamText);
    
    if (result.items && result.items.length > 0) {
        // Construct Questions Array
        const newQuestions: Question[] = [];
        // Construct Answers Record
        const newAnswers: Record<string, StudentAnswer> = {};

        result.items.forEach(item => {
            const qId = crypto.randomUUID();
            
            // 1. Create Question Object
            newQuestions.push({
                id: qId,
                text: item.questionText,
                maxWeight: item.maxWeight
            });

            // 2. Create Answer Object (if text exists)
            if (item.studentAnswer && item.studentAnswer.trim()) {
                newAnswers[qId] = {
                    questionId: qId,
                    text: item.studentAnswer,
                    isAssessing: false
                };
            }
        });

        // Use the new Bulk Import context method
        importExamData(result.masterCase, newQuestions, newAnswers);
        
        // Update local history
        pushHistory(result.masterCase, newQuestions);
    } else {
        // Fallback if parsing returned nothing useful but maybe a case
        if (result.masterCase) {
           setMasterCase(result.masterCase);
           pushHistory(result.masterCase, questions);
        }
    }

    setIsParsing(false);
    setRawExamText(""); // Clear input on success
  };

  return (
    <div className="space-y-8 animate-fade-in relative">

      {/* Header with Logo and Save */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0B1120] dark:bg-slate-950 rounded flex items-center justify-center text-white relative overflow-hidden shadow-sm">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M2 17L12 22L22 17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <rect x="11" y="11" width="2" height="6" fill="#F59E0B" />
             </svg>
          </div>
          <h2 className="text-lg font-serif font-bold text-oxford-primary dark:text-white">
            {t.examConfig}
          </h2>
        </div>

        <div className="flex items-center gap-2">
            {/* Global Undo/Redo Controls */}
            <div className="bg-slate-50 dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-600 flex gap-1">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
                title="Undo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              </button>
              <div className="w-px bg-slate-200 dark:bg-slate-600 my-1"></div>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-colors"
                title="Redo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
              </button>
            </div>

            <button
              onClick={handleManualSave}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                showSaveConfirm 
                  ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' 
                  : 'bg-white dark:bg-slate-700 text-oxford-primary dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
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
        </div>
      </div>

      {/* SMART IMPORT SECTION - NEW FEATURE */}
      <section className="bg-[#0B1120] dark:bg-black p-6 rounded-xl shadow-lg border border-slate-800 relative overflow-hidden">
         {/* Decorative Background */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B] opacity-5 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="relative z-10">
            <h2 className="text-xl font-serif font-bold text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {t.smartImport.title}
            </h2>
            <p className="text-slate-400 text-sm mb-4">
                {t.smartImport.description}
            </p>
            
            <textarea
                className="w-full h-32 p-4 bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition text-sm mb-4"
                placeholder={t.smartImport.placeholder}
                value={rawExamText}
                onChange={(e) => setRawExamText(e.target.value)}
            />
            
            <button 
                onClick={handleSmartImport}
                disabled={isParsing || !rawExamText.trim()}
                className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1120] font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isParsing ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-[#0B1120]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.smartImport.processing}
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        {t.smartImport.button}
                    </>
                )}
            </button>
         </div>
      </section>

      {/* Master Case Section */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <h2 className="text-xl font-serif font-bold text-oxford-primary dark:text-white mb-4">{t.masterCase}</h2>
        <textarea
          className="w-full h-48 p-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-oxford-primary focus:border-transparent outline-none transition"
          placeholder={t.placeholders.case}
          value={masterCase}
          onChange={(e) => setMasterCase(e.target.value)}
          onBlur={handleMasterCaseBlur}
        />
      </section>

      {/* Questions Section */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif font-bold text-oxford-primary dark:text-white">{t.questions}</h2>
          <button 
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-oxford-primary text-white text-sm rounded hover:bg-opacity-90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            + {t.addQuestion}
          </button>
        </div>
        
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-600 group">
              <div className="flex flex-col gap-1 mt-2">
                 <span className="font-bold text-slate-400 dark:text-slate-500 text-xs">#{idx + 1}</span>
                 {/* Reordering Controls */}
                 <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleMoveQuestion(idx, 'up')} disabled={idx === 0} className="text-slate-400 hover:text-oxford-primary dark:hover:text-white disabled:opacity-20">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
                    </button>
                    <button onClick={() => handleMoveQuestion(idx, 'down')} disabled={idx === questions.length - 1} className="text-slate-400 hover:text-oxford-primary dark:hover:text-white disabled:opacity-20">
                       <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                 </div>
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder={t.placeholders.question}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded focus:border-oxford-primary hover:border-slate-400 hover:shadow-sm outline-none transition-all duration-200"
                  value={q.text}
                  onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)}
                  onBlur={handleQuestionBlur}
                />
              </div>
              <div className="w-24">
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">{t.maxWeight}</label>
                <input
                  type="number"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded focus:border-oxford-primary hover:border-slate-400 hover:shadow-sm outline-none transition-all duration-200"
                  value={q.maxWeight}
                  onChange={(e) => handleUpdateQuestion(q.id, 'maxWeight', parseInt(e.target.value) || 0)}
                  onBlur={handleQuestionBlur}
                />
              </div>
              <button 
                onClick={() => handleRemoveQuestion(q.id)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 mt-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-slate-400 text-center italic py-4">{t.noQuestions}</p>
          )}

          {/* New Question/Answers Preview after Import */}
          {questions.length > 0 && (
             <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                   Imported Answers Preview
                </h3>
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-lg p-4 text-sm text-green-800 dark:text-green-300">
                   <p className="font-bold mb-2">
                      ✓ Successfully imported {questions.length} questions.
                   </p>
                   <p>
                      Student answers have been loaded into Step 2 automatically. You can review them by clicking "Next Phase".
                   </p>
                </div>
             </div>
          )}
        </div>
        
        {/* Rubric Config */}
        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold text-oxford-primary dark:text-white">{t.rubric}</h2>
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                 <button 
                   onClick={() => toggleRubricType('quick')}
                   className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${rubric.type === 'quick' ? 'bg-white dark:bg-slate-600 shadow text-oxford-primary dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                 >
                   {t.quickRubric}
                 </button>
                 <button 
                   onClick={() => toggleRubricType('custom')}
                   className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${rubric.type === 'custom' ? 'bg-white dark:bg-slate-600 shadow text-oxford-primary dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                 >
                   {t.advancedRubric}
                 </button>
              </div>
           </div>

           {rubric.type === 'quick' ? (
               <div className="space-y-4">
                 <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                    <div className="col-span-4 md:col-span-3">{t.rubricUI.name}</div>
                    <div className="col-span-8 md:col-span-5">{t.rubricUI.description}</div>
                    <div className="col-span-6 md:col-span-3 text-center">{t.rubricUI.weight}</div>
                    <div className="col-span-6 md:col-span-1 text-right"></div>
                 </div>
                 
                 {rubric.items.map((item) => (
                    <div key={item.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg border transition-all ${item.enabled ? 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-60'}`}>
                       <div className="col-span-4 md:col-span-3">
                          <input 
                            className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 outline-none text-sm"
                            value={item.label}
                            onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                            disabled={!item.enabled}
                          />
                       </div>
                       <div className="col-span-8 md:col-span-5">
                          <input 
                            className="w-full bg-transparent text-slate-500 dark:text-slate-400 outline-none text-xs"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                            disabled={!item.enabled}
                          />
                       </div>
                       <div className="col-span-6 md:col-span-3 flex flex-col items-center gap-1">
                           <input 
                             type="range" 
                             min="1" 
                             max="10" 
                             value={item.weight}
                             onChange={(e) => handleUpdateItem(item.id, 'weight', parseInt(e.target.value))}
                             disabled={!item.enabled}
                             className={`w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer ${getSliderColorClass(item.weight)}`}
                           />
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBadgeColorClass(item.weight)}`}>
                              {getWeightLabel(item.weight)}
                           </span>
                       </div>
                       <div className="col-span-6 md:col-span-1 flex justify-end items-center gap-2">
                          <button 
                            onClick={() => handleToggleItem(item.id)}
                            className={`w-8 h-5 rounded-full p-1 transition-colors ${item.enabled ? 'bg-oxford-primary' : 'bg-slate-300'}`}
                          >
                             <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${item.enabled ? 'translate-x-3' : 'translate-x-0'}`}></div>
                          </button>
                          <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                       </div>
                    </div>
                 ))}
                 
                 <button 
                   onClick={handleAddCustomItem}
                   className="mt-4 text-xs font-bold text-oxford-primary dark:text-oxford-accent hover:underline flex items-center gap-1"
                 >
                   + {t.rubricUI.addCriterion}
                 </button>
               </div>
           ) : (
               <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
                     {t.rubricUI.customMode}
                  </label>
                  <textarea 
                    className="w-full h-32 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded p-3 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-oxford-primary outline-none"
                    placeholder={t.placeholders.customRubric}
                    value={rubric.customInstructions || ''}
                    onChange={(e) => setRubric({ ...rubric, customInstructions: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 mt-2 italic">
                     * The AI will prioritize your instructions above but still maintain baseline academic integrity (checking for legal hallucinations).
                  </p>
               </div>
           )}
        </div>
      </section>

      <div className="flex justify-end pt-8">
        <button
          onClick={() => setStep(2)}
          disabled={questions.length === 0}
          className="px-8 py-3 bg-oxford-primary text-white font-bold rounded-lg hover:bg-opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {t.next} &rarr;
        </button>
      </div>
    </div>
  );
};

export default Step1Config;
