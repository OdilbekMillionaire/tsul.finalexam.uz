import React from 'react';
import { useExamContext } from '../App';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Step3Results: React.FC = () => {
  const { language, questions, answers, setStep } = useExamContext();
  const t = TRANSLATIONS[language];

  // Calculate totals
  const totalMax = questions.reduce((sum, q) => sum + q.maxWeight, 0);
  const totalScore = questions.reduce((sum, q) => sum + (answers[q.id]?.assessment?.score || 0), 0);
  const percentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

  // Chart Data
  const chartData = questions.map((q, idx) => ({
    name: `Q${idx + 1}`,
    score: answers[q.id]?.assessment?.score || 0,
    max: q.maxWeight
  }));

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      
      {/* Score Dashboard */}
      <div className="bg-gradient-to-r from-oxford-primary to-slate-900 text-white rounded-xl shadow-xl p-8 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <h2 className="text-3xl font-serif font-bold mb-2">{t.totalScore}</h2>
          <div className="text-6xl font-bold text-oxford-accent">
            {totalScore} <span className="text-2xl text-slate-400 font-normal">/ {totalMax}</span>
          </div>
        </div>
        
        {/* Simple Visualization */}
        <div className="w-full md:w-1/2 h-40">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={40} tick={{fill: '#fff'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', color: '#000' }} 
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

          return (
            <div key={q.id} className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700">Question {idx + 1} Analysis</h3>
                 <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                   result.score / q.maxWeight >= 0.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                 }`}>
                   {result.score} / {q.maxWeight}
                 </span>
              </div>
              
              <div className="p-6 grid md:grid-cols-2 gap-8">
                
                {/* Rationale */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-oxford-primary mb-2 uppercase text-xs tracking-wider">{t.rationale}</h4>
                    <p className="text-slate-700 leading-relaxed text-sm">{result.rationale}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-oxford-secondary mb-2 uppercase text-xs tracking-wider">{t.roadmap}</h4>
                    <p className="text-slate-700 leading-relaxed text-sm bg-red-50 p-3 rounded border-l-4 border-oxford-secondary">
                      {result.roadmap}
                    </p>
                  </div>
                </div>

                {/* Citations */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-500 mb-2 uppercase text-xs tracking-wider">{t.citations}</h4>
                  {result.citations.length > 0 ? (
                    <ul className="space-y-2">
                      {result.citations.map((cite, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2 text-sm text-oxford-primary">
                          <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-oxford-accent flex-shrink-0" />
                          <span>{cite}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 text-sm italic">No specific citations generated.</p>
                  )}

                  {/* Grounding Links */}
                  {result.groundingUrls && result.groundingUrls.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-400 mb-2">SOURCE LINKS</p>
                        <ul className="space-y-1">
                          {result.groundingUrls.map((url, uIdx) => (
                            <li key={uIdx}>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
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

      <div className="flex justify-start pt-8">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition"
        >
          &larr; {t.back} to Execution
        </button>
      </div>
    </div>
  );
};

export default Step3Results;
