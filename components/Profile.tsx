
import React, { useState, useEffect, useRef } from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';

const Profile: React.FC = () => {
  const { language, user, subscriptionTier, logout, setView } = useExamContext();
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load avatar from local storage on mount
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`oxforder_avatar_${user.id}`);
      if (saved) setAvatarUrl(saved);
    }
  }, [user]);

  if (!user) {
     setView('login');
     return null;
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        // Persist to local storage for this user
        localStorage.setItem(`oxforder_avatar_${user.id}`, result);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const displayId = user.id.substring(0, 8).toUpperCase();
  const initial = user.email?.charAt(0).toUpperCase() || '?';

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'yearly': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'monthly': return 'bg-[#0B1120] text-[#F59E0B] border-[#0B1120] dark:bg-slate-800 dark:border-slate-700';
      case 'daily': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in font-sans">
      <h1 className="text-4xl font-serif font-bold text-[#0B1120] dark:text-white mb-8">{t.profile.title}</h1>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        
        {/* Dark Header Background */}
        <div className="h-48 bg-[#0B1120] dark:bg-black relative overflow-hidden">
           {/* Decorative Blurs */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F59E0B]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Profile Content */}
        <div className="px-10 pb-12 relative">
            
            {/* Avatar - overlapping the header line */}
            <div className="absolute -top-16 left-10 group">
                <div 
                  onClick={triggerUpload}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 shadow-lg overflow-hidden cursor-pointer relative transition-transform transform group-hover:scale-105"
                  title="Click to change photo"
                >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl font-serif font-bold text-[#0B1120] dark:text-white">
                          {initial}
                      </div>
                    )}
                    
                    {/* Hover Overlay for Upload */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                </div>
                <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleFileSelect} 
                />
            </div>

            {/* Top Row: Email/ID and Logout Button */}
            <div className="pt-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{user.email}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wide text-xs flex items-center gap-2">
                       {t.profile.id}: <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{displayId}</span>
                    </p>
                </div>
                
                <button 
                   onClick={logout}
                   className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all shadow-sm group"
                >
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    {t.profile.logout}
                </button>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-slate-100 dark:bg-slate-700 mb-12"></div>

            {/* Grid for Subscription & History */}
            <div className="grid md:grid-cols-2 gap-12">
                
                {/* Subscription Section */}
                <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                      {t.profile.subscription}
                   </h3>
                   <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className={`px-5 py-2 rounded-lg border text-sm font-bold uppercase tracking-wider shadow-sm ${getTierColor(subscriptionTier)}`}>
                          {subscriptionTier === 'free' ? 'FREE PLAN' : `${subscriptionTier} PLAN`}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg border border-green-100 dark:border-green-800">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                          </span>
                          {t.profile.active}
                      </div>
                   </div>
                   
                   {subscriptionTier === 'free' && (
                       <button 
                         onClick={() => setView('plans')}
                         className="group flex items-center gap-1 text-sm font-bold text-[#0B1120] dark:text-white hover:text-[#F59E0B] dark:hover:text-[#F59E0B] transition-colors"
                       >
                          <span className="border-b-2 border-[#0B1120] dark:border-white group-hover:border-[#F59E0B] pb-0.5">{t.profile.upgrade}</span>
                          <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                       </button>
                   )}
                </div>

                {/* History Section */}
                <div>
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t.profile.history}
                   </h3>
                   <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-default">
                       <p className="text-slate-400 text-sm italic font-medium">
                          No assessment history available yet.
                       </p>
                   </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
