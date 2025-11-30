import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Clock, X, Trash2, Check, Plus, Flame, Search, MessageSquare, AlertTriangle, Zap, Calendar, Copy, Sparkles, BrainCircuit, History as HistoryIcon } from 'lucide-react';
import { Exercise, WorkoutSet, ShowToastFn } from '../types';
import { EXERCISE_DB } from '../constants';
import { generateWorkoutRoutine } from '../services/aiService';
import { ExerciseImage } from './ExerciseImage';

interface ActiveWorkoutProps {
  onFinish: () => void;
  triggerTimer: (seconds: number) => void;
  openCoach: (context: string) => void;
  showToast: ShowToastFn;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({ onFinish, triggerTimer, openCoach, showToast }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [restTime, setRestTime] = useState(90);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Modal State
  const [modalTab, setModalTab] = useState<'library' | 'history' | 'ai'>('library');
  const [filter, setFilter] = useState('All');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal States for Actions
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  
  // Load history on mount or date change
  useEffect(() => {
    const historyJson = localStorage.getItem('liftflow_history');
    if (historyJson) {
      try {
        const history = JSON.parse(historyJson);
        if (history[date]) {
          // Ensure every exercise has a valid localId to prevent deletion bugs
          const sanitizedExercises = history[date].map((ex: Exercise, i: number) => ({
             ...ex,
             localId: ex.localId || Date.now() + i
          }));
          setExercises(sanitizedExercises);
        } else {
          setExercises([]);
        }
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, [date]);

  // Save history whenever exercises change
  useEffect(() => {
    const saveToHistory = () => {
        const historyJson = localStorage.getItem('liftflow_history');
        const history = historyJson ? JSON.parse(historyJson) : {};
        history[date] = exercises;
        localStorage.setItem('liftflow_history', JSON.stringify(history));
        // Dispatch event for other components to update
        window.dispatchEvent(new Event('liftflow_data_update'));
    };
    saveToHistory();
  }, [exercises, date]);

  const changeDate = (offset: number) => {
    const curr = new Date(date);
    curr.setDate(curr.getDate() + offset);
    setDate(curr.toISOString().split('T')[0]);
  };

  const updateSet = (exerciseId: number, setId: number, field: keyof WorkoutSet, value: any) => {
    setExercises(prev => prev.map(ex => {
      if (ex.localId === exerciseId) {
        return {
          ...ex,
          sets: ex.sets?.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return ex;
    }));
  };

  const toggleSetCompletion = (exerciseId: number, setId: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.localId === exerciseId) {
        return {
          ...ex,
          sets: ex.sets?.map(s => {
            if (s.id === setId) {
              const newCompleted = !s.completed;
              // Trigger timer if completing a set
              if (newCompleted && !s.isWarmup) {
                triggerTimer(restTime);
              }
              return { ...s, completed: newCompleted };
            }
            return s;
          })
        };
      }
      return ex;
    }));
  };

  const addSet = (exerciseId: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.localId === exerciseId) {
        const lastSet = ex.sets && ex.sets.length > 0 ? ex.sets[ex.sets.length - 1] : null;
        const newSet: WorkoutSet = {
          id: Date.now() + Math.random(),
          kg: lastSet ? lastSet.kg : 0,
          reps: lastSet ? lastSet.reps : 0,
          rpe: lastSet ? lastSet.rpe : 8,
          completed: false,
          isWarmup: false
        };
        return { ...ex, sets: [...(ex.sets || []), newSet] };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: number, setId: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.localId === exerciseId) {
        return { ...ex, sets: ex.sets?.filter(s => s.id !== setId) };
      }
      return ex;
    }));
  };

  const confirmRemoveExercise = (e: React.MouseEvent, id: number) => {
      e.stopPropagation(); // Stop bubbling
      setExerciseToDelete(id);
  };

  const executeRemoveExercise = () => {
      if (exerciseToDelete !== null) {
          setExercises(prev => prev.filter(ex => ex.localId !== exerciseToDelete));
          setExerciseToDelete(null);
          showToast("動作已移除", 'info');
      }
  };

  const addExercise = (exerciseTemplate: Exercise) => {
    const newExercise: Exercise = {
      ...exerciseTemplate,
      localId: Date.now() + Math.random(),
      sets: [
        { id: Date.now(), kg: 0, reps: 0, rpe: 8, completed: false, isWarmup: false }
      ]
    };
    setExercises(prev => [...prev, newExercise]);
    setShowAddModal(false);
    showToast(`已新增 ${exerciseTemplate.name}`);
  };

  // --- History Copy Logic ---
  const getHistoryDates = () => {
      const historyJson = localStorage.getItem('liftflow_history');
      if (!historyJson) return [];
      const history = JSON.parse(historyJson);
      // Filter dates that have exercises
      return Object.keys(history)
          .filter(d => history[d] && history[d].length > 0 && d !== date)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  const copyWorkoutFromDate = (sourceDate: string) => {
      const historyJson = localStorage.getItem('liftflow_history');
      if (!historyJson) return;
      const history = JSON.parse(historyJson);
      const sourceExercises: Exercise[] = history[sourceDate];

      if (sourceExercises && sourceExercises.length > 0) {
          // Deep copy and reset IDs and completion status
          const newExercises = sourceExercises.map((ex, idx) => ({
              ...ex,
              localId: Date.now() + idx * 100 + Math.floor(Math.random() * 100),
              sets: ex.sets?.map((s, sIdx) => ({
                  ...s,
                  id: Date.now() + idx * 1000 + sIdx + Math.floor(Math.random() * 100),
                  completed: false,
                  // Keep kg, reps, rpe as reference
              })) || []
          }));

          setExercises(prev => [...prev, ...newExercises]);
          setShowAddModal(false);
          showToast(`已複製 ${sourceDate} 的課表！`);
      }
  };

  // --- AI Generation Logic ---
  const handleAiGenerate = async () => {
      if (!aiPrompt.trim()) {
          showToast("請輸入訓練需求", 'error');
          return;
      }
      setIsGenerating(true);
      try {
          const generated = await generateWorkoutRoutine(aiPrompt, "使用者等級: 中級");
          if (generated && generated.length > 0) {
              setExercises(prev => [...prev, ...generated]);
              setShowAddModal(false);
              showToast("AI 課表生成完畢！", 'success');
              setAiPrompt('');
          } else {
              showToast("AI 暫時無法生成，請稍後再試", 'error');
          }
      } catch (e) {
          showToast("連線錯誤", 'error');
      } finally {
          setIsGenerating(false);
      }
  };

  const handleFinishClick = () => {
      setShowFinishModal(true);
  };

  const getWorkoutSummary = () => {
      const validExercises = exercises.filter(e => e.sets?.some(s => s.completed));
      
      let summary = `📅 訓練日期：${date}\n`;
      if (validExercises.length === 0) return summary + "（今日無有效訓練紀錄）";

      validExercises.forEach(ex => {
          const sets = ex.sets?.filter(s => s.completed).map(s => 
              `${s.kg}kg x ${s.reps}${s.rpe ? ` @RPE${s.rpe}` : ''}${s.isWarmup ? '(暖)' : ''}`
          ).join(', ');
          summary += `🔹 ${ex.name}: ${sets}\n`;
      });
      return `教練你好，這是我今天的訓練內容，請嚴格評估我的訓練量、強度配置與動作選擇：\n\n${summary}`;
  };

  const executeFinish = (withAnalysis: boolean) => {
      showToast("訓練紀錄已儲存！🔥", 'success');
      setShowFinishModal(false);
      onFinish();
      
      if (withAnalysis) {
          const summary = getWorkoutSummary();
          setTimeout(() => {
              openCoach(summary);
          }, 100);
      }
  };

  return (
    <div className="pb-32 space-y-5">
      {/* Date & Settings Bar */}
      <div className="sticky top-[72px] z-30 bg-slate-950/90 backdrop-blur-md -mx-6 px-6 py-3 flex justify-between items-center border-b border-white/5 shadow-sm">
        <div className="flex bg-slate-800 rounded-xl items-center p-1 border border-slate-700">
          <button onClick={() => changeDate(-1)} className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-700">
            <ChevronLeft size={18} />
          </button>
          <div className="px-2 flex flex-col items-center">
             <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="bg-transparent text-white font-bold text-sm text-center focus:outline-none w-[110px]"
             />
          </div>
          <button onClick={() => changeDate(1)} className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-slate-700">
            <ChevronRight size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
          <Clock size={16} className="text-teal-400" />
          <div className="flex items-baseline gap-1">
             <input 
               type="number" 
               value={restTime} 
               onChange={(e) => setRestTime(Number(e.target.value))} 
               className="w-8 bg-transparent text-right font-bold text-white text-sm focus:outline-none focus:border-b focus:border-teal-500"
             />
             <span className="text-xs text-slate-500 font-bold">sec</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {exercises.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-[2rem] animate-fade-in mx-1">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
             <Clock size={32} className="text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium mb-6">本日尚無訓練紀錄</p>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="px-8 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl text-white font-bold transition shadow-lg shadow-teal-900/20 flex items-center gap-2 mx-auto"
          >
            <Plus size={18} /> 安排動作
          </button>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-4">
        {exercises.map((ex, index) => (
          <div key={ex.localId} className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-lg animate-fade-in group">
            {/* Exercise Header */}
            <div className="p-4 flex gap-4 border-b border-slate-800 items-center bg-slate-800/30">
              <ExerciseImage name={ex.name} colorClass={ex.iconColor} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-100 text-lg truncate">{ex.name}</h3>
                    <div className="flex gap-1">
                        <button onClick={() => openCoach(`我想請教關於「${ex.name}」的動作技巧`)} className="p-2 text-slate-500 hover:text-teal-400 transition bg-slate-800/50 rounded-lg">
                            <MessageSquare size={16} />
                        </button>
                        <button onClick={(e) => confirmRemoveExercise(e, ex.localId!)} className="p-2 text-slate-500 hover:text-red-400 transition bg-slate-800/50 rounded-lg">
                            <X size={16} />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{ex.tips}</p>
              </div>
            </div>

            {/* Sets List */}
            <div className="p-3 space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-[30px_1fr_1fr_1fr_36px_30px] gap-2 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <div className="text-center">Set</div>
                  <div className="text-center">KG</div>
                  <div className="text-center">Reps</div>
                  <div className="text-center">RPE</div>
                  <div className="text-center">Done</div>
                  <div></div>
              </div>

              {ex.sets?.map((s, i) => (
                <div 
                   key={s.id} 
                   className={`grid grid-cols-[30px_1fr_1fr_1fr_36px_30px] gap-2 items-center p-2 rounded-xl transition-colors duration-300 ${
                       s.completed 
                         ? s.isWarmup 
                            ? 'bg-orange-500/10 border border-orange-500/20' 
                            : 'bg-teal-500/10 border border-teal-500/20' 
                         : 'bg-slate-800/50 border border-transparent'
                   }`}
                >
                  <div className="flex justify-center">
                     <button 
                        onClick={() => updateSet(ex.localId!, s.id, 'isWarmup', !s.isWarmup)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition ${s.isWarmup ? 'text-orange-500 bg-orange-500/20' : 'text-slate-600 hover:text-orange-400'}`}
                     >
                        {s.isWarmup ? <Flame size={12} fill="currentColor" /> : <span className="text-xs font-bold text-slate-500">{i + 1}</span>}
                     </button>
                  </div>
                  
                  <input 
                    type="number" 
                    value={s.kg || ''} 
                    onChange={(e) => updateSet(ex.localId!, s.id, 'kg', e.target.value)} 
                    className={`w-full bg-transparent text-center font-black text-lg focus:outline-none placeholder-slate-700 ${s.completed ? 'text-white' : 'text-slate-200'}`}
                    placeholder="-"
                  />
                  
                  <input 
                    type="number" 
                    value={s.reps || ''} 
                    onChange={(e) => updateSet(ex.localId!, s.id, 'reps', e.target.value)} 
                    className={`w-full bg-transparent text-center font-black text-lg focus:outline-none placeholder-slate-700 ${s.completed ? 'text-white' : 'text-slate-200'}`}
                    placeholder="-"
                  />

                  <input 
                    type="number" 
                    value={s.rpe || ''} 
                    onChange={(e) => updateSet(ex.localId!, s.id, 'rpe', e.target.value)} 
                    className={`w-full bg-transparent text-center font-black text-lg focus:outline-none placeholder-slate-700 ${s.completed ? 'text-white' : 'text-slate-200'}`}
                    placeholder="-"
                    min="1" max="10"
                  />

                  <button 
                    onClick={() => toggleSetCompletion(ex.localId!, s.id)} 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                        s.completed 
                           ? s.isWarmup ? 'bg-orange-500 text-slate-900' : 'bg-teal-500 text-slate-900' 
                           : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
                    }`}
                  >
                    <Check size={18} strokeWidth={3} />
                  </button>

                  <button 
                    onClick={() => removeSet(ex.localId!, s.id)} 
                    className="flex items-center justify-center text-slate-600 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => addSet(ex.localId!)} 
                className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition flex items-center justify-center gap-2"
              >
                <Plus size={14} /> 新增組數
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {exercises.length > 0 && (
        <div className="space-y-4 mt-8">
           <button 
             onClick={() => setShowAddModal(true)} 
             className="w-full py-4 border-2 border-dashed border-slate-700 rounded-[2rem] text-slate-400 font-bold hover:text-white hover:border-slate-500 transition flex items-center justify-center gap-2"
           >
             <Plus size={20} /> 新增動作
           </button>
           
           <button 
             onClick={handleFinishClick} 
             className="w-full py-5 bg-gradient-to-r from-slate-200 to-white text-slate-900 rounded-[2rem] font-black text-lg shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
           >
             完成訓練 <Check size={20} strokeWidth={3} />
           </button>
        </div>
      )}

      {/* Add Exercise Modal (With Tabs) */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div className="bg-slate-900 w-full sm:max-w-md h-[85vh] sm:h-[80vh] rounded-[2rem] border border-slate-700 flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
               <h3 className="text-lg font-bold text-white flex items-center gap-2"><Plus size={20} className="text-teal-400" /> 安排動作</h3>
               <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            {/* Modal Tabs */}
            <div className="flex p-2 gap-2 bg-slate-950/50 border-b border-slate-800 shrink-0">
               <button 
                 onClick={() => setModalTab('library')} 
                 className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${modalTab === 'library' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <Search size={14}/> 動作庫
               </button>
               <button 
                 onClick={() => setModalTab('history')} 
                 className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${modalTab === 'history' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <HistoryIcon size={14}/> 複製歷史
               </button>
               <button 
                 onClick={() => setModalTab('ai')} 
                 className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${modalTab === 'ai' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <BrainCircuit size={14}/> AI 推薦
               </button>
            </div>

            {/* TAB 1: Library Content */}
            {modalTab === 'library' && (
              <>
                <div className="p-4 border-b border-slate-800 overflow-x-auto no-scrollbar shrink-0">
                   <div className="flex gap-2">
                     {['All', '胸部', '背部', '腿部', '肩膀', '手臂', '核心'].map(f => (
                       <button 
                          key={f} 
                          onClick={() => setFilter(f)} 
                          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                            filter === f 
                              ? 'bg-teal-600 border-teal-500 text-white shadow-lg' 
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                       >
                         {f}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                   {(filter === 'All' ? EXERCISE_DB : EXERCISE_DB.filter(e => e.part === filter)).map(exercise => (
                     <button 
                       key={exercise.id} 
                       onClick={() => addExercise(exercise)} 
                       className="w-full p-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 hover:border-teal-500/50 transition flex items-center gap-4 group text-left"
                     >
                        <ExerciseImage name={exercise.name} colorClass={exercise.iconColor} />
                        <div className="flex-1">
                           <h4 className="text-slate-200 font-bold text-sm group-hover:text-teal-400 transition">{exercise.name}</h4>
                           <p className="text-xs text-slate-500 mt-1">{exercise.part} • {exercise.type}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-slate-900 transition">
                           <Plus size={16} />
                        </div>
                     </button>
                   ))}
                </div>
              </>
            )}

            {/* TAB 2: History Content */}
            {modalTab === 'history' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 <p className="text-xs text-slate-500 font-bold px-2 mb-2">選擇過去的訓練以複製到今天：</p>
                 {getHistoryDates().length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <HistoryIcon size={32} className="mx-auto mb-2 opacity-50"/>
                        <p>尚無歷史紀錄可複製</p>
                    </div>
                 ) : (
                    getHistoryDates().map(dateKey => (
                       <div key={dateKey} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 flex items-center justify-between group hover:border-teal-500/30 transition">
                           <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <Calendar size={14} className="text-teal-400"/>
                                  <span className="font-bold text-white">{dateKey}</span>
                               </div>
                               <p className="text-xs text-slate-500">點擊右側複製完整課表</p>
                           </div>
                           <button 
                             onClick={() => copyWorkoutFromDate(dateKey)}
                             className="px-4 py-2 bg-slate-700 hover:bg-teal-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                           >
                             <Copy size={14}/> 複製此課表
                           </button>
                       </div>
                    ))
                 )}
              </div>
            )}

            {/* TAB 3: AI Recommendation Content */}
            {modalTab === 'ai' && (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                  <div className="flex-1 space-y-6">
                      <div className="text-center space-y-2">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-xl shadow-indigo-900/30">
                              <Sparkles size={32} className="text-white"/>
                          </div>
                          <h4 className="font-bold text-white text-lg">AI 智能排課</h4>
                          <p className="text-sm text-slate-400">輸入你想練的部位或目標，阿豪教練將為你即時生成專屬菜單。</p>
                      </div>
                      
                      <div className="space-y-3">
                          <label className="text-xs text-slate-400 font-bold uppercase">你的需求</label>
                          <textarea 
                             value={aiPrompt}
                             onChange={(e) => setAiPrompt(e.target.value)}
                             placeholder="例如：今天想把胸肌練爆，高強度訓練！或者：只有30分鐘，想練全身。"
                             className="w-full h-24 bg-slate-800 text-white p-4 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 resize-none text-sm"
                          />
                          <div className="flex flex-wrap gap-2">
                             {['胸部肥大', '背部厚度', '腿部力量', '全身燃脂', '肩手超級組'].map(tag => (
                                 <button 
                                   key={tag} 
                                   onClick={() => setAiPrompt(tag)}
                                   className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/30 transition"
                                 >
                                    {tag}
                                 </button>
                             ))}
                          </div>
                      </div>
                  </div>
                  
                  <button 
                     onClick={handleAiGenerate}
                     disabled={isGenerating || !aiPrompt.trim()}
                     className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-bold shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 mt-4 transition-all"
                  >
                     {isGenerating ? (
                         <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            正在生成課表...
                         </>
                     ) : (
                         <>
                            <BrainCircuit size={18} /> 開始生成
                         </>
                     )}
                  </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modals */}
      
      {/* 1. Finish Workout Modal */}
      {showFinishModal && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-fade-in" onClick={() => setShowFinishModal(false)}>
              <div className="bg-slate-900 w-full max-w-sm rounded-3xl border border-teal-500/30 p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mb-4 text-teal-400 shadow-lg shadow-teal-900/30">
                          <Check size={32} strokeWidth={3} />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">恭喜完成！</h3>
                      <p className="text-sm text-slate-400 mb-6 leading-relaxed">紀錄已暫存。需要阿豪教練幫您分析今天訓練的容量與強度配置嗎？</p>
                      <div className="flex flex-col gap-3 w-full">
                          <button 
                              onClick={() => executeFinish(true)}
                              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-teal-900/30 transition flex items-center justify-center gap-2"
                          >
                              <Zap size={16} fill="currentColor" /> 儲存並分析 (推薦)
                          </button>
                          <button 
                              onClick={() => executeFinish(false)}
                              className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition"
                          >
                              直接儲存
                          </button>
                          <button onClick={() => setShowFinishModal(false)} className="text-xs text-slate-500 mt-2 hover:text-slate-300">
                             返回修改
                          </button>
                      </div>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {/* 2. Delete Exercise Modal */}
      {exerciseToDelete !== null && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-fade-in" onClick={() => setExerciseToDelete(null)}>
              <div className="bg-slate-900 w-full max-w-xs rounded-3xl border border-red-500/30 p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                          <AlertTriangle size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">移除此動作？</h3>
                      <p className="text-sm text-slate-400 mb-6 leading-relaxed">確認要從今日課表中移除此動作及其所有組數嗎？</p>
                      <div className="flex gap-3 w-full">
                          <button 
                              onClick={() => setExerciseToDelete(null)}
                              className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition"
                          >
                              取消
                          </button>
                          <button 
                              onClick={executeRemoveExercise}
                              className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 shadow-lg shadow-red-900/20 transition"
                          >
                              確認移除
                          </button>
                      </div>
                  </div>
              </div>
          </div>,
          document.body
      )}

    </div>
  );
};