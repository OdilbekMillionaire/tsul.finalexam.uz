
import React, { useState } from 'react';
import { useExamContext } from '../App';
import { authService } from '../services/authService';
import { TRANSLATIONS } from '../constants';

const Login: React.FC = () => {
  const { language, setView } = useExamContext();
  const t = TRANSLATIONS[language];
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await authService.signUp(email, password);
        if (error) throw error;
        // Auto-login or just redirect happens via onAuthStateChange in App.tsx
      } else {
        const { error } = await authService.signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-10 animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] transition-colors">
        
        {/* Left Side - Visual */}
        <div className="w-full md:w-1/2 bg-[#0B1120] dark:bg-black p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B] opacity-10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-4">
              {isRegistering ? t.auth.registerTitle : t.auth.title}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              {isRegistering ? t.auth.registerSubtitle : t.auth.subtitle}
            </p>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs">✓</span>
                  Save your assessment history
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs">✓</span>
                  Access Pro features across devices
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center text-xs">✓</span>
                  Secure & Private
               </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
           <div className="mb-8">
             <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => { setIsRegistering(false); setError(null); }}
                  className={`pb-2 font-bold text-sm transition-colors ${!isRegistering ? 'text-[#0B1120] dark:text-white border-b-2 border-[#0B1120] dark:border-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {t.auth.signIn}
                </button>
                <button 
                  onClick={() => { setIsRegistering(true); setError(null); }}
                  className={`pb-2 font-bold text-sm transition-colors ${isRegistering ? 'text-[#0B1120] dark:text-white border-b-2 border-[#0B1120] dark:border-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {t.auth.signUp}
                </button>
             </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.auth.email}</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#0B1120] dark:focus:ring-white focus:border-transparent outline-none transition"
                  placeholder="student@tsul.uz"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.auth.password}</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#0B1120] dark:focus:ring-white focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                   <svg className="animate-spin h-5 w-5 text-white dark:text-[#0B1120]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : isRegistering ? t.auth.signUp : t.auth.signIn}
              </button>
           </form>

           <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
             {isRegistering ? t.auth.hasAccount : t.auth.noAccount}
             <button 
               onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
               className="ml-1 text-[#0B1120] dark:text-white font-bold hover:underline"
             >
               {isRegistering ? t.auth.signIn : t.auth.signUp}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
