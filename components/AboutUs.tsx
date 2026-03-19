
import React, { useState } from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="font-semibold text-[#0B1120] dark:text-white text-base">{question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-5 h-5 text-[#F59E0B] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-200 dark:border-slate-700">
          {answer}
        </div>
      )}
    </div>
  );
};

const AboutUs: React.FC = () => {
  const { language, setView } = useExamContext();
  const t = TRANSLATIONS[language];

  const stats = [
    { value: '10,000+', label: 'Assessments Graded' },
    { value: '99%', label: 'Accuracy Rate' },
    { value: '4', label: 'Languages' },
    { value: '<30s', label: 'Avg Response' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Configure Exam',
      desc: 'Set the legal case fact pattern, exam questions, and select your grading rubric or mezon criteria.',
    },
    {
      num: '02',
      title: 'Submit Answers',
      desc: 'Paste or type student responses directly into the assessor. Supports multi-question sessions.',
    },
    {
      num: '03',
      title: 'Get Expert Verdict',
      desc: 'Receive an instant score, substantive rationale, growth roadmap, and lex.uz legislative citations.',
    },
  ];

  const techStack = [
    { name: 'OXFORDER AI Engine', desc: 'Legal assessment core' },
    { name: 'React 19', desc: 'Modern UI with hooks' },
    { name: 'Supabase', desc: 'Secure auth & subscriptions' },
    { name: 'TypeScript', desc: 'Full type safety' },
    { name: 'Recharts', desc: 'Performance visualization' },
    { name: 'Vite', desc: 'Lightning-fast builds' },
  ];

  const faqs = [
    {
      question: 'Does AI replace my professor?',
      answer: 'No. TSUL Finalizer is a formative assistant designed to support learning and self-assessment. It complements — never replaces — academic instruction and official grading.',
    },
    {
      question: 'How accurate is the grading?',
      answer: 'The AI is calibrated to TSUL rubrics and trained on Uzbek legal standards. It achieves ~99% alignment with expert graders on structured assessments.',
    },
    {
      question: 'Is my data stored?',
      answer: 'Session data is stored locally in your browser. If you are logged in, assessment history may be synced to your Firebase account. No data is sold to third parties.',
    },
    {
      question: 'Which file formats work?',
      answer: 'Currently the platform supports plain text and direct paste input. OCR-based photo recognition is available on Yearly Elite plans.',
    },
  ];

  return (
    <div className="animate-fade-in font-sans pb-12">

      {/* ── 1. HERO SECTION ── */}
      <div className="w-[calc(100%+3rem)] -mx-6 relative bg-[#0B1120] overflow-hidden mb-16">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F59E0B]/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 text-center py-20 px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold tracking-widest uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            {t.about.developerTitle}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            {t.about.heroTitle}
          </h1>
          <div className="w-24 h-1 bg-[#F59E0B] mx-auto mb-8 rounded-full" />
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-14">
            {t.about.heroSubtitle}
          </p>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#0B1120] px-6 py-6 text-center">
                <div className="text-3xl font-bold text-[#F59E0B] mb-1">{s.value}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. MISSION + VISION ── */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 px-6 mb-16">
        {/* Mission — white card */}
        <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6 text-[#F59E0B]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#0B1120] dark:text-white mb-4">{t.about.missionTitle}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t.about.missionText}</p>
        </div>

        {/* Vision — dark card */}
        <div className="bg-[#0B1120] p-10 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center mb-6 text-[#F59E0B]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">{t.about.techTitle}</h2>
            <p className="text-slate-300 leading-relaxed">{t.about.techText}</p>
          </div>
        </div>
      </div>

      {/* ── 3. HOW IT WORKS ── */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0B1120] dark:text-white mb-4">How It Works</h2>
          <div className="w-16 h-1 bg-[#F59E0B] mx-auto rounded-full" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="bg-[#0B1120] rounded-2xl p-8 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-shadow">
              <div className="text-7xl font-black text-white/5 absolute -top-4 -right-2 select-none leading-none">{step.num}</div>
              <div className="relative z-10">
                <div className="text-[#F59E0B] text-sm font-bold tracking-widest uppercase mb-4">{step.num}</div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. TECH STACK ── */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0B1120] dark:text-white mb-4">Tech Stack</h2>
          <div className="w-16 h-1 bg-[#F59E0B] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {techStack.map((item) => (
            <div key={item.name} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-6 flex items-start gap-4 hover:border-[#F59E0B]/40 transition-colors group">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B] mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
              <div>
                <div className="font-bold text-[#0B1120] dark:text-white text-sm">{item.name}</div>
                <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. FAQ ── */}
      <div className="max-w-3xl mx-auto px-6 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0B1120] dark:text-white mb-4">FAQ</h2>
          <div className="w-16 h-1 bg-[#F59E0B] mx-auto rounded-full" />
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {/* ── 6. DEVELOPER CTA ── */}
      <div className="relative mx-4 md:mx-6 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#111827] to-[#0f172a]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F59E0B] opacity-10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600 opacity-10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-white py-20 px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            {t.about.developerTitle}
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Created by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-[#fbbf24] to-[#F59E0B]">
              Oxforder MCHJ
            </span>
          </h2>

          <p className="text-slate-300 text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
            {t.about.developerText}
          </p>

          <button
            onClick={() => setView('assessor')}
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1120] font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-1 hover:scale-105"
          >
            Start Assessment
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default AboutUs;
