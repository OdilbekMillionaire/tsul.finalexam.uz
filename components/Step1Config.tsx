import React from 'react';
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

  // Questions Logic
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: crypto.randomUUID(),
      text: '',
      maxWeight: 10
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (id: string, field: keyof Question, value: string | number) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
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
      weight: 10,
      maxWeight: 100, // Arbitrary high ceiling
      enabled: true
    };
    setRubric({ ...rubric, items: [...rubric.items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    setRubric({ ...rubric, items: rubric.items.filter(item => item.id !== id) });
  };

  const switchRubricType = (type: 'quick' | 'advanced') => {
    // If switching to advanced for the first time and empty, maybe copy quick items? 
    // For now, let's keep the state shared or reset. The prompt implies separate modes.
    // To keep it simple and safe: We use the same 'items' array but render differently.
    // Or we reset items if swapping. Let's reset to default if empty, or keep current.
    setRubric({ ...rubric, type });
  };

  const totalRubricWeight = rubric.items.filter(i => i.enabled).reduce((acc, curr) => acc + curr.weight, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Master Case Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-serif font-bold text-oxford-primary mb-4">{t.masterCase}</h2>
        <textarea
          className="w-full h-48 p-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-oxford-primary focus:border-transparent outline-none transition"
          placeholder={t.placeholders.case}
          value={masterCase}
          onChange={(e) => setMasterCase(e.target.value)}
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
                />
              </div>
              <div className="w-24">
                <label className="text-xs text-slate-500 block mb-1">{t.maxWeight}</label>
                <input
                  type="number"
                  className="w-full p-2 border border-slate-300 rounded focus:border-oxford-primary outline-none"
                  value={q.maxWeight}
                  onChange={(e) => handleUpdateQuestion(q.id, 'maxWeight', parseInt(e.target.value) || 0)}
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

        {/* Quick Rubric UI */}
        {rubric.type === 'quick' && (
          <div className="space-y-4">
            {rubric.items.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg border transition-all ${item.enabled ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 opacity-60 border-transparent'}`}>
                <div className="flex items-center gap-4 mb-2">
                  {/* Toggle Switch */}
                  <button 
                    onClick={() => handleToggleItem(item.id)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center ${item.enabled ? 'bg-oxford-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ${item.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                  
                  <span className={`flex-1 font-medium ${item.enabled ? 'text-slate-800' : 'text-slate-500'}`}>
                    {item.label}
                  </span>

                  <div className="flex items-center gap-3">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.rubricUI.weight}: {item.weight}</span>
                     <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                  </div>
                </div>
                
                {/* Slider */}
                {item.enabled && (
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={item.weight}
                      onChange={(e) => handleUpdateItem(item.id, 'weight', parseInt(e.target.value))}
                      className="w-full h-2 bg-oxford-primary/20 rounded-lg appearance-none cursor-pointer accent-oxford-primary"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <button 
               onClick={handleAddCustomItem}
               className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg hover:border-oxford-primary hover:text-oxford-primary transition font-bold text-sm"
            >
              + {t.rubricUI.addCriterion}
            </button>
          </div>
        )}

        {/* Advanced Rubric UI */}
        {rubric.type === 'advanced' && (
          <div className="space-y-6">
            {rubric.items.map((item, idx) => (
              <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-lg p-6 relative">
                 <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>

                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Mezon {idx + 1}</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                   <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">{t.rubricUI.name}</label>
                     <input
                        type="text"
                        className="w-full p-3 border border-slate-300 rounded focus:border-oxford-primary outline-none bg-white"
                        placeholder={t.placeholders.rubricName}
                        value={item.label}
                        onChange={(e) => handleUpdateItem(item.id, 'label', e.target.value)}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">{t.rubricUI.maxBall}</label>
                     <input
                        type="number"
                        className="w-full p-3 border border-slate-300 rounded focus:border-oxford-primary outline-none bg-white"
                        value={item.weight}
                        onChange={(e) => handleUpdateItem(item.id, 'weight', parseInt(e.target.value) || 0)}
                     />
                   </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.rubricUI.description}</label>
                    <input
                       type="text"
                       className="w-full p-3 border border-slate-300 rounded focus:border-oxford-primary outline-none bg-white"
                       placeholder={t.placeholders.rubricDesc}
                       value={item.description}
                       onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    />
                 </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-4">
              <button 
                 onClick={handleAddCustomItem}
                 className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded shadow-sm hover:bg-slate-50 transition"
              >
                + {t.rubricUI.addCriterion}
              </button>
              <div className="text-right">
                <span className="text-sm text-slate-500">{t.rubricUI.total}: </span>
                <span className="text-xl font-bold text-oxford-primary">{totalRubricWeight}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="flex justify-end pt-4">
        <button
          onClick={() => setStep(2)}
          disabled={!masterCase || questions.length === 0}
          className="px-8 py-3 bg-oxford-primary text-white font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
        >
          {t.next} &rarr;
        </button>
      </div>
    </div>
  );
};

export default Step1Config;