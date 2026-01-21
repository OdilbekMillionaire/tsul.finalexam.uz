import React, { createContext, useContext, useState, useEffect } from 'react';
import Step1Config from './components/Step1Config';
import Step2Execution from './components/Step2Execution';
import Step3Results from './components/Step3Results';
import { ExamContextState, Language, Question, Rubric, StudentAnswer, SUPPORTED_LANGUAGES } from './types';
import { TRANSLATIONS, DEFAULT_RUBRIC } from './constants';

// --- Context Setup ---
const ExamContext = createContext<ExamContextState | undefined>(undefined);

export const useExamContext = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error("useExamContext must be used within an ExamProvider");
  return context;
};

// --- App Component ---
const App: React.FC = () => {
  // State initialization (trying to load from localStorage first)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [language, setLanguage] = useState<Language>('en');
  const [masterCase, setMasterCase] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rubric, setRubric] = useState<Rubric>(DEFAULT_RUBRIC);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});

  // Hydration Effect
  useEffect(() => {
    const saved = localStorage.getItem('oxforder_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMasterCase(parsed.masterCase || '');
        setQuestions(parsed.questions || []);
        
        // Safety check for rubric type migration (string -> object)
        if (parsed.rubric && parsed.rubric.items) {
           setRubric(parsed.rubric);
        } else {
           setRubric(DEFAULT_RUBRIC);
        }
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Persistence Effect
  useEffect(() => {
    const stateToSave = { masterCase, questions, rubric };
    localStorage.setItem('oxforder_state', JSON.stringify(stateToSave));
  }, [masterCase, questions, rubric]);

  // Actions
  const updateAnswer = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        text,
        isAssessing: prev[questionId]?.isAssessing || false
      }
    }));
  };

  const setAssessment = (questionId: string, result: any) => {
     setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], assessment: result }
    }));
  };

  const setAssessingStatus = (questionId: string, isAssessing: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], isAssessing }
    }));
  };

  const t = TRANSLATIONS[language];

  const contextValue: ExamContextState = {
    step,
    language,
    masterCase,
    questions,
    rubric,
    answers,
    setStep,
    setLanguage,
    setMasterCase,
    setQuestions,
    setRubric,
    updateAnswer,
    setAssessment,
    setAssessingStatus
  };

  return (
    <ExamContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col font-sans text-slate-800">
        
        {/* Header */}
        <header className="bg-oxford-primary text-white border-b-4 border-oxford-accent shadow-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-oxford-accent rounded-sm flex items-center justify-center text-oxford-primary font-serif font-bold text-xl shadow-inner">
                Ox
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-serif font-bold tracking-tight">Oxforder <span className="text-oxford-accent font-light">Final-Grade</span></h1>
                <p className="text-xs text-slate-300 font-light tracking-wide">
                  {t.slogan_pre}
                  <s className="text-oxford-secondary decoration-oxford-secondary font-semibold decoration-2 opacity-80">{t.slogan_strike}</s>
                  {t.slogan_post}
                </p>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex bg-oxford-primary/50 p-1 rounded-lg border border-white/10">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                    language === lang.code 
                      ? 'bg-white text-oxford-primary shadow' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
          
          {/* Progress Stepper */}
          <div className="mb-10 flex items-center justify-center">
            <div className="flex items-center gap-4 text-sm font-semibold">
               <div className={`flex items-center gap-2 ${step >= 1 ? 'text-oxford-primary' : 'text-slate-400'}`}>
                 <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-oxford-primary text-white border-oxford-primary' : 'border-slate-300'}`}>1</span>
                 <span className="hidden sm:inline">{t.step1}</span>
               </div>
               <div className="w-12 h-0.5 bg-slate-200"></div>
               <div className={`flex items-center gap-2 ${step >= 2 ? 'text-oxford-primary' : 'text-slate-400'}`}>
                 <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-oxford-primary text-white border-oxford-primary' : 'border-slate-300'}`}>2</span>
                 <span className="hidden sm:inline">{t.step2}</span>
               </div>
               <div className="w-12 h-0.5 bg-slate-200"></div>
               <div className={`flex items-center gap-2 ${step >= 3 ? 'text-oxford-primary' : 'text-slate-400'}`}>
                 <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-oxford-primary text-white border-oxford-primary' : 'border-slate-300'}`}>3</span>
                 <span className="hidden sm:inline">{t.step3}</span>
               </div>
            </div>
          </div>

          {/* Steps */}
          {step === 1 && <Step1Config />}
          {step === 2 && <Step2Execution />}
          {step === 3 && <Step3Results />}

        </main>
        
        <footer className="py-6 text-center text-slate-400 text-xs border-t border-slate-200 mt-auto">
          <p>&copy; {new Date().getFullYear()} Oxforder Academic Systems. Powered by Gemini Pro 1.5 & Google Cloud.</p>
        </footer>
      </div>
    </ExamContext.Provider>
  );
};

export default App;