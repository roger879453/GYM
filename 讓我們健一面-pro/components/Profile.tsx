import React, { useState, useEffect } from 'react';
import { Camera, Trash2, Calendar, User, Upload, Activity, Zap, Edit2, Target, Download, FileJson, X, AlertTriangle, Layers, ArrowRightLeft, Key, ExternalLink, Save } from 'lucide-react';
import { UserProfile, LevelInfo, ShowToastFn } from '../types';
import { setCustomApiKey, getCustomApiKey } from '../services/aiService';

interface PhotoRecord {
  id: number;
  date: string;
  url: string;
  note?: string;
}

interface ProfileProps {
  openCoach: (context: string, imageUrl?: string) => void;
  showToast: ShowToastFn;
}

const LEVEL_TITLES = [
  { lv: 1, title: '健身學徒' },
  { lv: 5, title: '初級訓練者' },
  { lv: 10, title: '中級健友' },
  { lv: 20, title: '健身愛好者' },
  { lv: 30, title: '鋼鐵戰士' },
  { lv: 40, title: '菁英運動員' },
  { lv: 50, title: '傳奇巨獸' },
  { lv: 100, title: '健身之神' },
];

export const Profile: React.FC<ProfileProps> = ({ openCoach, showToast }) => {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '健友',
    gender: 'male',
    age: '',
    status: '增肌期',
    height: '',
    weight: '',
    muscle: '',
    bodyFat: '',
    weeklyGoal: 3
  });
  const [levelInfo, setLevelInfo] = useState<LevelInfo>({ level: 1, title: '健身學徒', progress: 0, totalVolume: 0 });
  const [isEditingName, setIsEditingName] = useState(false);

  // Photo Upload Modal State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);

  // Delete Confirmation State
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);

  // Comparison State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<number[]>([]);
  const [showCompareResult, setShowCompareResult] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    // Load and sanitize photos
    const savedPhotos = localStorage.getItem('liftflow_photos');
    if (savedPhotos) {
        try { 
            let parsedPhotos: PhotoRecord[] = JSON.parse(savedPhotos);
            let hasChanges = false;
            const seenIds = new Set<number>();
            
            parsedPhotos = parsedPhotos.map((p, index) => {
                if (!p.id || seenIds.has(p.id)) {
                    hasChanges = true;
                    const newId = Date.now() + index + Math.floor(Math.random() * 10000);
                    const fixedP = { ...p, id: newId };
                    seenIds.add(newId);
                    return fixedP;
                }
                seenIds.add(p.id);
                return p;
            });
            
            setPhotos(parsedPhotos);
            if (hasChanges) {
                localStorage.setItem('liftflow_photos', JSON.stringify(parsedPhotos));
            }
        } catch (e) { 
            console.error("Error loading photos:", e); 
            setPhotos([]);
        }
    }

    const savedProfile = localStorage.getItem('liftflow_user_profile');
    if (savedProfile) try { setProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) })); } catch (e) { console.error(e); }
    calculateLevel();

    // Load API Key
    const key = getCustomApiKey();
    setApiKey(key);
    if(key) setShowKeyInput(true);
  }, []);

  const calculateLevel = () => {
    const historyJson = localStorage.getItem('liftflow_history');
    let totalVolume = 0;
    if (historyJson) {
      try {
        const history = JSON.parse(historyJson);
        Object.values(history).forEach((exercises: any) => {
          exercises.forEach((ex: any) => {
            ex.sets?.forEach((s: any) => {
              if (s.completed && s.kg && s.reps) totalVolume += (s.kg * s.reps);
            });
          });
        });
      } catch (e) { console.error(e); }
    }
    const rawLevel = Math.floor(Math.sqrt(totalVolume / 1000)) + 1;
    let currentTitle = LEVEL_TITLES[0].title;
    for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
      if (rawLevel >= LEVEL_TITLES[i].lv) { currentTitle = LEVEL_TITLES[i].title; break; }
    }
    const prevVol = 1000 * Math.pow(rawLevel - 1, 2);
    const nextVol = 1000 * Math.pow(rawLevel, 2);
    const progress = Math.min(100, Math.max(0, ((totalVolume - prevVol) / (nextVol - prevVol)) * 100));
    setLevelInfo({ level: rawLevel, title: currentTitle, progress: progress, totalVolume: totalVolume });
  };

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('liftflow_user_profile', JSON.stringify(newProfile));
    window.dispatchEvent(new Event('liftflow_data_update'));
  };

  const toggleStatus = () => {
    const statuses: UserProfile['status'][] = ['增肌期', '減脂期', '維持期', '受傷休息'];
    const idx = statuses.indexOf(profile.status);
    const nextStatus = statuses[(idx + 1) % statuses.length];
    saveProfile({ ...profile, status: nextStatus });
    showToast(`狀態已更新為：${nextStatus}`, 'info');
  };

  const handleStatChange = (field: keyof UserProfile, value: string | number) => {
    saveProfile({ ...profile, [field]: value });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => { 
          saveProfile({ ...profile, avatar: reader.result as string }); 
          showToast("頭貼更新成功");
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Photo Logic Start ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const savePhotoRecord = () => {
    if (!tempPhoto) return;
    const newPhoto: PhotoRecord = { 
        id: Date.now() + Math.floor(Math.random() * 100000), // Stronger uniqueness
        date: photoDate, 
        url: tempPhoto 
    };
    
    // Read current state directly to avoid closure staleness issues
    const updatedPhotos = [newPhoto, ...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setPhotos(updatedPhotos);
    localStorage.setItem('liftflow_photos', JSON.stringify(updatedPhotos));
    
    // Reset state
    setTempPhoto(null);
    setShowPhotoModal(false);
    showToast("體態照片已新增！");
  };

  const openPhotoModal = () => {
      setPhotoDate(new Date().toISOString().split('T')[0]);
      setTempPhoto(null);
      setShowPhotoModal(true);
  };

  const confirmDeletePhoto = () => {
    if (photoToDelete === null) return;
    
    const updatedPhotos = photos.filter(p => p.id !== photoToDelete);
    setPhotos(updatedPhotos);
    localStorage.setItem('liftflow_photos', JSON.stringify(updatedPhotos));
    
    setPhotoToDelete(null);
    showToast("照片已刪除", 'info');
  };

  // --- Comparison Logic ---
  const toggleCompareMode = () => {
    if (isCompareMode) {
        setIsCompareMode(false);
        setSelectedCompareIds([]);
    } else {
        setIsCompareMode(true);
        setSelectedCompareIds([]);
        showToast("請選擇 2 張照片進行比較", 'info');
    }
  };

  const handleSelectForCompare = (id: number) => {
    if (selectedCompareIds.includes(id)) {
        setSelectedCompareIds(prev => prev.filter(pid => pid !== id));
    } else {
        if (selectedCompareIds.length < 2) {
            const newSelection = [...selectedCompareIds, id];
            setSelectedCompareIds(newSelection);
            if (newSelection.length === 2) {
                setTimeout(() => setShowCompareResult(true), 300);
            }
        }
    }
  };
  
  // --- Photo Logic End ---

  // --- API Key Logic ---
  const handleSaveApiKey = () => {
      setCustomApiKey(apiKey);
      showToast(apiKey ? "API Key 已儲存！" : "API Key 已移除");
  };
  // --------------------

  const triggerCoachStatsAnalysis = () => {
    const context = `身體數據評估：\n- 暱稱: ${profile.nickname}\n- 性別: ${profile.gender}\n- 年齡: ${profile.age}\n- 體重: ${profile.weight}\n- 體脂: ${profile.bodyFat}`;
    openCoach(context);
  };

  const handleExportData = () => {
    const data = {
        profile: localStorage.getItem('liftflow_user_profile'),
        history: localStorage.getItem('liftflow_history'),
        photos: localStorage.getItem('liftflow_photos'),
        timer: localStorage.getItem('liftflow_rest_timer'),
        apiKey: localStorage.getItem('liftflow_api_key') // Optional export
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LiftFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("資料匯出成功！");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                if (data.profile) localStorage.setItem('liftflow_user_profile', data.profile);
                if (data.history) localStorage.setItem('liftflow_history', data.history);
                if (data.photos) localStorage.setItem('liftflow_photos', data.photos);
                if (data.timer) localStorage.setItem('liftflow_rest_timer', data.timer);
                if (data.apiKey) localStorage.setItem('liftflow_api_key', data.apiKey);
                showToast("數據還原成功！頁面將重新整理", 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                showToast("檔案格式錯誤，無法還原。", 'error');
            }
        };
        reader.readAsText(file);
    }
  };

  // Get comparison photos
  const comparePhoto1 = photos.find(p => p.id === selectedCompareIds[0]);
  const comparePhoto2 = photos.find(p => p.id === selectedCompareIds[1]);
  // Sort by date for display (Left: Older, Right: Newer)
  const compareSorted = [comparePhoto1, comparePhoto2].sort((a,b) => {
      if(!a || !b) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2rem] border border-slate-700 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex items-start gap-5">
              <label className="w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shrink-0 border-4 border-slate-800/50 cursor-pointer overflow-hidden relative group/avatar">
                  {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover"/> : <User size={36} className="text-slate-900"/>}
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                   {isEditingName ? (
                     <input autoFocus type="text" value={profile.nickname} onChange={(e) => handleStatChange('nickname', e.target.value)} onBlur={() => setIsEditingName(false)} className="bg-slate-950/50 text-white font-black text-2xl w-full rounded px-2 py-0 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                   ) : (
                     <h2 className="text-2xl font-black text-white tracking-tight truncate cursor-pointer hover:text-teal-400 transition flex items-center gap-2" onClick={() => setIsEditingName(true)}>{profile.nickname} <Edit2 size={14} className="text-slate-500"/></h2>
                   )}
                 </div>
                 <div className="flex items-center gap-2 mb-3">
                   <span className="text-xs font-bold bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20">Lv.{levelInfo.level}</span>
                   <span className="text-sm font-bold text-slate-300">{levelInfo.title}</span>
                 </div>
                 <button onClick={toggleStatus} className={`text-[10px] font-bold px-3 py-1 rounded-full border transition ${profile.status === '增肌期' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : profile.status === '減脂期' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>{profile.status}</button>
              </div>
          </div>
          <div className="relative z-10 mt-6">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider"><span>EXP</span><span>{(levelInfo.totalVolume / 1000).toFixed(1)}k / {((levelInfo.totalVolume / 1000) + (100 - levelInfo.progress)).toFixed(1)}k</span></div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${levelInfo.progress}%` }}></div></div>
          </div>
      </div>

      <div className="bg-slate-800/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
         <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm"><Target size={16} className="text-teal-400"/> 每週目標天數</h3><span className="text-teal-400 font-black text-lg">{profile.weeklyGoal} <span className="text-xs text-slate-500">天</span></span></div>
         <input type="range" min="1" max="7" step="1" value={profile.weeklyGoal} onChange={(e) => handleStatChange('weeklyGoal', Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"/>
      </div>

      <div className="bg-slate-800/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm relative">
         <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-slate-200 flex items-center gap-2"><Activity size={20} className="text-teal-400"/> 身體數據</h3><button onClick={triggerCoachStatsAnalysis} className="text-xs bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/30 px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition"><Zap size={14} fill="currentColor" /> 教練評估</button></div>
         <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex flex-col relative"><label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">性別</label><div className="flex gap-2 mt-1"><button onClick={() => handleStatChange('gender', 'male')} className={`flex-1 py-1 rounded text-sm font-bold transition ${profile.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>男</button><button onClick={() => handleStatChange('gender', 'female')} className={`flex-1 py-1 rounded text-sm font-bold transition ${profile.gender === 'female' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-500'}`}>女</button></div></div>
             <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex flex-col"><label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">年齡</label><input type="number" value={profile.age} onChange={(e) => handleStatChange('age', e.target.value)} className="bg-transparent text-white font-black text-xl w-full focus:outline-none" placeholder="-"/></div>
             {[{l:'身高 (cm)', k:'height'}, {l:'體重 (kg)', k:'weight'}, {l:'骨骼肌 (kg)', k:'muscle'}, {l:'體脂率 (%)', k:'bodyFat'}].map((item) => (
               <div key={item.k} className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex flex-col"><label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{item.l}</label><input type="number" value={profile[item.k as keyof UserProfile] as string} onChange={(e) => handleStatChange(item.k as keyof UserProfile, e.target.value)} className="bg-transparent text-white font-black text-xl w-full focus:outline-none" placeholder="-"/></div>
             ))}
         </div>
      </div>

      <div>
         <div className="flex justify-between items-center mb-4 px-2">
           <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
             <Camera className="text-teal-400" size={20} /> 體態記錄牆
           </h3>
           <div className="flex gap-2">
               {photos.length >= 2 && (
                   <button 
                     onClick={toggleCompareMode}
                     className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${isCompareMode ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                   >
                     <Layers size={14} /> {isCompareMode ? '取消比較' : '對比'}
                   </button>
               )}
               {!isCompareMode && (
                   <button 
                     onClick={openPhotoModal} 
                     className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition"
                   >
                     <Upload size={14} /> 新增
                   </button>
               )}
           </div>
         </div>
         
         {photos.length === 0 ? (
           <div className="text-center py-8 text-slate-500">暫無照片</div>
         ) : (
           <div className="grid grid-cols-2 gap-4">
             {photos.map(p => {
               const isSelected = selectedCompareIds.includes(p.id);
               return (
                 <div 
                   key={p.id} 
                   className={`bg-slate-800 rounded-3xl overflow-hidden relative aspect-[3/4] group shadow-lg border transition-all duration-300 cursor-pointer ${
                       isCompareMode 
                         ? isSelected ? 'border-teal-400 ring-2 ring-teal-500/50 scale-[0.98]' : 'border-slate-700/50 opacity-60 hover:opacity-100'
                         : 'border-slate-700/50'
                   }`}
                   onClick={() => {
                       if(isCompareMode) handleSelectForCompare(p.id);
                   }}
                 >
                    <img src={p.url} className="w-full h-full object-cover"/>
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none transition ${isCompareMode ? 'opacity-20' : ''}`}></div>
                    
                    {/* Selection Indicator */}
                    {isCompareMode && (
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-teal-500 border-teal-500 text-slate-900' : 'border-white/50 bg-black/30'}`}>
                            {isSelected && <span className="text-xs font-bold">{selectedCompareIds.indexOf(p.id) + 1}</span>}
                        </div>
                    )}

                    {/* Normal Mode Overlay Elements */}
                    {!isCompareMode && (
                        <>
                            <div className="absolute bottom-3 left-3 pointer-events-none">
                                <div className="flex items-center gap-1.5 text-white/90 font-bold text-[10px] bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 shadow-sm">
                                <Calendar size={10} className="text-teal-400" /> {p.date}
                                </div>
                            </div>

                            <button 
                                onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPhotoToDelete(p.id);
                                }} 
                                className="absolute top-2 right-2 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:bg-red-600 hover:text-white transition border border-white/20 z-20 cursor-pointer shadow-lg active:scale-95 flex items-center justify-center group/del"
                                type="button"
                                aria-label="刪除照片"
                            >
                                <Trash2 size={18} className="pointer-events-none group-hover/del:text-white"/>
                            </button>
                            
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openCoach(`我想請教這張照片的體態分析 (日期: ${p.date})`, p.url);
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-600/90 hover:bg-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm flex items-center gap-1 shadow-xl z-10"
                            >
                                <Zap size={12} fill="currentColor"/> AI 分析
                            </button>
                        </>
                    )}
                 </div>
               );
             })}
           </div>
         )}
      </div>

      <div className="border-t border-slate-800 pt-6 mt-6">
          <h3 className="text-slate-400 text-sm font-bold mb-4 px-2">數據管理</h3>
          
          {/* API Key Section */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-4 mb-4">
               <button 
                  onClick={() => setShowKeyInput(!showKeyInput)} 
                  className="flex items-center gap-2 text-sm font-bold text-slate-200 w-full justify-between"
               >
                  <div className="flex items-center gap-2">
                     <Key size={16} className="text-indigo-400"/>
                     AI 設定 (API Key)
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{apiKey ? '已設定' : '未設定'}</div>
               </button>
               
               {showKeyInput && (
                   <div className="mt-4 space-y-3 animate-fade-in">
                        <div className="text-xs text-slate-400 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                           <p>輸入您的 Google Gemini API Key 以啟用完整 AI 功能。Key 僅儲存在您的手機上，不會上傳至伺服器。</p>
                           <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2 inline-block font-bold">
                               <ExternalLink size={10}/> 取得免費 Key
                           </a>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)} 
                                placeholder="貼上您的 API Key (AIza...)"
                                className="flex-1 bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                            />
                            <button onClick={handleSaveApiKey} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition">
                                <Save size={16} />
                            </button>
                        </div>
                   </div>
               )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
              <button onClick={handleExportData} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition"><Download size={16} /> 匯出備份</button>
              <label className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition cursor-pointer"><FileJson size={16} /> 匯入還原<input type="file" accept=".json" onChange={handleImportData} className="hidden" /></label>
          </div>
      </div>

      {/* Comparison Modal */}
      {showCompareResult && compareSorted[0] && compareSorted[1] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-6 animate-fade-in" onClick={() => { setShowCompareResult(false); setIsCompareMode(false); setSelectedCompareIds([]); }}>
              <div className="bg-slate-950 w-full max-w-2xl rounded-3xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden h-[85vh]" onClick={e => e.stopPropagation()}>
                  <div className="p-4 bg-slate-900 border-b border-white/5 flex justify-between items-center shrink-0">
                      <h3 className="text-white font-bold flex items-center gap-2"><ArrowRightLeft className="text-teal-400"/> 體態對照</h3>
                      <button onClick={() => { setShowCompareResult(false); setIsCompareMode(false); setSelectedCompareIds([]); }} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col sm:flex-row gap-4">
                      {/* Before */}
                      <div className="flex-1 flex flex-col">
                          <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700">BEFORE</span>
                              <span className="text-sm font-bold text-teal-400">{compareSorted[0]?.date}</span>
                          </div>
                          <div className="relative rounded-2xl overflow-hidden border border-slate-700 flex-1 bg-black">
                              <img src={compareSorted[0]?.url} className="w-full h-full object-contain" />
                          </div>
                      </div>
                      
                      {/* After */}
                      <div className="flex-1 flex flex-col">
                          <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-bold bg-teal-600 text-white px-2 py-1 rounded-lg border border-teal-500 shadow-lg shadow-teal-900/50">AFTER</span>
                              <span className="text-sm font-bold text-teal-400">{compareSorted[1]?.date}</span>
                          </div>
                          <div className="relative rounded-2xl overflow-hidden border border-teal-500/30 flex-1 bg-black shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                              <img src={compareSorted[1]?.url} className="w-full h-full object-contain" />
                          </div>
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
                      <p className="text-center text-xs text-slate-500 mb-3">您可以截圖保存此對比畫面</p>
                      <button 
                         onClick={() => {
                             const context = `請分析這兩張體態照片的變化：\n圖1 (Before): ${compareSorted[0]?.date}\n圖2 (After): ${compareSorted[1]?.date}\n請指出進步的地方與還需加強的部位。`;
                             openCoach(context); // Note: Current simple AI modal only handles one image upload flow, this is a prompt trigger.
                         }}
                         className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold rounded-xl transition flex items-center justify-center gap-2"
                      >
                          <Zap size={16}/> 詢問教練分析差異 (文字諮詢)
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowPhotoModal(false)}>
            <div className="bg-slate-900 w-full max-w-sm rounded-[2rem] border border-slate-700 p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Camera className="text-teal-400"/> 新增體態記錄</h3>
                    <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition"><X size={18}/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase block mb-2">拍攝日期</label>
                        <input 
                            type="date" 
                            value={photoDate} 
                            onChange={(e) => setPhotoDate(e.target.value)} 
                            className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-600 focus:border-teal-500 outline-none font-bold"
                        />
                    </div>
                    
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase block mb-2">照片</label>
                        {tempPhoto ? (
                            <div className="relative rounded-xl overflow-hidden aspect-[3/4] border border-slate-600 group">
                                <img src={tempPhoto} className="w-full h-full object-cover" />
                                <button onClick={() => setTempPhoto(null)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                                    <span className="text-white text-xs font-bold border border-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition">更換照片</span>
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-[3/4] bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-slate-800/50 transition group">
                                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-2 group-hover:bg-slate-600 transition">
                                   <Upload size={24} className="text-slate-400 group-hover:text-teal-400"/>
                                </div>
                                <span className="text-slate-400 text-xs font-bold group-hover:text-white">點擊上傳照片</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                            </label>
                        )}
                    </div>
                    
                    <button 
                        onClick={savePhotoRecord} 
                        disabled={!tempPhoto}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-bold transition shadow-lg shadow-teal-900/20 mt-2"
                    >
                        儲存紀錄
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {photoToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-fade-in" onClick={() => setPhotoToDelete(null)}>
            <div className="bg-slate-900 w-full max-w-xs rounded-3xl border border-red-500/30 p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">確定刪除照片？</h3>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">此動作無法復原，您確定要永久移除這張體態記錄嗎？</p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setPhotoToDelete(null)}
                            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition"
                        >
                            取消
                        </button>
                        <button 
                            onClick={confirmDeletePhoto}
                            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 shadow-lg shadow-red-900/20 transition"
                        >
                            確認刪除
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};