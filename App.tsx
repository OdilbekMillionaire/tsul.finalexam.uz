
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Step1Config from './components/Step1Config';
import Step2Execution from './components/Step2Execution';
import Step3Results from './components/Step3Results';
import AboutUs from './components/AboutUs';
import Dashboard from './components/Dashboard';
import Plans from './components/Plans';
import Login from './components/Login';
import Profile from './components/Profile';
import { ExamContextState, AppUser, Language, Question, Rubric, StudentAnswer, View, SUPPORTED_LANGUAGES, ChatMessage, SubscriptionTier } from './types';
import { TRANSLATIONS, RUBRIC_TEMPLATES, FREE_DAILY_LIMIT } from './constants';
import { getActiveSubscription } from './services/subscriptionService';
import { authService } from './services/authService';
import SplineRobot from './components/SplineRobot';

const ROUTE_MAP: Record<View, string> = {
  dashboard: '/',
  assessor: '/assessor',
  about: '/about',
  plans: '/plans',
  login: '/login',
  profile: '/profile',
};

const PATH_TO_VIEW: Record<string, View> = {
  '/': 'dashboard',
  '/assessor': 'assessor',
  '/about': 'about',
  '/plans': 'plans',
  '/login': 'login',
  '/profile': 'profile',
};

// --- Context Setup ---
const ExamContext = createContext<ExamContextState | undefined>(undefined);

export const useExamContext = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error("useExamContext must be used within an ExamProvider");
  return context;
};

