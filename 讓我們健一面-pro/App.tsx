import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Calculator, 
  User, 
  MessageSquare, 
  BarChart3,
  Zap,
  HelpCircle,
  X,
  Download,
  Copy,
  Check,
  Share2,
  Settings,
  Globe,
  AlertTriangle,
  Github,
  Upload,
  Terminal
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ActiveWorkout } from './components/ActiveWorkout';
import { ToolsContainer } from './components/ToolsContainer';
import { RestTimer } from './components/RestTimer';
import { CoachModal } from './components/CoachModal';
import { Profile } from './components/Profile';
import { Toast, ToastContainer, ToastType } from './components/Toast';
import { Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);
  
  // Coach State
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [coachContext, setCoachContext] = useState<string | null>(null);
  const [coachImage, setCoachImage] = useState<string | null>(null);

  // Info & Install Modal State
  const [showInfo, setShowInfo] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installTab, setInstallTab] = useState<'link' | 'deploy' | 'ios' | 'android' | 'settings'>('link');
  const [copied, setCopied] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<{id: number, message: string, type: ToastType}[]>([]);

  useEffect(() => {
    const handleStorage = () => {
       window.dispatchEvent(new Event('liftflow_data_update'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const triggerTimer = (seconds = 90) => {
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  const openCoach = (context: string | null, imageUrl?: string) => {
    setCoachContext(context);
    setCoachImage(imageUrl || null);
    setIsCoachOpen(true);
  };

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getCleanUrl = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const cleanPath = path.replace(/\/index\.html$/, '/');
    return (origin + cleanPath).replace(/\/$/, '');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(getCleanUrl());
    setCopied(true);
    showToast("網址已複製！請傳送到手機開啟", 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard onStartWorkout={() => setActiveTab('workout')} openCoach={openCoach} showToast={showToast} />;
      case 'workout': return (
          <div className="space-y-4 animate-fade-in">
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-slate-100">訓練日誌</h2>
                <div className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full text-xs font-bold border border-teal-500/20 flex items-center gap-1">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span> READY
                </div>
             </div>
             <ActiveWorkout onFinish={() => setActiveTab('home')} triggerTimer={triggerTimer} openCoach={openCoach} showToast={showToast} />
          </div>
      );
      case 'tools': return <ToolsContainer />;
      case 'profile': return <Profile openCoach={openCoach} showToast={showToast} />;
      default: return <Dashboard onStartWorkout={() => setActiveTab('workout')} openCoach={openCoach} showToast={showToast} />;
    }
  };

  const getInfoContent = () => {
      switch(activeTab) {
          case 'home': return { title: '總覽說明', points: ['🔥 熱力圖：追蹤您的訓練頻率與一致性。', '📈 容量趨勢：觀察過去 7 次訓練的總負荷變化 (KG)。', '🏆 數據卡：顯示累積總容量與個人最佳紀錄 (PR)。']};
          case 'workout': return { title: '日誌說明', points: ['📋 記錄訓練：輸入重量、次數與 RPE。', '🤖 AI 排課：輸入需求（如：練胸），教練幫你排菜單。', '📝 備註與暖身：可標記暖身組（不計入容量）與添加筆記。', '⚡ 教練評價：完成後可請 AI 評價今日表現。']};
          case 'tools': return { title: '工具箱說明', points: ['💪 1RM 計算：估算您的極限肌力。', '💿 槓鈴配重：幫您計算槓鈴兩邊該掛多少槓片。', '🥗 TDEE 計算：計算每日熱量消耗與飲食建議。']};
          case 'profile': return { title: '我的檔案說明', points: ['📊 等級系統：根據訓練總量升級，獲得霸氣稱號。', '📷 體態牆：記錄身材變化，支援 AI 體態分析。', '↔️ 體態對比：選擇兩張照片進行左右對照。', '💾 數據備份：定期匯出 JSON 備份，資料不丟失。']};
      }
  };

  const info = getInfoContent();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500 selection:text-black">
      <ToastContainer>
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </ToastContainer>

      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl transform rotate-3 shadow-lg shadow-teal-900/50 flex items-center justify-center">
              <Zap size={18} className="text-slate-900 fill-current" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-100">讓我們健一面 <span className="text-teal-500 text-xs align-top">PRO</span></span>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setShowInstallModal(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-teal-400 border border-slate-700 hover:text-white hover:border-teal-500 transition shadow-lg shadow-teal-900/10">
                <Download size={16} />
             </button>
             <button onClick={() => setShowInfo(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500 transition">
                <HelpCircle size={16}/>
             </button>
             {activeTab !== 'home' && (
                <button onClick={() => openCoach(null)} className="text-xs font-bold text-teal-400 bg-teal-900/30 px-3 py-1.5 rounded-full border border-teal-500/30 flex items-center gap-1 hover:bg-teal-900/50 transition">
                  <MessageSquare size={12}/> 呼叫教練
                </button>
             )}
          </div>
        </div>
      </div>

      <main className="p-6 max-w-lg mx-auto pb-32">
        {renderContent()}
      </main>

      <RestTimer initialSeconds={timerSeconds} isActive={timerActive} setIsActive={setTimerActive} />
      <CoachModal isOpen={isCoachOpen} onClose={() => setIsCoachOpen(false)} exerciseName={coachContext} initialImage={coachImage} initialContext={coachContext} />

      {showInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in" onClick={() => setShowInfo(false)}>
              <div className="bg-slate-900 w-full max-w-sm rounded-[2rem] border border-slate-700 p-6 shadow-2xl relative" onClick={e=>e.stopPropagation()}>
                  <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2"><HelpCircle className="text-teal-400"/> {info?.title}</h3>
                  <ul className="space-y-3">
                      {info?.points.map((p,i) => (
                          <li key={i} className="text-sm text-slate-300 flex gap-3 leading-relaxed">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></div>
                              {p}
                          </li>
                      ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-white/10 text-center">
                      <p className="text-[10px] text-slate-500">讓我們健一面 PRO v1.2</p>
                  </div>
              </div>
          </div>
      )}

      {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in" onClick={() => setShowInstallModal(false)}>
              <div className="bg-slate-900 w-full max-w-sm rounded-[2rem] border border-slate-700 p-6 shadow-2xl relative flex flex-col h-[600px]" onClick={e=>e.stopPropagation()}>
                  <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10"><X size={20}/></button>
                  
                  <div className="text-center mb-4 shrink-0">
                      <h3 className="text-xl font-black text-white">安裝到手機</h3>
                  </div>

                  <div className="flex p-1 bg-slate-950 rounded-xl mb-4 shrink-0">
                      {[
                        {id:'link', label:'連結', icon:Globe},
                        {id:'deploy', label:'部署', icon:Github},
                        {id:'ios', label:'iOS', icon:Share2},
                        {id:'android', label:'Android', icon:Download},
                        {id:'settings', label:'設定', icon:Settings}
                      ].map(t => (
                        <button 
                           key={t.id} 
                           onClick={() => setInstallTab(t.id as any)}
                           className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${installTab === t.id ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <t.icon size={12}/> {t.label}
                        </button>
                      ))}
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 text-left">
                     {installTab === 'link' && (
                         <div className="space-y-4">
                             <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-2">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={getCleanUrl()} 
                                    className="bg-transparent text-slate-400 text-xs flex-1 outline-none w-full font-mono"
                                />
                             </div>
                             <button 
                                onClick={handleCopyUrl}
                                className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20"
                             >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? "已複製網址" : "複製連結"}
                             </button>
                             <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-left">
                                <h4 className="text-indigo-400 font-bold text-sm mb-1 flex items-center gap-2">
                                    <Zap size={14}/> 404 問題已修復？
                                </h4>
                                <p className="text-xs text-indigo-200/80 leading-relaxed">
                                    請務必確認您已在編輯器左側的「Source Control」進行了 Commit 與 Push，Netlify 才能收到最新的修復檔。
                                </p>
                            </div>
                         </div>
                     )}

                     {installTab === 'deploy' && (
                         <div className="space-y-4 text-sm text-slate-300">
                             <h4 className="font-bold text-white flex items-center gap-2">
                                 <AlertTriangle size={16} className="text-red-400"/> 解決 GitHub 404 (推薦)
                             </h4>
                             <p className="text-xs text-slate-400">
                                 GitHub 404 代表程式碼還沒「上傳」成功。請執行：
                             </p>
                             <ol className="list-decimal list-inside space-y-2 text-xs bg-slate-800 p-3 rounded-xl border border-slate-700">
                                 <li>點擊左側 <strong>Source Control</strong> (樹狀圖圖示)。</li>
                                 <li>在輸入框打字 (如 "fix")，按 <strong>Commit</strong>。</li>
                                 <li>點擊 <strong>Publish / Sync</strong> 按鈕。</li>
                                 <li>等待轉圈圈結束，GitHub 頁面就會正常顯示了！</li>
                             </ol>

                             <h4 className="font-bold text-white mt-4 flex items-center gap-2">
                                 <Terminal size={16} className="text-teal-400"/> 方法 B：手動指令
                             </h4>
                             <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                                 <p className="mb-2 text-yellow-500">// 注意：這需要在您的電腦安裝 Node.js</p>
                                 <p>1. 下載專案並解壓縮</p>
                                 <p>2. 打開終端機 (Terminal)</p>
                                 <p>3. 輸入 <span className="text-teal-400">npm install</span></p>
                                 <p>4. 輸入 <span className="text-teal-400">npm run build</span></p>
                                 <p>5. 上傳 dist 資料夾</p>
                             </div>
                         </div>
                     )}

                     {installTab === 'ios' && (
                         <div className="space-y-4 text-sm text-slate-300">
                             <p>1. 使用 <strong>Safari</strong> 瀏覽器打開網址。</p>
                             <p>2. 點擊畫面下方的 <strong>分享按鈕</strong> <Share2 size={14} className="inline bg-slate-700 p-0.5 rounded"/>。</p>
                             <p>3. 往下滑動，找到並點擊 <strong>「加入主畫面」</strong>。</p>
                             <p>4. 點擊右上角 <strong>「新增」</strong>，即可在桌面看到 App 圖示。</p>
                         </div>
                     )}

                     {installTab === 'android' && (
                         <div className="space-y-4 text-sm text-slate-300">
                             <p>1. 使用 <strong>Chrome</strong> 瀏覽器打開網址。</p>
                             <p>2. 點擊右上角的 <strong>選單按鈕</strong> (三個點)。</p>
                             <p>3. 點擊 <strong>「安裝應用程式」</strong> 或 <strong>「加到主畫面」</strong>。</p>
                             <p>4. 確認安裝，App 將出現在應用程式列表中。</p>
                         </div>
                     )}

                     {installTab === 'settings' && (
                         <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                             <div className="bg-teal-500/10 border border-teal-500/30 p-3 rounded-xl mb-2">
                                 <h4 className="font-bold text-teal-400 mb-1 flex items-center gap-1"><Check size={12}/> 設定檔已就緒</h4>
                                 <p><code>netlify.toml</code> 已經自動產生。這是解決 404 的關鍵。</p>
                             </div>

                             <h4 className="font-bold text-white mt-4 border-b border-white/10 pb-1">Netlify 重新部署：</h4>
                             <ol className="list-decimal list-inside space-y-1 text-slate-400">
                                 <li>如果您用 GitHub：請回到編輯器再次執行 <strong>Push/Sync</strong>。</li>
                                 <li>如果您手動上傳：請重新打包 <code>npm run build</code> 並上傳。</li>
                             </ol>

                             <h4 className="font-bold text-white mt-4 border-b border-white/10 pb-1">設定 AI Key (Netlify)：</h4>
                             <ol className="list-decimal list-inside space-y-1 text-slate-400">
                                 <li>前往 Netlify &gt; Site configuration。</li>
                                 <li>點擊 <strong>Environment variables</strong> &gt; Add a variable。</li>
                                 <li>Key 輸入 <code>API_KEY</code>。</li>
                                 <li>Value 貼上您的 Gemini Key。</li>
                                 <li>回到 Deploys &gt; Trigger deploy &gt; Clear cache and deploy。</li>
                             </ol>
                         </div>
                     )}
                  </div>
              </div>
          </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-xl border-t border-white/5 pb-safe pt-2 z-40">
        <div className="max-w-lg mx-auto flex justify-around items-center px-2">
          {[{id:'home',icon:BarChart3,label:'總覽'},{id:'workout',icon:Dumbbell,label:'日誌'},{id:'tools',icon:Calculator,label:'工具'},{id:'profile',icon:User,label:'我的'}].map(t => (
             <button key={t.id} onClick={() => setActiveTab(t.id as Tab)} className={`flex flex-col items-center p-3 rounded-2xl transition w-16 group ${activeTab === t.id ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}>
                <t.icon size={24} className={`transition-transform duration-300 ${activeTab === t.id ? 'fill-current scale-110' : 'group-hover:scale-105'}`} />
                <span className="text-[10px] font-bold mt-1">{t.label}</span>
             </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;