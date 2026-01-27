
import React, { useState, useEffect } from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';
import { Question, RubricItem } from '../types';
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
    setStep 
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
    
    const result = await parseExamContent(rawExamText);
    
    if (result.masterCase) {
        setMasterCase(result.masterCase);
    }

    if (result.questions && result.questions.length > 0) {
        const newQuestions = result.questions.map(qText => ({
            id: crypto.randomUUID(),
            text: qText,
            maxWeight: 10 // Default weight, user can edit
        }));
        setQuestions(newQuestions);
        pushHistory(result.masterCase || masterCase, newQuestions);
    } else {
        // Even if no questions found, push history if case changed
        if (result.masterCase) {
           pushHistory(result.masterCase, questions);
        }
    }

    setIsParsing(false);
    // Optionally clear raw text or keep it
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
        </div>
      </section>

      {/* Rubric Section */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <h2 className="text-xl font-serif font-bold text-oxford-primary dark:text-white">{t.rubric}</h2>
           
           {/* Rubric Type Toggle */}
           <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg self-start md:self-auto">
              <button 
                onClick={() => toggleRubricType('quick')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${rubric.type === 'quick' ? 'bg-white dark:bg-slate-800 shadow text-oxford-primary dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {t.rubricUI.structuredMode}
              </button>
              <button 
                onClick={() => toggleRubricType('custom')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${rubric.type === 'custom' ? 'bg-white dark:bg-slate-800 shadow text-oxford-primary dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {t.rubricUI.customMode}
              </button>
           </div>
        </div>
        
        {rubric.type === 'quick' ? (
           /* Simplified Quick Rubric UI (Existing) */
           <div className="flex flex-col gap-2 animate-fade-in">
            {rubric.items.map((item) => (
              <div 
                key={item.id} 
                className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  item.enabled 
                    ? 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md' 
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                
                {/* Tooltip on Hover */}
                {item.description && (
                  <div className="absolute left-10 -top-8 bg-[#0B1120] text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-64 shadow-xl border border-slate-700">
                    {item.description}
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#0B1120] rotate-45"></div>
                  </div>
                )}

                {/* Toggle Switch (Compact) */}
                <button 
                  onClick={() => handleToggleItem(item.id)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center flex-shrink-0 ${item.enabled ? 'bg-oxford-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${item.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                
                {/* Editable Label */}
                <div className="flex-1 min-w-0">
                    <input 
                      type="text"
                      value={item.label}
                      onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                      disabled={!item.enabled}
                      className={`w-full text-base font-medium bg-transparent border-none focus:ring-0 outline-none truncate transition-colors ${item.enabled ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}
                      placeholder={t.placeholders.rubricName}
                    />
                    {item.description && <p className="text-xs text-slate-400 dark:text-slate-400 truncate hidden md:block">{item.description}</p>}
                </div>

                {/* Redesigned Weighting Controls */}
                <div className={`flex items-center gap-4 transition-opacity duration-200 ml-4 ${item.enabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    
                    {/* Visual Weight Slider with Badge */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-600">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{t.rubricUI.weight}</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={item.weight}
                        onChange={(e) => handleUpdateItem(item.id, 'weight', parseInt(e.target.value))}
                        className={`w-24 h-2 rounded-lg appearance-none cursor-pointer transition-colors ${getSliderColorClass(item.weight)}`}
                      />
                      <div className={`px-2 py-1 min-w-[60px] flex items-center justify-center rounded-md border font-bold text-xs uppercase ${getBadgeColorClass(item.weight)}`}>
                          {getWeightLabel(item.weight)}
                      </div>
                    </div>

                    {/* Delete (Subtle) */}
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-300 dark:text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                      title={t.rubricUI.delete}
                  >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-slate-700">
                  <button 
                      onClick={handleAddCustomItem}
                      className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-oxford-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 hover:border-oxford-primary dark:hover:border-white px-3 py-1.5 rounded transition-all flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {t.rubricUI.addCriterion}
                  </button>
            </div>
          </div>
        ) : (
          /* Custom Instructions Textarea */
          <div className="animate-fade-in">
             <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-4">
               <div className="flex gap-3">
                 <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                 </div>
                 <div className="text-sm text-yellow-700 dark:text-yellow-300">
                   <p className="font-bold mb-1">Teacher Instructions</p>
                   <p>Paste your "me'zons", grading rules, or specific criteria here. The AI will strictly prioritize these instructions over its default logic.</p>
                 </div>
               </div>
             </div>
             <textarea
                className="w-full h-48 p-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-oxford-primary focus:border-transparent outline-none transition font-mono text-sm"
                placeholder={t.placeholders.customRubric}
                value={rubric.customInstructions || ''}
                onChange={(e) => setRubric({ ...rubric, customInstructions: e.target.value })}
             />
          </div>
        )}
      </section>

      <div className="flex justify-end pt-4 pb-12">
        <button
          onClick={() => setStep(2)}
          disabled={!masterCase || questions.length === 0}
          className="px-8 py-3 bg-oxford-primary text-white font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg flex items-center gap-2"
        >
          {t.next} 
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default Step1Config;
