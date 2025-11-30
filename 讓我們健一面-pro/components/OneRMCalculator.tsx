import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export const OneRMCalculator: React.FC = () => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const r = parseFloat(reps);
    if (w && r) {
      // Epley formula
      const oneRM = w * (1 + r / 30);
      setResult(Math.round(oneRM));
    }
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-sm">
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Calculator className="text-teal-400" /> 最大肌力 (1RM) 估算
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">負重 (kg)</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-slate-900 text-white text-lg p-3 rounded-xl border border-slate-600 focus:border-teal-500 focus:outline-none mt-1 transition-colors"
              placeholder="例如: 100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">重複次數 (Reps)</label>
            <input 
              type="number" 
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full bg-slate-900 text-white text-lg p-3 rounded-xl border border-slate-600 focus:border-teal-500 focus:outline-none mt-1 transition-colors"
              placeholder="例如: 5"
            />
          </div>
          <button 
            onClick={calculate}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-teal-900/20"
          >
            開始計算
          </button>
        </div>

        {result && (
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-400 text-sm">預估 1RM</p>
            <p className="text-5xl font-black text-white mt-2 tracking-tight">{result} <span className="text-lg text-teal-400 font-bold">KG</span></p>
            <div className="grid grid-cols-3 gap-2 mt-6 text-center">
              <div className="bg-slate-700/50 p-2 rounded-xl border border-slate-600">
                <div className="text-xs text-slate-400">肌肥大 (85%)</div>
                <div className="font-bold text-slate-200">{Math.round(result * 0.85)}</div>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-xl border border-slate-600">
                <div className="text-xs text-slate-400">耐力 (70%)</div>
                <div className="font-bold text-slate-200">{Math.round(result * 0.70)}</div>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-xl border border-slate-600">
                <div className="text-xs text-slate-400">力量 (90%)</div>
                <div className="font-bold text-slate-200">{Math.round(result * 0.90)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};