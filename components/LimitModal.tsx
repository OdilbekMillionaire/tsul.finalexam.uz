
import React from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';

interface LimitModalProps {
  onClose: () => void;
}

const LimitModal: React.FC<LimitModalProps> = ({ onClose }) => {
  const { language, setView } = useExamContext();
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform scale-100 transition-all border border-slate-100 dark:border-slate-700">
          <div className="w-16 h-16 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#F59E0B]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-xl font-serif font-bold mb-2 text-[#0B1120] dark:text-white">{t.limit.title}</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-2 font-medium">
             {t.limit.message}
          </p>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
             {t.limit.subMessage}
          </p>
          
          <div className="flex flex-col gap-3">
              <button 
                onClick={() => { onClose(); setView('plans'); }} 
                className="w-full py-3 bg-[#0B1120] hover:bg-slate-800 dark:bg-[#F59E0B] dark:hover:bg-[#D97706] text-white dark:text-[#0B1120] rounded-xl font-bold shadow-lg transition-transform transform hover:-translate-y-0.5"
              >
                {t.limit.upgrade}
              </button>
              <button 
                onClick={onClose} 
                className="w-full py-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold text-sm transition-colors"
              >
                {t.limit.cancel}
              </button>
          </div>
      </div>
    </div>
  );
};

export default LimitModal;
