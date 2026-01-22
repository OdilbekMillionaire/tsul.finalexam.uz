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
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1120] mb-6">
          {t.about.heroTitle}
        </h1>
        <div className="w-24 h-1 bg-[#F59E0B] mx-auto mb-8 rounded-full"></div>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t.about.heroSubtitle}
        </p>
      </div>

      {/* Cards Section */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 px-6 mb-20">
        
        {/* Mission Card */}
        <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 text-[#F59E0B]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#0B1120] mb-4">{t.about.missionTitle}</h2>
          <p className="text-slate-600 leading-relaxed">
            {t.about.missionText}
          </p>
        </div>

        {/* Tech Card */}
        <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-shadow">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-[#0B1120]">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#0B1120] mb-4">{t.about.techTitle}</h2>
          <p className="text-slate-600 leading-relaxed">
            {t.about.techText}
          </p>
        </div>
      </div>

      {/* Developer Section (Dark) */}
      <div className="bg-[#0B1120] text-white py-16 px-6 rounded-t-[3rem] -mb-12 relative z-10 mx-4 md:mx-0">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold mb-6">{t.about.developerTitle}</h2>
            <p className="text-slate-300 text-lg">
              {t.about.developerText}
            </p>
         </div>
      </div>
    </div>
  );
};

export default AboutUs;