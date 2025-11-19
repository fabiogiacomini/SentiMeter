import React from 'react';
import { AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ResultsTableProps {
  results: AnalysisResult[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  
  const getSentimentColor = (score: number) => {
    if (score > 0.25) return 'text-green-600 bg-green-50 border-green-100';
    if (score < -0.25) return 'text-red-600 bg-red-50 border-red-100';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.25) return <TrendingUp className="w-4 h-4" />;
    if (score < -0.25) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const exportToCSV = () => {
    const headers = ['Testo', 'Punteggio', 'Magnitudo', 'Spiegazione'];
    const rows = results.map(r => [
      `"${r.originalText.replace(/"/g, '""')}"`,
      r.score.toFixed(2),
      r.magnitude.toFixed(2),
      `"${r.explanation?.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sentiment_analysis_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Risultati Analisi</h2>
        <button 
          onClick={exportToCSV}
          className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
        >
          Esporta CSV
        </button>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10 text-slate-500 font-medium uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Frase</th>
              <th className="px-6 py-4 text-center">Sentiment</th>
              <th className="px-6 py-4 text-center">Score</th>
              <th className="px-6 py-4 text-center">Magnitude</th>
              <th className="px-6 py-4">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-700 max-w-md">
                  <p className="line-clamp-2 hover:line-clamp-none transition-all cursor-default" title={item.originalText}>
                    {item.originalText}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getSentimentColor(item.score)}`}>
                    {getSentimentIcon(item.score)}
                    {item.score > 0.25 ? 'Positivo' : item.score < -0.25 ? 'Negativo' : 'Neutro'}
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-mono text-slate-600">
                  {item.score.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center font-mono text-slate-600">
                  {item.magnitude.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs italic">
                  {item.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};