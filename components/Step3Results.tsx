
import React, { useState, useEffect, useRef } from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getOverallAssessment, chatWithAI } from '../services/geminiService';
import LimitModal from './LimitModal';

// Cinematic Loader for Overall Feedback
const CinematicFeedbackLoader: React.FC = () => {
    const [textIndex, setTextIndex] = useState(0);
    const PHRASES = [
        "Aggregating Student Performance...",
        "Identifying Knowledge Gaps...",
        "Synthesizing Growth Roadmap...",
        "Drafting Final Verdict...",
        "Formatting Report..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex(prev => (prev + 1) % PHRASES.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-16 relative overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
             {/* Background Matrix/Grid Effect */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(11,17,32,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(11,17,32,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
             
             {/* Glowing Orb/Icon */}
             <div className="relative mb-8">
                 <div className="absolute inset-0 bg-oxford-accent/30 rounded-full blur-xl animate-pulse"></div>
                 <div className="relative z-10 w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl rotate-45 border-2 border-oxford-primary dark:border-oxford-accent flex items-center justify-center shadow-2xl">
                     <div className="-rotate-45">
                        <svg className="w-10 h-10 text-oxford-primary dark:text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     </div>
                 </div>
             </div>

             {/* Dynamic Text */}
             <div className="relative z-10 flex flex-col items-center gap-3">
                 <p className="text-xl font-serif font-bold text-oxford-primary dark:text-white tracking-wide animate-pulse">
                     {PHRASES[textIndex]}
                 </p>
                 <div className="flex gap-1.5">
                     <div className="w-2 h-2 bg-oxford-accent rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-oxford-accent rounded-full animate-bounce delay-100"></div>
                     <div className="w-2 h-2 bg-oxford-accent rounded-full animate-bounce delay-200"></div>
                 </div>
             </div>
        </div>
    );
};

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

  // Helper to format text with Markdown headers, bullet points, and TABLES
  // allowTables: boolean - defaults to false to prevent tables in question analysis
  const renderRichText = (text: string, allowTables: boolean = false) => {
    if (!text) return null;
    
    // Helper for bold text
    const parseBold = (str: string) => {
         const parts = str.split(/(\*\*.*?\*\*)/);
         return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
               return <strong key={idx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
         });
    };

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];

    const flushTable = () => {
        if (tableBuffer.length === 0) return;

        const rows = tableBuffer;
        tableBuffer = [];

        if (rows.length < 2) return; // Not enough rows for a table

        // Basic parsing: assumed | header | header | \n | --- | --- |
        const parseRow = (r: string) => {
            return r.split('|').filter((c, i, arr) => {
                 // Remove empty start/end if they exist due to split
                 if (i === 0 && c.trim() === '') return false;
                 if (i === arr.length - 1 && c.trim() === '') return false;
                 return true;
            }).map(c => c.trim());
        };

        const headers = parseRow(rows[0]);
        // Row 1 is usually separator |---|---|
        // Body starts at row 2
        const bodyRows = rows.slice(2).map(parseRow);

        elements.push(
            <div key={`table-${elements.length}`} className="overflow-x-auto my-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 uppercase text-xs font-bold">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={i} className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[150px]">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {bodyRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {parseBold(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines, but if we are in a table, an empty line breaks the table
        if (!line) {
            flushTable();
            elements.push(<br key={`br-${i}`} className="content-[''] block h-2" />);
            continue;
        }

        // Table detection: must start with pipe AND tables must be allowed
        if (allowTables && line.startsWith('|')) {
            tableBuffer.push(line);
            continue;
        } else {
            flushTable();
        }
        
        // Header detection
        if (/^#{1,6}.+/.test(line)) {
            const cleanHeader = line.replace(/^#{1,6}\s*/, '').replace(/\*\*/g, ''); 
            elements.push(
              <h4 key={`h-${i}`} className="text-base font-bold text-oxford-primary dark:text-white mt-6 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                {cleanHeader}
              </h4>
            );
            continue;
        }

        // List detection
        if (/^[-*•]\s/.test(line) || /^\d+\.\s/.test(line)) {
             const cleanContent = line.replace(/^[-*•\d\.]+\s/, '');
             elements.push(
               <div key={`li-${i}`} className="flex items-start gap-3 ml-2 mb-2">
                 <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-oxford-accent flex-shrink-0 shadow-sm" />
                 <span className="text-slate-700 dark:text-slate-300">{parseBold(cleanContent)}</span>
               </div>
             );
             continue;
        }

        // Paragraph
        elements.push(<p key={`p-${i}`} className="mb-2">{parseBold(line)}</p>);
    }

    flushTable(); // Flush if table is at end of text

    return (
      <div className="space-y-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {elements}
      </div>
    );
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
                      {/* Disable tables for individual question rationale */}
                      {renderRichText(result.rationale, false)}
                    </div>
                    <div>
                      <h4 className="font-bold text-oxford-secondary dark:text-red-400 mb-2 uppercase text-xs tracking-wider">{t.roadmap}</h4>
                      <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-oxford-secondary dark:border-red-500">
                        {/* Disable tables for individual question roadmap */}
                        {renderRichText(result.roadmap, false)}
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
                            <span>{cite.replace(/\*/g, '')}</span>
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
                <CinematicFeedbackLoader />
              ) : overallFeedback ? (
                <div className="prose max-w-none text-slate-700 dark:text-slate-300">
                  {/* Enable tables ONLY for overall feedback */}
                  {renderRichText(overallFeedback, true)}
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
                         {/* Simple render for chat, basic Markdown can be supported if reused logic */}
                         {msg.text.replace(/\*\*/g, '')}
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
