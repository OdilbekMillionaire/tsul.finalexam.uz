
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
import SettingsPage from './components/SettingsPage';
import { ExamContextState, AppUser, Language, Question, Rubric, StudentAnswer, View, SUPPORTED_LANGUAGES, ChatMessage, SubscriptionTier } from './types';
import { TRANSLATIONS, RUBRIC_TEMPLATES, FREE_DAILY_LIMIT } from './constants';
import { getActiveSubscription } from './services/subscriptionService';
import { authService } from './services/authService';

const ROUTE_MAP: Record<View, string> = {
  dashboard: '/',
  assessor: '/assessor',
  about: '/about',
  plans: '/plans',
  login: '/login',
  profile: '/profile',
  settings: '/settings',
};

const PATH_TO_VIEW: Record<string, View> = {
  '/': 'dashboard',
  '/assessor': 'assessor',
  '/about': 'about',
  '/plans': 'plans',
  '/login': 'login',
  '/profile': 'profile',
  '/settings': 'settings',
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
                  <>
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
                    <button
                      onClick={() => setView('settings')}
                      title="Settings"
                      className={`p-2 rounded-md transition-colors ${currentView === 'settings' ? 'text-[#0B1120] dark:text-white font-bold bg-slate-50 dark:bg-slate-800' : 'hover:text-[#0B1120] dark:hover:text-white'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </>
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
            <Route path="/settings" element={<SettingsPage />} />
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
        <footer className="bg-[#0B1120] text-slate-400 border-t border-slate-800">
          {/* Top Banner */}
          <div className="border-b border-slate-800 py-8">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-white text-xl font-serif font-bold">Ready to ace your exam?</h2>
                <p className="text-slate-400 text-sm mt-1">Start your AI-powered assessment in seconds.</p>
              </div>
              <button
                onClick={() => setView('assessor')}
                className="flex items-center gap-2 px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1120] font-bold rounded-xl transition-colors text-sm shrink-0"
              >
                Start Assessment
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

              {/* Col 1: Brand */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 17L12 22L22 17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12L12 17L22 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-serif font-bold text-lg uppercase tracking-tight">TSUL Finalizer</h3>
                    <p className="text-[10px] text-[#F59E0B] font-bold tracking-[0.15em] uppercase">by Oxforder LLC</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  The leading AI-powered legal exam assessment platform for Tashkent State University of Law students.
                </p>
                {/* Trust Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 font-medium">
                    <svg className="w-3.5 h-3.5 text-[#F59E0B]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" /></svg>
                    OXFORDER AI
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 font-medium">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                    Supabase
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 font-medium">
                    <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
                    React 19
                  </span>
                </div>
              </div>

              {/* Col 2: Platform Links */}
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Platform</h4>
                <ul className="space-y-3">
                  <li>
                    <button onClick={() => setView('dashboard')} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setView('assessor')} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      AI Assessor
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setView('about')} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      About
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setView('plans')} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                      Pricing
                    </button>
                  </li>
                </ul>
              </div>

              {/* Col 3: Legal */}
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Legal</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  TSUL Finalizer is an AI-based academic assistant. Generated content is for informational purposes only and does not constitute professional legal advice. All assessments are AI-generated and should be reviewed by qualified educators.
                </p>
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <span className="text-xs font-bold text-emerald-400">GDPR Compliant</span>
                </div>
                <ul className="space-y-2 text-xs">
                  <li><button onClick={() => handleFooterLinkClick('Privacy Policy')} className="text-slate-500 hover:text-white transition-colors">{t.footer.privacy}</button></li>
                  <li><button onClick={() => handleFooterLinkClick('Terms of Service')} className="text-slate-500 hover:text-white transition-colors">{t.footer.terms}</button></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
              <p>© 2025 Oxforder MCHJ · All rights reserved</p>
              <div className="flex items-center gap-2">
                <span>Powered by</span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-white font-bold">OXFORDER AI</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ExamContext.Provider>
  );
};

export default App;
