import React, { createContext, useContext, useState, useEffect } from 'react';
import Step1Config from './components/Step1Config';
import Step2Execution from './components/Step2Execution';
import Step3Results from './components/Step3Results';
import AboutUs from './components/AboutUs';
import Dashboard from './components/Dashboard';
import { ExamContextState, Language, Question, Rubric, StudentAnswer, View, SUPPORTED_LANGUAGES } from './types';
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
  // State initialization
  const [view, setView] = useState<View>('dashboard');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [language, setLanguage] = useState<Language>('uz-lat');
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

  const handleNewLesson = () => {
    if (confirm("Are you sure you want to start a new lesson? All current data will be lost.")) {
      setMasterCase('');
      setQuestions([]);
      setAnswers({});
      setStep(1);
      setView('assessor');
      localStorage.removeItem('oxforder_state');
    }
  };

  const t = TRANSLATIONS[language];

  const contextValue: ExamContextState = {
    view,
    step,
    language,
    masterCase,
    questions,
    rubric,
    answers,
    setView,
    setStep,
    setLanguage,
    setMasterCase,
    setQuestions,
    setRubric,
    updateAnswer,
    setAssessment,
    setAssessingStatus
  };

  // New Logo SVG Component
  const Logo = () => (
    <div className="w-10 h-10 bg-[#0B1120] rounded-lg flex items-center justify-center text-white relative overflow-hidden shadow-lg border border-slate-700">
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         <path d="M2 17L12 22L22 17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         <path d="M2 12L12 17L22 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         <rect x="11" y="11" width="2" height="6" fill="#F59E0B" />
       </svg>
    </div>
  );

  return (
    <ExamContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#FAFAFA]">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            
            {/* Brand */}
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => setView('dashboard')}
            >
              <Logo />
              <div className="flex flex-col">
                <h1 className="text-xl font-serif font-bold text-[#0B1120] tracking-tight leading-none uppercase">
                  TSUL Finalizer
                </h1>
                <span className="text-[10px] font-bold text-[#F59E0B] tracking-[0.2em] uppercase">Law AI Assessor</span>
              </div>
            </div>

            {/* Nav & Tools */}
            <div className="flex items-center gap-8">
              <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600">
                <button 
                  onClick={() => setView('dashboard')}
                  className={`px-3 py-2 rounded-md transition-colors ${view === 'dashboard' ? 'text-[#0B1120] font-bold bg-slate-50' : 'hover:text-[#0B1120]'}`}
                >
                  {t.nav.dashboard}
                </button>
                <button 
                  onClick={() => setView('assessor')}
                  className={`px-3 py-2 rounded-md transition-colors ${view === 'assessor' ? 'text-[#0B1120] font-bold bg-slate-50' : 'hover:text-[#0B1120]'}`}
                >
                  {t.nav.assessor}
                </button>
                <button 
                  onClick={() => setView('about')}
                  className={`px-3 py-2 rounded-md transition-colors ${view === 'about' ? 'text-[#0B1120] font-bold bg-slate-50' : 'hover:text-[#0B1120]'}`}
                >
                  {t.nav.about}
                </button>
              </nav>

              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

              {/* Language */}
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="text-sm font-medium text-slate-600 bg-transparent outline-none cursor-pointer hover:text-[#0B1120]"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          
          {view === 'dashboard' && <Dashboard />}
          
          {view === 'assessor' && (
            <>
              {/* Assessor Stepper */}
              <div className="mb-12 flex items-center justify-center">
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#0B1120]' : 'text-slate-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-[#0B1120] text-white border-[#0B1120]' : 'border-slate-200'}`}>1</span>
                    <span className="hidden sm:inline">{t.step1}</span>
                  </div>
                  <div className="w-16 h-px bg-slate-200"></div>
                  <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#0B1120]' : 'text-slate-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-[#0B1120] text-white border-[#0B1120]' : 'border-slate-200'}`}>2</span>
                    <span className="hidden sm:inline">{t.step2}</span>
                  </div>
                  <div className="w-16 h-px bg-slate-200"></div>
                  <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#0B1120]' : 'text-slate-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-[#0B1120] text-white border-[#0B1120]' : 'border-slate-200'}`}>3</span>
                    <span className="hidden sm:inline">{t.step3}</span>
                  </div>
                </div>
              </div>

              {/* Assessor Steps */}
              {step === 1 && <Step1Config />}
              {step === 2 && <Step2Execution />}
              {step === 3 && <Step3Results />}
              
              {/* Reset/New Lesson Button for Assessor view */}
              {questions.length > 0 && (
                <div className="flex justify-center mt-12 border-t border-slate-200 pt-8">
                    <button 
                        onClick={handleNewLesson} 
                        className="text-xs text-red-500 hover:text-red-700 underline"
                    >
                        Reset current session
                    </button>
                </div>
              )}
            </>
          )}

          {view === 'about' && <AboutUs />}

        </main>
        
        {/* Footer */}
        <footer className="bg-[#0B1120] text-slate-400 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between gap-12">
              
              {/* Brand Col */}
              <div className="max-w-xs">
                <div className="flex items-center gap-3 mb-4 text-white">
                  <Logo />
                  <span className="text-xl font-serif font-bold uppercase">TSUL Finalizer</span>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  {t.dashboard.heroSubtitle}
                </p>
              </div>

              {/* Links Col */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6">{t.footer.platform}</h4>
                <ul className="space-y-3 text-sm">
                  <li><button onClick={() => setView('dashboard')} className="hover:text-white transition">{t.nav.dashboard}</button></li>
                  <li><button onClick={() => setView('assessor')} className="hover:text-white transition">{t.nav.assessor}</button></li>
                  <li><button onClick={() => setView('about')} className="hover:text-white transition">{t.nav.about}</button></li>
                </ul>
              </div>

              {/* Legal Col */}
              <div className="max-w-sm">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6">{t.about.legalTitle}</h4>
                <div className="pl-4 border-l-2 border-[#F59E0B]">
                  <p className="text-sm leading-relaxed text-slate-400">
                    {t.about.legalText}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
              <p>{t.footer.rights}</p>
              <div className="flex gap-6">
                <span className="hover:text-white cursor-pointer">{t.footer.privacy}</span>
                <span className="hover:text-white cursor-pointer">{t.footer.terms}</span>
                <span className="hover:text-white cursor-pointer">{t.footer.support}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ExamContext.Provider>
  );
};

export default App;