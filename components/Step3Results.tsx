
import React, { useState, useEffect, useRef } from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getOverallAssessment, chatWithAI } from '../services/geminiService';
import LimitModal from './LimitModal';

const Step3Results: React.FC = () => {
  const { 
    language, 
    questions, 
    answers, 
    setStep, 
    masterCase, 
    overallFeedback, 
    setOverallFeedback,
    chatHistory,
    addChatMessage,
    isDarkMode,
    checkUsage,
    incrementUsage
  } = useExamContext();
  
  const t = TRANSLATIONS[language];
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (isChatOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatOpen]);

  // Calculate totals
  const totalMax = questions.reduce((sum, q) => sum + q.maxWeight, 0);
  const totalScore = questions.reduce((sum, q) => sum + (answers[q.id]?.assessment?.score || 0), 0);

  // Chart Data
  const chartData = questions.map((q, idx) => ({
    name: `Q${idx + 1}`,
    score: answers[q.id]?.assessment?.score || 0,
    max: q.maxWeight
  }));

  // Helper to remove markdown asterisks if AI slips up
  const cleanText = (text: string) => {
    if (!text) return "";
    return text.replace(/\*\*/g, '').replace(/\*/g, '');
  };

  // Helper to format text with bullet points if detected
  const renderRichText = (text: string) => {
    if (!text) return null;
    const cleaned = cleanText(text);
    
    // Check if the text looks like a list (starts with -, *, or 1.)
    const hasListMarkers = /^[-\*•\d\.]+\s/m.test(cleaned);

    if (hasListMarkers) {
      const lines = cleaned.split('\n').filter(line => line.trim() !== '');
      return (
        <ul className="list-none space-y-2 mt-2">
          {lines.map((line, i) => {
            const cleanLine = line.replace(/^[\-\*•\d\.]+\s/, '');
            return (
               <li key={i} className="flex items-start gap-2">
                 <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 flex-shrink-0" />
                 <span>{cleanLine}</span>
               </li>
            );
          })}
        </ul>
      );
    }
    return <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">{cleaned}</p>;
  };

  const handleGenerateOverall = async () => {
    if (!checkUsage()) {
       setShowLimitModal(true);
       return;
    }

    setIsGeneratingFeedback(true);
    const feedback = await getOverallAssessment(masterCase, questions, answers, language);
    setOverallFeedback(feedback);
    setIsGeneratingFeedback(false);
    
    // Increment usage upon successful generation
    incrementUsage();
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;
    
    const msg = chatInput;
    setChatInput("");
    addChatMessage('user', msg);
    setIsSendingChat(true);

    const context = { masterCase, questions, answers };
    const response = await chatWithAI(chatHistory, msg, context, language);
    
    addChatMessage('model', response);
    setIsSendingChat(false);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20 relative print:p-0">
      
      {showLimitModal && <LimitModal onClose={() => setShowLimitModal(false)} />}

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            header, footer {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="print-content space-y-12">
        {/* Score Dashboard */}
        <div className="bg-gradient-to-r from-oxford-primary to-slate-900 dark:from-slate-900 dark:to-black text-white rounded-xl shadow-xl p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-serif font-bold mb-2">{t.totalScore}</h2>
            <div className="text-6xl font-bold text-oxford-accent">
              {totalScore} <span className="text-2xl text-slate-400 font-normal">/ {totalMax}</span>
            </div>
            
            <button 
              onClick={handleDownloadPdf}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors no-print"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {t.downloadPdf}
            </button>
          </div>
          
          {/* Simple Visualization */}
          <div className="w-full md:w-1/2 h-40 no-print">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={40} tick={{fill: '#fff'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000', borderRadius: '8px', border: 'none' }} 
                    cursor={{fill: 'rgba(255,255,255,0.1)'}}
                  />
                  <Bar dataKey="score" fill="#E3D39E" radius={[0, 4, 4, 0]} barSize={20}>
                      {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.score / entry.max < 0.5 ? '#EF4444' : '#E3D39E'} />
                      ))}
                  </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid gap-8">
          {questions.map((q, idx) => {
            const result = answers[q.id]?.assessment;
            if (!result) return null;

            // Localized header handling
            const headerText = t.questionAnalysis ? t.questionAnalysis.replace('{n}', (idx + 1).toString()) : `Question ${idx + 1} Analysis`;

            return (
              <div key={q.id} className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden break-inside-avoid transition-colors">
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">{headerText}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    result.score / q.maxWeight >= 0.5 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                  }`}>
                    {result.score} / {q.maxWeight}
                  </span>
                </div>
                
                <div className="p-6 grid md:grid-cols-2 gap-8">
                  
                  {/* Rationale */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-oxford-primary dark:text-slate-200 mb-2 uppercase text-xs tracking-wider">{t.rationale}</h4>
                      {renderRichText(result.rationale)}
                    </div>
                    <div>
                      <h4 className="font-bold text-oxford-secondary dark:text-red-400 mb-2 uppercase text-xs tracking-wider">{t.roadmap}</h4>
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-oxford-secondary dark:border-red-500">
                        {renderRichText(result.roadmap)}
                      </div>
                    </div>
                  </div>

                  {/* Citations */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase text-xs tracking-wider">{t.citations}</h4>
                    {result.citations.length > 0 ? (
                      <ul className="space-y-2">
                        {result.citations.map((cite, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2 text-sm text-oxford-primary dark:text-blue-300">
                            <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-oxford-accent flex-shrink-0" />
                            <span>{cleanText(cite)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-sm italic">No specific citations generated.</p>
                    )}

                    {/* Grounding Links - Hide in Print */}
                    {result.groundingUrls && result.groundingUrls.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 no-print">
                          <p className="text-xs font-bold text-slate-400 mb-2">SOURCE LINKS</p>
                          <ul className="space-y-1">
                            {result.groundingUrls.map((url, uIdx) => (
                              <li key={uIdx}>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block">
                                  {url}
                                </a>
                              </li>
                            ))}
                          </ul>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Overall Assessment Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden break-inside-avoid transition-colors">
          <div className="bg-slate-900 dark:bg-black text-white px-6 py-4 border-b border-slate-800 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">{t.overallAssessment}</h3>
              {!overallFeedback && !isGeneratingFeedback && (
                  <button 
                    onClick={handleGenerateOverall}
                    className="bg-oxford-accent text-slate-900 px-4 py-1.5 rounded text-sm font-bold hover:bg-white transition no-print"
                  >
                    {t.generateFeedback}
                  </button>
              )}
          </div>
          <div className="p-8">
              {isGeneratingFeedback ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-3">
                    <svg className="animate-spin h-8 w-8 text-oxford-primary dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t.generating}</span>
                </div>
              ) : overallFeedback ? (
                <div className="prose max-w-none text-slate-700 dark:text-slate-300">
                  {renderRichText(overallFeedback)}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 italic">
                  Click generate to see a comprehensive analysis of the student's exam performance.
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8 no-print">
        <button
          onClick={() => setStep(2)}
           className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors px-4 py-2"
        >
          &larr; {t.back}
        </button>
      </div>

      {/* Fixed Chat Widget - Hide in Print */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none no-print">
         {/* Chat Window */}
         <div className={`
             mb-6 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-all duration-300 pointer-events-auto
             ${isChatOpen ? 'opacity-100 translate-y-0 h-[500px]' : 'opacity-0 translate-y-10 h-0'}
         `}>
             <div className="bg-oxford-primary dark:bg-slate-900 text-white p-4 font-bold flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    {/* Robotic Icon in Header */}
                    <div className="bg-white/10 p-1.5 rounded-full">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
                          <path d="M4 11v2a8 8 0 0 0 16 0v-2"/>
                          <rect x="8" y="10" width="8" height="8" rx="1"/>
                          <path d="M9 14h6"/>
                          <path d="M12 10v4"/>
                       </svg>
                    </div>
                   <span>{t.chatTitle}</span>
                 </div>
                 <button onClick={() => setIsChatOpen(false)} className="text-white/70 hover:text-white">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
             </div>
             <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-4 overflow-y-auto space-y-3">
                {chatHistory.length === 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 mb-2">
                     {t.chatGreeting}
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-oxford-primary text-white' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}>
                         {cleanText(msg.text)}
                      </div>
                  </div>
                ))}
                {isSendingChat && (
                   <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                      </div>
                   </div>
                )}
                <div ref={chatEndRef} />
             </div>
             <form onSubmit={handleSendChat} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={t.typeMessage}
                  className="flex-1 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md px-3 py-2 focus:border-oxford-primary outline-none"
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || isSendingChat}
                  className="bg-oxford-primary text-white px-3 py-2 rounded-md disabled:opacity-50"
                >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
             </form>
         </div>

         {/* Toggle Button - Redesigned & Bouncy */}
         <button 
           onClick={() => setIsChatOpen(!isChatOpen)}
           className={`
              bg-oxford-secondary hover:bg-red-700 text-white w-20 h-20 rounded-full shadow-2xl 
              transition-all duration-300 hover:scale-110 pointer-events-auto flex items-center justify-center group relative
              ${!isChatOpen ? 'animate-bounce' : ''}
           `}
         >
            {isChatOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            ) : (
               <div className="relative">
                  {/* Robotic Icon SVG */}
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" y1="16" x2="8" y2="16" />
                    <line x1="16" y1="16" x2="16" y2="16" />
                  </svg>
                  {/* Notification Dot */}
                  <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-oxford-secondary rounded-full"></span>
               </div>
            )}
            
            {!isChatOpen && (
              <span className="absolute right-full mr-4 bg-white dark:bg-slate-700 text-oxford-primary dark:text-white px-4 py-2 rounded-lg shadow-xl text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-100 dark:border-slate-600">
                {t.chatTitle}
                {/* Arrow */}
                <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white dark:bg-slate-700 border-t border-r border-slate-100 dark:border-slate-600 transform rotate-45 -translate-y-1/2"></div>
              </span>
            )}
         </button>
      </div>

    </div>
  );
};

export default Step3Results;
