import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { AnalysisResult } from '../types';

interface ChartsProps {
  data: AnalysisResult[];
}

export const Charts: React.FC<ChartsProps> = ({ data }) => {
  
  // Prepare data for distribution
  const positive = data.filter(d => d.score > 0.25).length;
  const neutral = data.filter(d => d.score >= -0.25 && d.score <= 0.25).length;
  const negative = data.filter(d => d.score < -0.25).length;

  const barData = [
    { name: 'Negativo', count: negative, color: '#ef4444' },
    { name: 'Neutro', count: neutral, color: '#94a3b8' },
    { name: 'Positivo', count: positive, color: '#22c55e' },
  ];

  // Prepare data for scatter plot (Score vs Magnitude)
  const scatterData = data.map((d, i) => ({
    id: i,
    score: parseFloat(d.score.toFixed(2)),
    magnitude: parseFloat(d.magnitude.toFixed(2)),
    text: d.originalText.substring(0, 30) + '...'
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Sentiment Distribution Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribuzione Sentiment</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score vs Magnitude Scatter Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Intensità vs. Sentiment</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" dataKey="score" name="Punteggio" unit="" domain={[-1, 1]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis type="number" dataKey="magnitude" name="Magnitudo" unit="" domain={[0, 1]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <ZAxis type="number" range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                 if (active && payload && payload.length) {
                   const data = payload[0].payload;
                   return (
                     <div className="bg-white p-2 shadow-lg rounded border text-sm">
                       <p><strong>Score:</strong> {data.score}</p>
                       <p><strong>Mag:</strong> {data.magnitude}</p>
                       <p className="text-xs text-gray-500 mt-1">"{data.text}"</p>
                     </div>
                   );
                 }
                 return null;
              }} />
              <Scatter name="Analisi" data={scatterData} fill="#6366f1" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};