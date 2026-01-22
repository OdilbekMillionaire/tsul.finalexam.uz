import React, { useState, useEffect } from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';
import { Question, RubricItem } from '../types';

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

  // --- Undo/Redo History Logic ---
  const [history, setHistory] = useState<{ c: string; q: Question[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

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
      weight: 5,
      maxWeight: 10,
      enabled: true
    };
    setRubric({ ...rubric, items: [...rubric.items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    setRubric({ ...rubric, items: rubric.items.filter(item => item.id !== id) });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === rubric.items.length - 1)) return;
    
    const newItems = [...rubric.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    // Swap elements
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    setRubric({ ...rubric, items: newItems });
  };

  const switchRubricType = (type: 'quick' | 'advanced') => {
    setRubric({ ...rubric, type });
  };

  const totalRubricWeight = rubric.items.filter(i => i.enabled).reduce((acc, curr) => acc + curr.weight, 0);

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Global Undo/Redo Controls */}
      <div className="flex items-center justify-end gap-2 sticky top-24 z-20 pointer-events-none">
        <div className="bg-white p-1 rounded-lg shadow-md border border-slate-200 flex gap-1 pointer-events-auto">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition-colors"
            title="Undo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          </button>
          <div className="w-px bg-slate-200 my-1"></div>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition-colors"
            title="Redo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* Master Case Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-serif font-bold text-oxford-primary mb-4">{t.masterCase}</h2>
        <textarea
          className="w-full h-48 p-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-oxford-primary focus:border-transparent outline-none transition"
          placeholder={t.placeholders.case}
          value={masterCase}
          onChange={(e) => setMasterCase(e.target.value)}
          onBlur={handleMasterCaseBlur}
        />
      </section>

      {/* Questions Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif font-bold text-oxford-primary">{t.questions}</h2>
          <button 
            onClick={handleAddQuestion}
            className="px-4 py-2 bg-oxford-primary text-white text-sm rounded hover:bg-opacity-90 transition"
          >
            + {t.addQuestion}
          </button>
        </div>
        
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="flex gap-4 items-start p-4 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold text-slate-400 mt-2">#{idx + 1}</span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder={t.placeholders.question}
                  className="w-full p-2 border border-slate-300 rounded focus:border-oxford-primary outline-none"
                  value={q.text}
                  onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)}
                  onBlur={handleQuestionBlur}
                />
              </div>
              <div className="w-24">
                <label className="text-xs text-slate-500 block mb-1">{t.maxWeight}</label>
                <input
                  type="number"
                  className="w-full p-2 border border-slate-300 rounded focus:border-oxford-primary outline-none"
                  value={q.maxWeight}
                  onChange={(e) => handleUpdateQuestion(q.id, 'maxWeight', parseInt(e.target.value) || 0)}
                  onBlur={handleQuestionBlur}
                />
              </div>
              <button 
                onClick={() => handleRemoveQuestion(q.id)}
                className="text-red-500 hover:text-red-700 mt-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-slate-400 text-center italic py-4">No questions added yet.</p>
          )}
        </div>
      </section>

      {/* Rubric Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-serif font-bold text-oxford-primary mb-4">{t.rubric}</h2>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6 border border-slate-200">
          <button
            onClick={() => switchRubricType('quick')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              rubric.type === 'quick' 
                ? 'bg-white text-oxford-primary shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.quickRubric}
          </button>
          <button
            onClick={() => switchRubricType('advanced')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
              rubric.type === 'advanced' 
                ? 'bg-white text-oxford-primary shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.advancedRubric}
          </button>
        </div>

        {/* Quick Rubric UI (Slimmed Down & Editable) */}
        {rubric.type === 'quick' && (
          <div className="space-y-3">
            {rubric.items.map((item) => (
              <div key={item.id} className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${item.enabled ? 'bg-white border-slate-200 border-l-4 border-l-[#E3D39E] shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
                
                {/* Toggle Switch */}
                <button 
                  onClick={() => handleToggleItem(item.id)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center flex-shrink-0 ${item.enabled ? 'bg-oxford-primary' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                
                {/* Editable Label */}
                <input 
                  type="text"
                  value={item.label}
                  onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                  disabled={!item.enabled}
                  className={`flex-1 text-sm font-semibold border-b border-transparent focus:border-oxford-primary focus:bg-slate-50 outline-none transition-colors ${item.enabled ? 'text-slate-800' : 'text-slate-500'}`}
                  placeholder={t.placeholders.rubricName}
                />

                {/* Slider (Slim) */}
                {item.enabled && (
                  <div className="w-24 md:w-48 flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={item.weight}
                      onChange={(e) => handleUpdateItem(item.id, 'weight', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-oxford-primary"
                    />
                    <span className="w-6 text-center text-xs font-bold text-oxford-primary bg-slate-100 rounded px-1 py-0.5">{item.weight}</span>
                  </div>
                )}

                {/* Delete (Subtle) */}
                <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title={t.rubricUI.delete}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                 <button 
                     onClick={handleAddCustomItem}
                     className="text-xs font-bold text-slate-500 hover:text-oxford-primary border border-dashed border-slate-300 hover:border-oxford-primary px-3 py-1.5 rounded transition-colors"
                  >
                    + {t.rubricUI.addCriterion}
                 </button>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">{t.rubricUI.total}:</span>
                    <span className="text-lg font-bold text-oxford-primary">{totalRubricWeight}</span>
                </div>
            </div>
          </div>
        )}

        {/* Advanced Rubric UI (Slimmed Down) */}
        {rubric.type === 'advanced' && (
          <div className="space-y-3">
            {rubric.items.map((item, idx) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-md p-3 shadow-sm hover:border-slate-300 transition-colors">
                 
                 {/* Top Row: Controls & Main Inputs */}
                 <div className="flex items-start gap-4 mb-2">
                    {/* Move/Drag Handles */}
                    <div className="flex flex-col gap-0.5 mt-2">
                        <button onClick={() => handleMoveItem(idx, 'up')} disabled={idx === 0} className="text-slate-400 hover:text-oxford-primary disabled:opacity-20"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg></button>
                        <button onClick={() => handleMoveItem(idx, 'down')} disabled={idx === rubric.items.length - 1} className="text-slate-400 hover:text-oxford-primary disabled:opacity-20"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg></button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Name Input */}
                        <div className="md:col-span-3">
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">{t.rubricUI.name}</label>
                            <input
                                type="text"
                                className="w-full text-sm font-medium text-slate-800 border-b border-slate-200 focus:border-oxford-primary outline-none py-1 bg-transparent transition-colors"
                                placeholder={t.placeholders.rubricName}
                                value={item.label}
                                onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                            />
                        </div>
                        {/* Weight Input */}
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">{t.rubricUI.maxBall}</label>
                            <input
                                type="number"
                                className="w-full text-sm font-bold text-oxford-primary border-b border-slate-200 focus:border-oxford-primary outline-none py-1 bg-transparent transition-colors"
                                value={item.weight}
                                onChange={(e) => handleUpdateItem(item.id, 'weight', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    {/* Delete */}
                    <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-300 hover:text-red-500 mt-2 p-1"
                    >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>

                 {/* Bottom Row: Description */}
                 <div className="pl-7">
                    <textarea
                       className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded p-2 focus:ring-1 focus:ring-oxford-primary/20 focus:border-oxford-primary/20 outline-none h-12 min-h-[3rem] resize-y placeholder:italic"
                       placeholder={t.placeholders.rubricDesc}
                       value={item.description}
                       onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    />
                 </div>
              </div>
            ))}

            <div className="flex flex-col md:flex-row items-center justify-between pt-4 gap-4 sticky bottom-0 bg-white/95 backdrop-blur py-4 border-t border-slate-100 z-10">
              <button 
                 onClick={handleAddCustomItem}
                 className="px-4 py-2 bg-white border border-dashed border-slate-300 text-slate-600 text-sm font-bold rounded hover:border-oxford-primary hover:text-oxford-primary hover:bg-slate-50 transition w-full md:w-auto"
              >
                + {t.rubricUI.addCriterion}
              </button>
              
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.rubricUI.total}:</span>
                <span className="text-xl font-bold text-oxford-primary">{totalRubricWeight}</span>
              </div>
            </div>
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