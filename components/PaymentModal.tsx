
import React, { useState, useRef } from 'react';
import { Plan } from '../types';
import { TRANSLATIONS } from '../constants';
import { useExamContext } from '../App';
import { verifyPaymentReceipt } from '../services/paymentService';
import { activateSubscription } from '../services/subscriptionService';

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess }) => {
  const { language } = useExamContext();
  const t = TRANSLATIONS[language];
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Updated Card Details
  const CARDS = [
    { type: 'HUMO', number: '9860 0101 0240 8712', name: 'Oxforder LLC' }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    alert('Card number copied!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;

    setIsVerifying(true);
    setError(null);

    // 1. AI Verification of Receipt
    const result = await verifyPaymentReceipt(file, plan.price);

    if (result.verified) {
      // 2. Activate Subscription in Supabase
      const activationSuccess = await activateSubscription(plan.id);

      if (activationSuccess) {
        setIsVerifying(false);
        setSuccessMsg(t.payment.success);
        setTimeout(() => {
          onSuccess(); // Updates local context state
          onClose();
        }, 2000);
      } else {
        setIsVerifying(false);
        // If AI passes but DB fails (e.g., network error), we still show error
        setError("Payment verified, but failed to activate plan. Please contact support.");
      }
    } else {
      setIsVerifying(false);
      setError(result.reason || t.payment.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#0B1120] p-6 text-white text-center relative">
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 text-white/60 hover:text-white transition"
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
           <h2 className="text-xl font-serif font-bold mb-2">{t.payment.title}</h2>
           <p className="text-sm text-slate-400">{plan.id.toUpperCase()} Plan</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Amount Display */}
          <div className="text-center">
            <p className="text-sm text-slate-500 uppercase tracking-wide font-bold mb-1">{t.payment.amount}</p>
            <div className="text-3xl font-bold text-[#0B1120]">
              {plan.price.toLocaleString()} <span className="text-base text-slate-500">{plan.currency}</span>
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-3">
             {CARDS.map((card, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500">{card.type}</span>
                      <span className="font-mono font-medium text-slate-700">{card.number}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{card.name}</span>
                   </div>
                   <button 
                     onClick={() => handleCopy(card.number)}
                     className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 text-slate-600 font-bold"
                   >
                     {t.payment.copy}
                   </button>
                </div>
             ))}
          </div>

          {/* Upload Section */}
          <div className="border-t border-slate-100 pt-6">
             <label className="block mb-2 font-bold text-slate-700 text-sm">{t.payment.uploadTitle}</label>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-[#F59E0B] hover:bg-slate-50'}`}
             >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center text-green-700">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-sm">{t.payment.selectFile}</span>
                  </div>
                )}
             </div>
             {/* Hint */}
             <p className="text-xs text-slate-400 mt-2 text-center">{t.payment.uploadDesc}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
             {error && (
               <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                 {error}
               </div>
             )}
             
             {successMsg && (
                <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded font-bold">
                  {successMsg}
                </div>
             )}

             <button 
               onClick={handleVerify}
               disabled={!file || isVerifying || !!successMsg}
               className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
                 !file || isVerifying ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#0B1120] hover:bg-slate-800'
               }`}
             >
               {isVerifying ? (
                 <span className="flex items-center justify-center gap-2">
                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                   {t.payment.verifying}
                 </span>
               ) : (
                 t.payment.verifyBtn
               )}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
