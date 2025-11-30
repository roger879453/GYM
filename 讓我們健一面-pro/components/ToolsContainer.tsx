import React, { useState } from 'react';
import { Calculator, Disc, Activity } from 'lucide-react';

const OneRMCalculator: React.FC = () => {
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
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Calculator className="text-teal-400" size={20} /> 最大肌力估算
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold">重量 (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-600 focus:border-teal-500 focus:outline-none mt-1" />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold">次數 (Reps)</label>
          <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-600 focus:border-teal-500 focus:outline-none mt-1" />
        </div>
      </div>
      <button onClick={calculate} className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition shadow-lg shadow-teal-900/20">計算</button>
      
      {result && (
        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">預估 1RM</p>
          <p className="text-5xl font-black text-white mt-2">{result} <span className="text-lg text-teal-400">KG</span></p>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
             <div className="bg-slate-700/50 p-2 rounded-lg"><div className="text-[10px] text-slate-400">肌肥大</div><div className="font-bold text-white">{Math.round(result * 0.75)}</div></div>
             <div className="bg-slate-700/50 p-2 rounded-lg"><div className="text-[10px] text-slate-400">力量</div><div className="font-bold text-white">{Math.round(result * 0.90)}</div></div>
             <div className="bg-slate-700/50 p-2 rounded-lg"><div className="text-[10px] text-slate-400">爆發力</div><div className="font-bold text-white">{Math.round(result * 0.50)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

const PlateCalculator: React.FC = () => {
  const [targetWeight, setTargetWeight] = useState('');
  const [barWeight, setBarWeight] = useState('20');
  const [plates, setPlates] = useState<{weight: number, count: number}[]>([]);

  const calculatePlates = () => {
    const target = parseFloat(targetWeight);
    const bar = parseFloat(barWeight);
    if (!target || target < bar) return;

    let remaining = (target - bar) / 2;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const result = [];

    for (const p of availablePlates) {
      const count = Math.floor(remaining / p);
      if (count > 0) {
        result.push({ weight: p, count });
        remaining -= count * p;
        // Float precision fix
        remaining = Math.round(remaining * 100) / 100;
      }
    }
    setPlates(result);
  };

  return (
    <div className="space-y-4 animate-fade-in">
       <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Disc className="text-teal-400" size={20} /> 槓鈴配重助手
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold">總重量 (kg)</label>
          <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-600 focus:border-teal-500 focus:outline-none mt-1" />
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-bold">槓鈴重 (kg)</label>
          <input type="number" value={barWeight} onChange={(e) => setBarWeight(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-600 focus:border-teal-500 focus:outline-none mt-1" />
        </div>
      </div>
      <button onClick={calculatePlates} className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition shadow-lg shadow-teal-900/20">計算單邊槓片</button>

      {plates.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="text-center text-slate-400 text-sm mb-2">單邊需掛</p>
          <div className="flex flex-col items-center gap-2">
            {plates.map((p, i) => (
              <div key={i} className="flex items-center gap-3 w-full max-w-[200px] bg-slate-700/50 p-2 rounded-lg border border-slate-600">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-4 text-slate-900 ${
                  p.weight >= 20 ? 'bg-red-500 border-red-700' :
                  p.weight >= 10 ? 'bg-blue-500 border-blue-700' :
                  p.weight >= 5 ? 'bg-yellow-500 border-yellow-700' : 'bg-slate-300 border-slate-500'
                }`}>
                  {p.weight}
                </div>
                <span className="text-slate-200 font-bold text-lg">x {p.count}</span>
              </div>
            ))}
          </div>
          {/* Visual Bar */}
          <div className="flex items-center justify-center mt-6 overflow-hidden">
             <div className="h-4 w-4 bg-slate-400 rounded-l-sm"></div>
             <div className="h-3 w-20 bg-slate-500"></div>
             {plates.map((p, i) => (
                <div key={i} className="flex">
                  {[...Array(p.count)].map((_, j) => (
                     <div key={`${i}-${j}`} className={`mr-0.5 border-r border-black/20 ${
                       p.weight >= 20 ? 'h-16 w-4 bg-red-600' :
                       p.weight >= 10 ? 'h-12 w-3 bg-blue-600' :
                       p.weight >= 5 ? 'h-8 w-2 bg-yellow-500' : 'h-6 w-1.5 bg-slate-300'
                     }`}></div>
                  ))}
                </div>
             ))}
             <div className="h-3 w-10 bg-slate-500 rounded-r-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const TDEECalculator: React.FC = () => {
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [activity, setActivity] = useState('1.2');
  const [tdee, setTdee] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    if (w && h && a) {
      // Mifflin-St Jeor
      let bmr = (10 * w) + (6.25 * h) - (5 * a);
      bmr += gender === 'male' ? 5 : -161;
      setTdee(Math.round(bmr * parseFloat(activity)));
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
       <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
        <Activity className="text-teal-400" size={20} /> TDEE 每日消耗
      </h2>
      
      <div className="flex gap-2 mb-2">
        <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg border ${gender === 'male' ? 'bg-blue-600 border-blue-400 text-white' : 'border-slate-600 text-slate-400'}`}>男</button>
        <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg border ${gender === 'female' ? 'bg-pink-600 border-pink-400 text-white' : 'border-slate-600 text-slate-400'}`}>女</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
         <input placeholder="體重(kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-slate-900 text-white p-2 rounded-xl border border-slate-600" />
         <input placeholder="身高(cm)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="bg-slate-900 text-white p-2 rounded-xl border border-slate-600" />
         <input placeholder="年齡" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="bg-slate-900 text-white p-2 rounded-xl border border-slate-600" />
      </div>
      
      <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-600">
        <option value="1.2">久坐不動 (1.2)</option>
        <option value="1.375">輕度活動 1-3天/週 (1.375)</option>
        <option value="1.55">中度活動 3-5天/週 (1.55)</option>
        <option value="1.725">高度活動 6-7天/週 (1.725)</option>
      </select>

      <button onClick={calculate} className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-3 rounded-xl transition">計算</button>

      {tdee && (
        <div className="mt-4 p-4 bg-slate-700/50 rounded-xl text-center">
           <p className="text-slate-400 text-xs">維持體重所需熱量</p>
           <p className="text-3xl font-black text-white">{tdee} <span className="text-sm">kcal</span></p>
           <div className="flex gap-2 mt-3 justify-center text-xs">
              <span className="text-yellow-400">增肌: {tdee + 300}</span>
              <span className="text-slate-500">|</span>
              <span className="text-teal-400">減脂: {tdee - 300}</span>
           </div>
        </div>
      )}
    </div>
  );
};

export const ToolsContainer: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'1rm' | 'plate' | 'tdee'>('1rm');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tool Selector */}
      <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
        <button 
          onClick={() => setActiveTool('1rm')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${activeTool === '1rm' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          1RM 計算
        </button>
        <button 
          onClick={() => setActiveTool('plate')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${activeTool === 'plate' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          槓鈴配重
        </button>
        <button 
          onClick={() => setActiveTool('tdee')}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${activeTool === 'tdee' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          TDEE
        </button>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-sm min-h-[400px]">
        {activeTool === '1rm' && <OneRMCalculator />}
        {activeTool === 'plate' && <PlateCalculator />}
        {activeTool === 'tdee' && <TDEECalculator />}
      </div>
    </div>
  );
};