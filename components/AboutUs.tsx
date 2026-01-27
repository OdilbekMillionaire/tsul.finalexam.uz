
import React from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';

const AboutUs: React.FC = () => {
  const { language } = useExamContext();
  const t = TRANSLATIONS[language];

  return (
    <div className="animate-fade-in font-sans pb-12">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1120] dark:text-white mb-6">
          {t.about.heroTitle}
        </h1>
        <div className="w-24 h-1 bg-[#F59E0B] mx-auto mb-8 rounded-full"></div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t.about.heroSubtitle}
        </p>
      </div>

      {/* Cards Section */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 px-6 mb-16">
        
        {/* Mission Card */}
        <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6 text-[#F59E0B]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#0B1120] dark:text-white mb-4">{t.about.missionTitle}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.about.missionText}
          </p>
        </div>

        {/* Tech Card */}
        <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-[#0B1120] dark:text-blue-300">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#0B1120] dark:text-white mb-4">{t.about.techTitle}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.about.techText}
          </p>
        </div>
      </div>

      {/* Developer Section (Redesigned) */}
      <div className="relative mx-4 md:mx-0 rounded-t-[3rem] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#111827] to-[#0f172a] z-0"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F59E0B] opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 text-white py-24 px-6">
           <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                 <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
                 {t.about.developerTitle}
              </div>
              
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-10 leading-tight">
                Created by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-[#fbbf24] to-[#F59E0B] drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">Oxforder MCHJ</span>
              </h2>
              
              <p className="text-slate-300 text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-14">
                {t.about.developerText}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                 <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🏆</div>
                    <h3 className="text-white font-bold mb-1">Best EdTech Company</h3>
                    <p className="text-slate-400 text-sm">Recognized for innovation in legal education</p>
                 </div>
                 <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🎓</div>
                    <h3 className="text-white font-bold mb-1">Academic Excellence</h3>
                    <p className="text-slate-400 text-sm">Setting the standard for AI assessment</p>
                 </div>
                 <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🚀</div>
                    <h3 className="text-white font-bold mb-1">Future Ready</h3>
                    <p className="text-slate-400 text-sm">Pioneering the next generation of tools</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
