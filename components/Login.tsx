
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

           {/* Google Sign-In */}
           <button
             type="button"
             onClick={async () => {
               setError(null);
               setLoading(true);
               try {
                 await authService.signInWithGoogle();
                 // onAuthStateChange in App.tsx handles redirect
               } catch (err: any) {
                 setError(err.message || 'Google sign-in failed.');
               } finally {
                 setLoading(false);
               }
             }}
             disabled={loading}
             className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-bold text-slate-700 dark:text-slate-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mb-6"
           >
             <svg viewBox="0 0 24 24" width="20" height="20">
               <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
               <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
               <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
               <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
             </svg>
             Sign in with Google
           </button>

           <div className="flex items-center gap-3 mb-6">
             <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
             <span className="text-xs text-slate-400 font-medium">or continue with email</span>
             <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
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
