import React, { useState, useEffect, useRef } from 'react';
import { User, Dumbbell, ChevronRight, Flame, Zap, X, Calendar, Trash2, ChevronLeft, TrendingUp, Share2, Download, Camera } from 'lucide-react';
import { Exercise, ShowToastFn } from '../types';

interface DashboardProps {
  onStartWorkout: () => void;
  openCoach: (name: string | null) => void;
  showToast: ShowToastFn;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartWorkout, openCoach, showToast }) => {
  const [userNickname, setUserNickname] = useState('健友');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [levelTitle, setLevelTitle] = useState('健身學徒');
  const [volume, setVolume] = useState('0');
  const [advice, setAdvice] = useState({ text: '保持一致性是關鍵！', type: 'neutral' });
  const [heatmapData, setHeatmapData] = useState<{date: string, active: boolean}[]>([]);
  const [chartData, setChartData] = useState<{date: string, vol: number}[]>([]);
  
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [historyDetails, setHistoryDetails] = useState<Exercise[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const loadUserData = () => {
     const savedProfile = localStorage.getItem('liftflow_user_profile');
     let weeklyGoal = 3;
     if (savedProfile) {
       try { 
         const p = JSON.parse(savedProfile);
         if (p.nickname) setUserNickname(p.nickname);
         if (p.avatar) setUserAvatar(p.avatar);
         if (p.weeklyGoal) weeklyGoal = p.weeklyGoal;
       } catch (e) { console.error(e); }
     }

     const historyJson = localStorage.getItem('liftflow_history');
     let totalVol = 0;
     const activeDates = new Set<string>();
     const volByDate: Record<string, number> = {};

     if (historyJson) {
       try {
         const history = JSON.parse(historyJson);
         Object.keys(history).forEach(date => {
            const exercises = history[date];
            if (exercises && exercises.length > 0) {
                let hasDone = false;
                let dayVol = 0;
                exercises.forEach((ex: any) => {
                    ex.sets?.forEach((s: any) => {
                        if (s.completed && !s.isWarmup) { // 排除暖身組
                            if (s.kg && s.reps) {
                                const v = s.kg * s.reps;
                                totalVol += v;
                                dayVol += v;
                            }
                            hasDone = true;
                        }
                    });
                });
                if (hasDone) {
                    activeDates.add(date);
                    if (dayVol > 0) volByDate[date] = dayVol;
                }
            }
         });
       } catch (e) { console.error(e); }
     }
     
     // 修正：直接顯示 KG (不除以 1000)
     setVolume(totalVol.toLocaleString());

     const sortedDates = Object.keys(volByDate).sort();
     const lastSessions = sortedDates.slice(-7).map(d => ({
         date: d.substring(5).replace('-','/'),
         vol: volByDate[d] // 直接使用 KG
     }));
     if (lastSessions.length === 0) lastSessions.push({ date: 'No Data', vol: 0 });
     setChartData(lastSessions);

     const rawLevel = Math.floor(Math.sqrt(totalVol / 1000)) + 1;
     const titles = [
        { lv: 1, title: '健身學徒' },
        { lv: 5, title: '初級訓練者' },
        { lv: 10, title: '中級健友' },
        { lv: 20, title: '健身愛好者' },
        { lv: 30, title: '鋼鐵戰士' },
        { lv: 40, title: '菁英運動員' },
        { lv: 50, title: '傳奇巨獸' },
        { lv: 100, title: '健身之神' },
      ];
      let t = titles[0].title;
      for (let i = titles.length - 1; i >= 0; i--) {
        if (rawLevel >= titles[i].lv) { t = titles[i].title; break; }
      }
      setLevelTitle(`Lv.${rawLevel} ${t}`);

      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const heatmap = [];
      for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          heatmap.push({ date: dateStr, active: activeDates.has(dateStr) });
      }
      setHeatmapData(heatmap);

      const today = new Date();
      let last7DaysActive = 0;
      for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          if (activeDates.has(dateStr)) last7DaysActive++;
      }

      if (last7DaysActive > weeklyGoal + 1) setAdvice({ text: '⚠️ 訓練量很大，注意身體恢復與睡眠喔！', type: 'warning' });
      else if (last7DaysActive >= weeklyGoal - 1) setAdvice({ text: '🔥 目前的訓練頻率非常完美，繼續保持！', type: 'good' });
      else setAdvice({ text: `💪 本週還差 ${Math.max(0, weeklyGoal - last7DaysActive)} 天達標，加油！`, type: 'encourage' });
  };

  useEffect(() => {
    loadUserData();
    const handleUpdate = () => loadUserData();
    window.addEventListener('liftflow_data_update', handleUpdate);
    return () => window.removeEventListener('liftflow_data_update', handleUpdate);
  }, [viewDate]);

  const changeMonth = (offset: number) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + offset);
      setViewDate(newDate);
  };

  const handleHeatmapClick = (date: string) => {
    const historyJson = localStorage.getItem('liftflow_history');
    if (historyJson) {
        const history = JSON.parse(historyJson);
        const dayData = history[date] || [];
        setHistoryDetails(dayData);
        setSelectedHistoryDate(date);
        setShowDeleteConfirm(false);
    }
  };

  const handleDeleteHistory = () => {
    if (!selectedHistoryDate) return;
    const historyJson = localStorage.getItem('liftflow_history');
    if (historyJson) {
        const history = JSON.parse(historyJson);
        if (history[selectedHistoryDate]) {
            delete history[selectedHistoryDate];
            localStorage.setItem('liftflow_history', JSON.stringify(history));
            window.dispatchEvent(new Event('liftflow_data_update'));
            setSelectedHistoryDate(null);
            setShowDeleteConfirm(false);
            loadUserData();
            showToast("紀錄已刪除", 'info');
        }
    }
  };

  const renderChart = () => {
      if (chartData.length < 2) return null;
      const height = 60;
      const width = 280;
      const maxVol = Math.max(...chartData.map(d => d.vol)) || 1;
      const points = chartData.map((d, i) => {
          const x = (i / (chartData.length - 1)) * width;
          const y = height - (d.vol / maxVol) * height;
          return `${x},${y}`;
      }).join(' ');

      return (
          <div className="mt-4">
              <svg width="100%" height={height + 20} viewBox={`0 0 ${width} ${height + 20}`} className="overflow-visible">
                  <polyline fill="none" stroke="#2dd4bf" strokeWidth="2" points={points} />
                  <polygon fill="url(#grad)" points={`${points} ${width},${height} 0,${height}`} opacity="0.2" />
                  <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#2dd4bf" />
                          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                      </linearGradient>
                  </defs>
                  {chartData.map((d, i) => {
                      const x = (i / (chartData.length - 1)) * width;
                      const y = height - (d.vol / maxVol) * height;
                      return (
                          <g key={i}>
                              <circle cx={x} cy={y} r="3" fill="#2dd4bf" />
                              <text x={x} y={height + 15} fontSize="8" fill="#94a3b8" textAnchor="middle">{d.date}</text>
                              {i === chartData.length - 1 && (
                                  <text x={x} y={y - 8} fontSize="10" fill="#f1f5f9" textAnchor="middle" fontWeight="bold">{d.vol}kg</text>
                              )}
                          </g>
                      );
                  })}
              </svg>
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-black text-slate-100 tracking-tight">午安，{userNickname}</h1><p className="text-slate-400 text-sm mt-1">{levelTitle}</p></div>
        <button onClick={() => openCoach(null)} className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 hover:border-teal-500 transition relative overflow-hidden">
          {userAvatar ? <img src={userAvatar} alt="User" className="w-full h-full object-cover" /> : <User className="text-slate-200" size={24} />}
          <div className="absolute top-0 right-0 w-3 h-3 bg-teal-500 rounded-full border-2 border-slate-900 z-10"></div>
        </button>
      </div>

      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-6 shadow-xl shadow-teal-900/20 relative overflow-hidden group cursor-pointer" onClick={onStartWorkout}>
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start"><h2 className="text-2xl font-black text-white">開始訓練</h2><div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><Dumbbell className="text-white" size={24} /></div></div>
          <p className="text-teal-50 font-medium mt-1 opacity-90">今日課表</p>
          <div className="mt-8 inline-flex items-center gap-2 bg-white text-teal-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md group-hover:scale-105 transition-transform">Let's Go <ChevronRight size={16} /></div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50 backdrop-blur-sm relative">
            <button onClick={() => setShowShare(true)} className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-teal-400 transition border border-slate-700 shadow-lg z-10"><Share2 size={16} /></button>
            <div className="flex justify-between items-end mb-2">
                <div><div className="text-xs text-slate-400 font-bold uppercase mb-1 flex items-center gap-1"><TrendingUp size={14}/> 近期容量趨勢</div><div className="text-2xl font-black text-slate-100">{volume} <span className="text-sm font-medium text-slate-500">KG (Total)</span></div></div>
                <div className="text-right mr-12"><span className="text-xs text-teal-400 font-bold bg-teal-500/10 px-2 py-1 rounded">Last 7 Sessions</span></div>
            </div>
            {renderChart()}
      </div>

      <div className="bg-slate-800/50 p-4 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase"><Flame size={14} className="text-orange-400" /> 訓練頻率</div>
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-2 py-1 border border-white/5">
             <button onClick={() => changeMonth(-1)} className="text-slate-400 hover:text-white transition"><ChevronLeft size={14}/></button>
             <span className="text-xs text-slate-200 font-bold min-w-[60px] text-center">{viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月</span>
             <button onClick={() => changeMonth(1)} className="text-slate-400 hover:text-white transition"><ChevronRight size={14}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {heatmapData.map((d, i) => (
             <button key={i} onClick={() => handleHeatmapClick(d.date)} title={d.date} className={`w-full aspect-square rounded-sm transition-all hover:scale-110 flex items-center justify-center text-[8px] font-bold ${d.active ? 'bg-teal-500 shadow-[0_0_5px_rgba(20,184,166,0.5)] text-teal-900' : 'bg-slate-800 hover:bg-slate-700 text-slate-600'}`}>{parseInt(d.date.split('-')[2])}</button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 p-5 flex gap-4 items-center">
        <div className="w-12 h-12 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center"><Zap size={24} className="text-yellow-400 fill-current" /></div>
        <div><h3 className="font-bold text-slate-200 text-sm">阿豪教練的建議</h3><p className={`text-xs mt-1 leading-relaxed ${advice.type === 'warning' ? 'text-orange-400' : advice.type === 'good' ? 'text-teal-400' : 'text-slate-400'}`}>"{advice.text}"</p></div>
      </div>

      {selectedHistoryDate && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in" onClick={() => setSelectedHistoryDate(null)}>
            <div className="bg-slate-900 w-full max-w-sm rounded-[2rem] border border-slate-700 p-6 shadow-2xl relative max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2"><Calendar size={20} className="text-teal-400"/><h3 className="text-xl font-bold text-white">{selectedHistoryDate}</h3></div>
                  <div className="flex items-center gap-2">
                      {historyDetails.length > 0 && (showDeleteConfirm ? (<button onClick={handleDeleteHistory} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-500 transition animate-fade-in">確認刪除?</button>) : (<button onClick={() => setShowDeleteConfirm(true)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"><Trash2 size={18}/></button>))}
                      <button onClick={() => setSelectedHistoryDate(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={18}/></button>
                  </div>
               </div>
               <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                  {historyDetails.length === 0 ? <div className="text-center py-10 text-slate-500"><p>本日無訓練記錄 💤</p></div> : historyDetails.map((ex, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                          <h4 className="font-bold text-slate-200 text-sm mb-2 flex justify-between items-center">
                              <span>{ex.name}</span>
                              {ex.note && <span className="text-[10px] font-normal text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full truncate max-w-[100px]">{ex.note}</span>}
                          </h4>
                          <div className="flex flex-wrap gap-2">{ex.sets?.filter(s => s.completed).map((s, i) => (
                              <div key={i} className={`text-xs px-2 py-1 rounded-md border ${s.isWarmup ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                                  {s.isWarmup && <Flame size={10} className="inline mr-1 fill-current"/>}
                                  {s.kg}kg x {s.reps}
                              </div>
                          ))}</div>
                      </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* Share Modal */}
      {showShare && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowShare(false)}>
              <div className="w-full max-w-xs relative" onClick={e => e.stopPropagation()}>
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] overflow-hidden border border-slate-700 shadow-2xl p-6 text-center relative">
                      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-600/20 to-transparent"></div>
                      <div className="absolute top-4 right-4"><Zap className="text-teal-400/20" size={64}/></div>
                      <div className="relative z-10">
                          <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full border-4 border-slate-700 overflow-hidden mb-3 shadow-xl">
                              {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover"/> : <User size={32} className="text-slate-500 m-auto mt-4"/>}
                          </div>
                          <h2 className="text-2xl font-black text-white">{userNickname}</h2>
                          <p className="text-teal-400 font-bold text-sm mb-6">{levelTitle}</p>
                          <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5"><div className="text-xs text-slate-400 uppercase mb-1">總容量</div><div className="text-xl font-black text-white">{volume}kg</div></div>
                              <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5"><div className="text-xs text-slate-400 uppercase mb-1">訓練日</div><div className="text-xl font-black text-white">{heatmapData.filter(d=>d.active).length}</div></div>
                          </div>
                          <div className="flex justify-center gap-1 mb-6 flex-wrap">{heatmapData.slice(0,14).map((d,i)=><div key={i} className={`w-3 h-3 rounded-sm ${d.active?'bg-teal-500':'bg-slate-800'}`}></div>)}</div>
                          <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">讓我們健一面 PRO</div>
                      </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                      <button onClick={() => setShowShare(false)} className="flex-1 py-3 bg-slate-800 rounded-xl font-bold text-slate-300">關閉</button>
                      <button onClick={() => showToast("請使用手機截圖分享！")} className="flex-1 py-3 bg-teal-600 rounded-xl font-bold text-white flex justify-center items-center gap-2 shadow-lg shadow-teal-900/20"><Camera size={16}/> 截圖分享</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};