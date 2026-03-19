
import React from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';

const Dashboard: React.FC = () => {
  const { language, setView, subscriptionTier } = useExamContext();
  const t = TRANSLATIONS[language];

  return (
    <div className="animate-fade-in font-sans">

      {/* Hero Section with Spline Robot */}
      <div className="relative h-[500px] w-[calc(100%+3rem)] -mx-6 overflow-hidden shadow-2xl mb-12">

        {/* LEFT SIDE — dark background with text */}
        <div className="absolute left-0 top-0 bottom-0 w-[60%] bg-[#0B1120] flex flex-col justify-center px-10 md:px-16 z-10">
          {/* gradient to blend into robot side */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0B1120] to-transparent" />
          <div className="bg-[#F59E0B] w-20 h-2 mb-6 rounded-full" />
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            {t.dashboard.heroTitle}
          </h1>
          <p className="text-xl text-slate-300 mb-10 font-light max-w-xl leading-relaxed">
            {t.dashboard.heroSubtitle}
          </p>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setView('assessor')}
              className="px-8 py-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1120] font-bold text-lg rounded-lg shadow-lg transition-transform transform hover:-translate-y-1 hover:scale-105 flex items-center gap-2"
            >
              {t.dashboard.cta}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>

            {subscriptionTier === 'free' && (
              <button
                onClick={() => setView('plans')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg rounded-lg shadow-lg transition-transform transform hover:-translate-y-1"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE — Spline 3D robot */}
        <div className="absolute right-0 top-0 bottom-0 w-[40%]" style={{ overflow: 'hidden' }}>
          <iframe
            src="https://my.spline.design/nexbotrobotcharacterconcept-GMhByIfZsnPwyHWor7SGOF51/"
            frameBorder={0}
            title="OXFORDER AI"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="fullscreen"
          />
          {/* Watermark cover */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, background: '#0B1120', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16, gap: 8, zIndex: 20 }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="1.5"/>
              <path d="M8 12l3 3 5-5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ color: '#F59E0B', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>OXFORDER AI</span>
          </div>
        </div>

      </div>

      {/* Info Cards Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Feature 1 */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all group">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6 text-[#0B1120] dark:text-blue-300 group-hover:bg-[#0B1120] group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#0B1120] dark:text-white mb-3 font-serif">{t.dashboard.feature1Title}</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.dashboard.feature1Text}
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all group">
          <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-6 text-[#F59E0B] group-hover:bg-[#F59E0B] group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.258 50.55 50.55 0 0 0-2.658.813m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#0B1120] dark:text-white mb-3 font-serif">{t.dashboard.feature2Title}</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.dashboard.feature2Text}
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all group">
          <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-6 text-[#6366f1] dark:text-purple-300 group-hover:bg-[#6366f1] group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#0B1120] dark:text-white mb-3 font-serif">{t.dashboard.feature3Title}</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.dashboard.feature3Text}
          </p>
        </div>
      </div>

      {/* Stats/Details Section */}
      <div className="bg-[#0B1120] dark:bg-slate-900 text-white rounded-2xl p-10 md:p-16 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="max-w-xl">
                <h2 className="text-3xl font-serif font-bold mb-6">{t.dashboard.statsTitle}</h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="min-w-6 min-h-6 mt-1 rounded-full border border-[#F59E0B] flex items-center justify-center text-[#F59E0B] text-xs">✓</div>
                        <p className="text-slate-300">{t.dashboard.stats1}</p>
                    </div>
                    <div className="flex items-start gap-4">
                         <div className="min-w-6 min-h-6 mt-1 rounded-full border border-[#F59E0B] flex items-center justify-center text-[#F59E0B] text-xs">✓</div>
                        <p className="text-slate-300">{t.dashboard.stats2}</p>
                    </div>
                    <div className="flex items-start gap-4">
                         <div className="min-w-6 min-h-6 mt-1 rounded-full border border-[#F59E0B] flex items-center justify-center text-[#F59E0B] text-xs">✓</div>
                        <p className="text-slate-300">{t.dashboard.stats3}</p>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-6">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 min-w-[200px] text-center">
                    <div className="text-4xl font-bold text-[#F59E0B] mb-2">99%</div>
                    <div className="text-sm text-slate-400 uppercase tracking-widest">{t.dashboard.accuracy}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10 min-w-[200px] text-center">
                    <div className="text-4xl font-bold text-[#F59E0B] mb-2">3.0</div>
                    <div className="text-sm text-slate-400 uppercase tracking-widest">{t.dashboard.model}</div>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
