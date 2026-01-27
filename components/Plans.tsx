
import React, { useState } from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS, PLANS } from '../constants';
import { Plan } from '../types';
import PaymentModal from './PaymentModal';

const Plans: React.FC = () => {
  const { language, subscriptionTier, upgradeSubscription, user, setView } = useExamContext();
  const t = TRANSLATIONS[language];
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleSubscribe = (plan: Plan) => {
    // 1. Enforce Login for Paid Plans
    if (plan.price > 0 && !user) {
        setShowLoginPrompt(true);
        return;
    }

    if (plan.price === 0) return; // Free plan logic
    
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = () => {
    if (selectedPlan) {
        upgradeSubscription(selectedPlan.id);
    }
  };

  const getFeatureLabel = (featureKey: string) => {
    return t.plans.features[featureKey as keyof typeof t.plans.features] || featureKey;
  };

  return (
    <div className="animate-fade-in font-sans pb-16 relative">
      
      {/* Header Section */}
      <div className="relative py-20 px-4 mb-12 bg-[#0B1120] dark:bg-slate-900 rounded-3xl mx-4 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F59E0B] opacity-5 rounded-full blur-[100px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600 opacity-5 rounded-full blur-[80px] pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-[#F59E0B] text-xs font-bold uppercase tracking-widest mb-6 shadow-xl">
             Invest In Your Future
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
            {t.plans.title}
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed font-light">
            {t.plans.subtitle}
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {PLANS.map((plan) => {
            const isCurrentPlan = plan.id === subscriptionTier;
            const isPopular = plan.isPopular;

            return (
              <div 
                key={plan.id}
                className={`
                  relative flex flex-col p-8 rounded-3xl transition-all duration-300 group
                  ${isPopular 
                    ? 'bg-white dark:bg-slate-800 border-2 border-[#F59E0B] shadow-[0_20px_50px_-12px_rgba(245,158,11,0.2)] hover:shadow-[0_25px_60px_-12px_rgba(245,158,11,0.3)] transform scale-105 z-10' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl hover:-translate-y-1'
                  }
                `}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#F59E0B] text-[#0B1120] text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 whitespace-nowrap">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    {t.plans.mostPopular}
                  </div>
                )}

                {/* Header */}
                <div className="mb-8 text-center">
                  <h3 className={`text-lg font-bold uppercase tracking-wider mb-4 ${isPopular ? 'text-[#F59E0B]' : 'text-slate-500 dark:text-slate-400'}`}>
                    {t.plans[plan.id as keyof typeof t.plans] as string}
                  </h3>
                  
                  <div className="flex items-baseline justify-center gap-1 mb-2 text-[#0B1120] dark:text-white">
                    <span className="text-4xl font-serif font-bold tracking-tight">
                      {plan.price === 0 ? t.plans.free : (plan.price).toLocaleString('ru-RU')}
                    </span>
                    {plan.price > 0 && <span className="text-sm font-bold text-slate-400">{plan.currency}</span>}
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.duration}</p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-slate-100 dark:bg-slate-700 mb-8"></div>

                {/* Features */}
                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 leading-snug">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPopular ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="font-medium">{getFeatureLabel(feature)}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan}
                  className={`
                    w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 transform
                    ${isCurrentPlan 
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default border border-slate-200 dark:border-slate-600'
                      : isPopular
                        ? 'bg-[#0B1120] text-white hover:bg-[#F59E0B] hover:text-[#0B1120] shadow-xl hover:shadow-2xl hover:-translate-y-1'
                        : 'bg-white dark:bg-slate-800 border-2 border-[#0B1120] dark:border-white text-[#0B1120] dark:text-white hover:bg-[#0B1120] dark:hover:bg-white hover:text-white dark:hover:text-[#0B1120]'
                    }
                  `}
                >
                  {isCurrentPlan ? t.plans.current : t.plans.subscribe}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal 
          plan={selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Login Required Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform scale-100 transition-all">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-2 text-[#0B1120] dark:text-white">Authentication Required</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
                 You must be logged in to subscribe to a Pro plan and save your progress.
              </p>
              <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setShowLoginPrompt(false)} 
                    className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => { setShowLoginPrompt(false); setView('login'); }} 
                    className="px-6 py-2 bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 shadow-md transition-colors"
                  >
                    Go to Login
                  </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