// --- App Component ---
const App: React.FC = () => {
  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();
  const currentView: View = PATH_TO_VIEW[location.pathname] ?? 'dashboard';

  // Navigation helper — keeps context API identical for child components
  const setView = (v: View) => navigate(ROUTE_MAP[v]);

  // State initialization
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [language, setLanguage] = useState<Language>('uz-lat');
  const [masterCase, setMasterCase] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  // Initialize rubric with the default language template
  const [rubric, setRubric] = useState<Rubric>(RUBRIC_TEMPLATES['uz-lat']);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});

  // New State for Step 3 features
  const [overallFeedback, setOverallFeedback] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');

  // Usage Limiting State
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [usageDate, setUsageDate] = useState<string>(new Date().toDateString());

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Auth State
  const [user, setUser] = useState<AppUser | null>(null);

  // Single Sign-On auto-clear
  useEffect(() => {
    if (window.location.hash.includes('access_token=')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Theme Persistence & Effect
  useEffect(() => {
    // 1. Check local storage
    const savedTheme = localStorage.getItem('oxforder_theme');

    // Default to Light mode if no preference is saved, regardless of system preference
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('oxforder_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('oxforder_theme', 'light');
    }
  };

  // Auth Listener
  useEffect(() => {
    // Check current session
    authService.getCurrentUser().then(u => {
      setUser(u);
    });

    // Listen for changes
    const { data: { subscription } } = authService.onAuthStateChange((u) => {
      setUser(u);
      if (u) {
        // If we are on the login screen and user logs in, go to dashboard
        if (window.location.pathname === '/login') {
          navigate('/');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hydration Effect - Local Storage
  useEffect(() => {
    const saved = localStorage.getItem('oxforder_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMasterCase(parsed.masterCase || '');
        setQuestions(parsed.questions || []);
        setAnswers(parsed.answers || {}); // Hydrate answers
        if (parsed.rubric && parsed.rubric.items) {
          // Ensure customInstructions exists even if loading old state
          const hydratedRubric = {
            ...parsed.rubric,
            customInstructions: parsed.rubric.customInstructions || ''
          };
          setRubric(hydratedRubric);
        } else {
          setRubric(RUBRIC_TEMPLATES['uz-lat']);
        }
        if (parsed.overallFeedback) setOverallFeedback(parsed.overallFeedback);
        if (parsed.chatHistory) setChatHistory(parsed.chatHistory);

        // Optimistically set tier from local storage, then verify with DB below
        if (parsed.subscriptionTier) {
          setSubscriptionTier(parsed.subscriptionTier);
        }

        // Hydrate Usage Logic
        if (parsed.usageDate) {
          const today = new Date().toDateString();
          if (parsed.usageDate !== today) {
            // New day, reset count
            setDailyUsage(0);
            setUsageDate(today);
          } else {
            // Same day, keep count
            setDailyUsage(parsed.dailyUsage || 0);
            setUsageDate(parsed.usageDate);
          }
        }
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Hydration Effect - Database (Supabase Subscription)
  // Re-run this whenever the USER changes (logs in/out)
  useEffect(() => {
    const fetchSubscription = async () => {
      const activeTier = await getActiveSubscription();
      setSubscriptionTier(activeTier);
    };
    fetchSubscription();
  }, [user]);

  // Persistence Effect
  useEffect(() => {
    const stateToSave = {
      masterCase,
      questions,
      rubric,
      answers,
      overallFeedback,
      chatHistory,
      subscriptionTier,
      dailyUsage,
      usageDate
    };
    localStorage.setItem('oxforder_state', JSON.stringify(stateToSave));
  }, [masterCase, questions, rubric, answers, overallFeedback, chatHistory, subscriptionTier, dailyUsage, usageDate]);

  const t = TRANSLATIONS[language];

  // Actions

  // Custom setter for Master Case to clear feedback on change
  const handleSetMasterCase = (text: string) => {
    setMasterCase(text);
    setOverallFeedback(null);
  };

  // Custom setter for Questions to clear feedback on change
  const handleSetQuestions = (qs: Question[]) => {
    setQuestions(qs);
    setOverallFeedback(null);
  };

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
    // Clear overall feedback if answers change
    setOverallFeedback(null);
  };

  const setAssessment = (questionId: string, result: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], assessment: result }
    }));
    // Clear overall feedback if assessment results change
    setOverallFeedback(null);
  };

  const setAssessingStatus = (questionId: string, isAssessing: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], isAssessing }
    }));
  };

  const addChatMessage = (role: 'user' | 'model', text: string) => {
    setChatHistory(prev => [...prev, { role, text, timestamp: Date.now() }]);
  };

  const upgradeSubscription = (tier: SubscriptionTier) => {
    setSubscriptionTier(tier);
  };

  const logout = async () => {
    await authService.signOut();
    navigate('/');
  };

  const handleNewLesson = () => {
    if (window.confirm(t.confirmReset)) {
      setMasterCase('');
      setQuestions([]);
      setAnswers({});
      setOverallFeedback(null);
      setChatHistory([]);
      setStep(1);
      navigate('/assessor');
      // Reset rubric to the template of the current language
      setRubric(RUBRIC_TEMPLATES[language]);
      // We do NOT reset daily usage here, that is tied to the user/date, not the lesson session.
      localStorage.removeItem('oxforder_state');
      window.scrollTo(0, 0);
    }
  };

  const resetAnswers = () => {
    if (confirm("Are you sure you want to clear all student answers and grades? This keeps your Case and Questions for the next student.")) {
      setAnswers({});
      setOverallFeedback(null);
      setChatHistory([]);
      window.scrollTo(0, 0);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Language;
    setLanguage(newLang);
    // Switch the rubric to the new language's template
    setRubric(RUBRIC_TEMPLATES[newLang]);
  };

  // Usage Limit Logic
  const checkUsage = (): boolean => {
    if (subscriptionTier !== 'free') return true;
    return dailyUsage < FREE_DAILY_LIMIT;
  };

  const incrementUsage = () => {
    setDailyUsage(prev => prev + 1);
    setUsageDate(new Date().toDateString());
  };

  // Bulk Import
  const importExamData = (newCase: string, newQuestions: Question[], newAnswers: Record<string, StudentAnswer>) => {
    setMasterCase(newCase);
    setQuestions(newQuestions);
    setAnswers(newAnswers);

    // Clear any results from previous session
    setOverallFeedback(null);
    setChatHistory([]);
    setStep(1);
  };

  const contextValue: ExamContextState = {
    view: currentView,
    step,
    language,
    masterCase,
    questions,
    rubric,
    answers,
    overallFeedback,
    chatHistory,
    subscriptionTier,
    user,
    isDarkMode,
    toggleTheme,
    dailyUsage,
    setView,
    setStep,
    setLanguage,
    setMasterCase: handleSetMasterCase,
    setQuestions: handleSetQuestions,
    setRubric,
    updateAnswer,
    setAssessment,
    setAssessingStatus,
    setOverallFeedback,
    addChatMessage,
    resetAnswers,
    upgradeSubscription,
    logout,
    checkUsage,
    incrementUsage,
    importExamData
  };

  // New Logo SVG Component
  const Logo = () => (
    <div className="w-10 h-10 bg-[#0B1120] dark:bg-slate-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden shadow-lg border border-slate-700">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="11" y="11" width="2" height="6" fill="#F59E0B" />
      </svg>
    </div>
  );

  const handleFooterLinkClick = (name: string) => {
    alert(`${name} - This link is for demonstration purposes in the MVP.`);
  };

  return (
    <ExamContext.Provider value={contextValue}>
      <div className={`min-h-screen flex flex-col font-sans text-slate-800 dark:text-slate-100 bg-[#FAFAFA] dark:bg-slate-950 transition-colors duration-300`}>

        <SplineRobot />
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">

            {/* Brand */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setView('dashboard')}
            >
              <Logo />
              <div className="flex flex-col">
                <h1 className="text-xl font-serif font-bold text-[#0B1120] dark:text-white tracking-tight leading-none uppercase">
                  TSUL Finalizer
                </h1>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-bold text-[#F59E0B] tracking-[0.2em] uppercase">Law AI Assessor</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ml-1 tracking-wider border ${subscriptionTier === 'free'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    : 'bg-[#0B1120] dark:bg-slate-800 text-[#F59E0B] border-[#F59E0B]'
                    }`}>
                    {subscriptionTier === 'daily' && '24H PASS'}
                    {subscriptionTier === 'monthly' && 'PRO'}
                    {subscriptionTier === 'yearly' && 'ELITE'}
                    {subscriptionTier === 'free' && 'FREE'}
                  </span>

                  {/* Visual Credit Counter for Free Tier */}
                  {subscriptionTier === 'free' && (
                    <div className="hidden sm:flex items-center gap-1 ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700" title="Daily AI Credits Remaining">
                      <span className="text-xs">⚡</span>
                      <span className={`text-[10px] font-bold ${dailyUsage >= FREE_DAILY_LIMIT ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                        {FREE_DAILY_LIMIT - dailyUsage}/{FREE_DAILY_LIMIT}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nav & Tools */}
            <div className="flex items-center gap-6 md:gap-8">
              <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-3 py-2 rounded-md transition-colors ${currentView === 'dashboard' ? 'text-[#0B1120] dark:text-white font-bold bg-slate-50 dark:bg-slate-800' : 'hover:text-[#0B1120] dark:hover:text-white'}`}
                >
                  {t.nav.dashboard}
                </button>
                <button
                  onClick={() => setView('assessor')}
                  className={`px-3 py-2 rounded-md transition-colors ${currentView === 'assessor' ? 'text-[#0B1120] dark:text-white font-bold bg-slate-50 dark:bg-slate-800' : 'hover:text-[#0B1120] dark:hover:text-white'}`}
                >
                  {t.nav.assessor}
                </button>
                <button
                  onClick={() => setView('plans')}
                  className={`px-3 py-2 rounded-md transition-colors ${currentView === 'plans' ? 'text-[#0B1120] dark:text-white font-bold bg-slate-50 dark:bg-slate-800' : 'hover:text-[#0B1120] dark:hover:text-white'}`}
                >
                  {t.nav.plans}
                </button>
                {user ? (
                  <button
                    onClick={() => setView('profile')}
                    className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${currentView === 'profile' ? 'text-[#0B1120] dark:text-white font-bold bg-slate-50 dark:bg-slate-800' : 'hover:text-[#0B1120] dark:hover:text-white'}`}
                  >
                    {/* Mini Avatar */}
                    <div className="w-5 h-5 rounded-full bg-oxford-primary text-white text-[10px] flex items-center justify-center">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    {t.nav.profile}
                  </button>
                ) : (
                  <button
                    onClick={() => setView('login')}
                    className={`px-3 py-2 rounded-md transition-colors ${currentView === 'login' ? 'text-[#0B1120] dark:text-white font-bold bg-slate-50 dark:bg-slate-800' : 'hover:text-[#0B1120] dark:hover:text-white'}`}
                  >
                    {t.nav.login}
                  </button>
                )}
              </nav>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  /* Sun Icon */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  /* Moon Icon */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              {/* Language */}
              <select
                value={language}
                onChange={handleLanguageChange}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-transparent outline-none cursor-pointer hover:text-[#0B1120] dark:hover:text-white"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-800">{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/assessor" element={
              <>
                {/* Assessor Stepper */}
                <div className="mb-12 flex items-center justify-center">
                  <div className="flex items-center gap-4 text-sm font-semibold">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#0B1120] dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-[#0B1120] dark:bg-oxford-accent text-white dark:text-[#0B1120] border-[#0B1120] dark:border-oxford-accent' : 'border-slate-200 dark:border-slate-700'}`}>1</span>
                      <span className="hidden sm:inline">{t.step1}</span>
                    </div>
                    <div className="w-16 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#0B1120] dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-[#0B1120] dark:bg-oxford-accent text-white dark:text-[#0B1120] border-[#0B1120] dark:border-oxford-accent' : 'border-slate-200 dark:border-slate-700'}`}>2</span>
                      <span className="hidden sm:inline">{t.step2}</span>
                    </div>
                    <div className="w-16 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#0B1120] dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-[#0B1120] dark:bg-oxford-accent text-white dark:text-[#0B1120] border-[#0B1120] dark:border-oxford-accent' : 'border-slate-200 dark:border-slate-700'}`}>3</span>
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
                  <div className="flex justify-center mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
                    <button
                      onClick={handleNewLesson}
                      className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 underline"
                    >
                      {t.resetSession}
                    </button>
                  </div>
                )}
              </>
            } />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-[#0B1120] dark:bg-black text-slate-400 py-16 border-t border-slate-800 dark:border-slate-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

              {/* Column 1: Brand & Info Cards (Span 5) */}
              <div className="md:col-span-5 space-y-8">
                <div>
                  <h3 className="text-white text-xl font-serif font-bold tracking-wide">OXFORDER LLC</h3>
                  <p className="text-sm text-slate-500 mt-1">Leading AI LegalTech in Central Asia.</p>
                </div>

                {/* Founder Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">Founder Information</h4>
                    <p className="text-xs text-slate-400 mt-1">Founded by an Oxford University Law Magistrant.</p>
                  </div>
                </div>

                {/* Partner Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold">INSTITUTIONAL PARTNER</h4>
                    <p className="text-xs text-slate-400 mt-1">Proudly supporting students and faculty at <span className="text-white font-medium">Tashkent State University of Law (TSUL)</span>.</p>
                  </div>
                </div>
              </div>

              {/* Column 2: Legal & Contact (Span 3) */}
              <div className="md:col-span-3 space-y-6">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">LEGAL & CONTACT</h4>
                <ul className="space-y-3 text-sm">
                  <li><button onClick={() => handleFooterLinkClick('Privacy Policy')} className="hover:text-white transition-colors">{t.footer.privacy}</button></li>
                  <li><button onClick={() => handleFooterLinkClick('Terms of Service')} className="hover:text-white transition-colors">{t.footer.terms}</button></li>
                </ul>

                <a href="mailto:ceo@oxforder.uz" className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors text-slate-300 hover:text-white w-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  ceo@oxforder.uz
                </a>
              </div>

              {/* Column 3: Technology (Span 4) */}
              <div className="md:col-span-4 space-y-6">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">TECHNOLOGY</h4>
                <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
                  {/* Glow effect */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-6 h-6 text-blue-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" /></svg>
                      <h3 className="text-white font-bold text-lg">OXFORDER AI</h3>
                    </div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">PROPRIETARY AI ENGINE</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Powered by OXFORDER AI's proprietary engine for precise legal analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
              <p>© 2026 OXFORDER LLC. All rights reserved.</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                Tashkent, Uzbekistan
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ExamContext.Provider>
  );
};

export default App;
