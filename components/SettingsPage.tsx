
import React, { useState, useEffect } from 'react';
import { useExamContext } from '../App';
import { Language } from '../types';

const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'uz-lat', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'uz-cyr', label: 'Ўзбекча', flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const SETTINGS_KEY = 'finalexam_settings';

interface AppSettings {
  defaultWordLimit: number;
}

const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as AppSettings;
  } catch {
    // ignore
  }
  return { defaultWordLimit: 300 };
};

const saveSettings = (s: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
};

const SettingsPage: React.FC = () => {
  const {
    language,
    setLanguage,
    isDarkMode,
    toggleTheme,
    user,
    logout,
    setView,
    setOverallFeedback,
  } = useExamContext();

  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [wordLimitInput, setWordLimitInput] = useState<string>(String(loadSettings().defaultWordLimit));
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setWordLimitInput(String(settings.defaultWordLimit));
  }, []);

  const handleWordLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWordLimitInput(e.target.value);
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num > 0) {
      const updated = { ...settings, defaultWordLimit: num };
      setSettings(updated);
      saveSettings(updated);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all assessment history? This cannot be undone.')) {
      localStorage.removeItem('oxforder_state');
      setOverallFeedback(null);
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    }
  };

  const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-5">
      <div className="p-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg">{icon}</div>
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">{title}</h2>
    </div>
  );

  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in font-sans">
      <div className="mb-8 flex items-center gap-3">
        <button
          onClick={() => setView('dashboard')}
          className="p-2 rounded-lg text-slate-400 hover:text-[#0B1120] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0B1120] dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your preferences and account</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Language Section */}
        <Card>
          <SectionHeader
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            }
            title="Language"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => setLanguage(opt.code)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                  language === opt.code
                    ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#0B1120] dark:text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <span className="text-2xl">{opt.flag}</span>
                <span>{opt.label}</span>
                {language === opt.code && (
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Appearance Section */}
        <Card>
          <SectionHeader
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
            title="Appearance"
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">Dark Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Toggle between light and dark theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                isDarkMode ? 'bg-[#F59E0B]' : 'bg-slate-200 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Assessment Defaults Section */}
        <Card>
          <SectionHeader
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title="Assessment Defaults"
          />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Default Word Limit
              </label>
              <p className="text-xs text-slate-400 mb-3">Maximum words expected per student answer</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={50}
                  max={5000}
                  step={50}
                  value={wordLimitInput}
                  onChange={handleWordLimitChange}
                  className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] transition-colors"
                />
                <span className="text-sm text-slate-400">words</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Data Management Section */}
        <Card>
          <SectionHeader
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8 4s8 1.79 8 4" />
              </svg>
            }
            title="Data Management"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">Clear Assessment History</p>
              <p className="text-xs text-slate-400 mt-0.5">Removes all saved answers, feedback, and chat history</p>
            </div>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-sm rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear History
            </button>
          </div>
          {cleared && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              History cleared successfully.
            </div>
          )}
        </Card>

        {/* Account Section */}
        <Card>
          <SectionHeader
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            title="Account"
          />
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full bg-[#0B1120] text-white text-lg font-bold flex items-center justify-center shrink-0">
                  {(user.displayName || user.email)?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 dark:text-white truncate">
                      {user.displayName || user.email || 'User'}
                    </p>
                    {user.provider === 'google' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-bold">
                        <span className="text-[#4285F4] font-black">G</span>
                        <span className="text-slate-500">oogle</span>
                      </span>
                    )}
                    {user.provider === 'email' && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-bold text-slate-500">
                        Email
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-400 text-sm mb-4">You are not signed in.</p>
              <button
                onClick={() => setView('login')}
                className="px-6 py-2.5 bg-[#0B1120] dark:bg-[#F59E0B] text-white dark:text-[#0B1120] font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default SettingsPage;
