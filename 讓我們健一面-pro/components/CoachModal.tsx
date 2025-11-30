import React, { useState, useRef, useEffect } from 'react';
import { User, X, Send, Camera, Zap, ChevronRight } from 'lucide-react';
import { Message, Feedback } from '../types';
import { chatWithCoach, analyzeImage } from '../services/aiService';

interface CoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string | null;
  initialImage?: string | null; // For physique analysis trigger from Profile
  initialContext?: string | null; // For custom prompt
}

export const CoachModal: React.FC<CoachModalProps> = ({ isOpen, onClose, exerciseName, initialImage, initialContext }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat when modal opens or context changes
  useEffect(() => {
    if (isOpen) {
      if (initialImage && initialContext) {
         // Special flow: Physique Analysis from Profile
         setMessages([{ role: 'coach', text: '收到您的照片。正在進行專業體態評估，請稍候...' }]);
         handleDirectAnalysis(initialImage, 'physique');
      } else {
         // Normal flow
         setMessages([{ 
            role: 'coach', 
            text: `嗨！我是阿豪教練。${exerciseName ? `關於「${exerciseName}」，你想了解什麼？或者你可以上傳動作影片/照片讓我幫你看看姿勢。` : '今天練得如何？有訓練或飲食問題隨時問我。'}` 
         }]);
         setFeedback(null);
      }
    }
  }, [isOpen, exerciseName, initialImage, initialContext]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, feedback, analyzing]);

  const handleDirectAnalysis = async (base64: string, type: 'form' | 'physique') => {
      setAnalyzing(true);
      if (type === 'physique') {
         setMessages(prev => [...prev, { role: 'user', text: '📷 [傳送了體態照片請求分析]' }]);
      } else {
         setMessages(prev => [...prev, { role: 'user', text: '📷 [上傳了圖片進行動作分析]' }]);
      }

      try {
        const result = await analyzeImage(base64, type);
        setFeedback(result);
        const doneText = type === 'physique' 
            ? '體態評估完成！這是我根據照片給出的建議（詳見上方報告）。您對於這份建議有什麼想法嗎？' 
            : '動作分析完成！請查看上方的評估報告。';
        setMessages(prev => [...prev, { role: 'coach', text: doneText }]);
      } catch (error) {
        setMessages(prev => [...prev, { role: 'coach', text: '抱歉，分析圖片時出錯了。' }]);
      } finally {
        setAnalyzing(false);
      }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        handleDirectAnalysis(base64String, 'form'); // Default to form check in chat
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const sendMessage = async () => {
    if(!chatInput.trim()) return;
    const userMsg = chatInput;
    const newHistory: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setChatInput('');
    
    // Call AI Service with history
    const context = exerciseName || initialContext || '一般對話';
    setMessages(prev => [...prev, { role: 'coach', text: '...' }]); // Typing indicator placeholder
    
    const response = await chatWithCoach(userMsg, context, newHistory);
    
    // Replace placeholder with real response
    setMessages(prev => {
        const withoutTyping = prev.slice(0, -1);
        return [...withoutTyping, { role: 'coach', text: response }];
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in sm:p-4">
      <div className="bg-slate-900 w-full sm:max-w-md sm:rounded-[2rem] h-[90vh] sm:h-[85vh] flex flex-col border-t sm:border border-slate-700 shadow-2xl overflow-hidden rounded-t-[2rem]">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center border-2 border-slate-800 shadow-lg relative">
               <User size={20} className="text-white" />
               <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-base">阿豪教練</h3>
              <p className="text-[10px] text-teal-400 font-medium flex items-center gap-1 bg-teal-900/30 px-2 py-0.5 rounded-full w-fit">
                <Zap size={8} fill="currentColor"/> AI PRO
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-br-sm' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
              }`}>
                {msg.text === '...' ? (
                    <div className="flex gap-1 h-5 items-center px-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
              </div>
            </div>
          ))}

          {/* Analysis Result Card */}
          {feedback && (
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-teal-500/20 animate-fade-in my-4 shadow-xl mx-2">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                <h4 className="font-bold text-teal-400 flex items-center gap-2">
                  <Camera size={18} /> 分析報告
                </h4>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{feedback.score}</span>
                    <span className="text-xs text-slate-400 font-bold">/ 100</span>
                </div>
              </div>
              <ul className="space-y-3">
                {feedback.points.map((point, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-3 items-start leading-relaxed">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></div> 
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-500 text-center">
                 由 Google Gemini AI 提供技術支援
              </div>
            </div>
          )}

          {analyzing && (
            <div className="flex justify-center py-4">
                <div className="bg-slate-900 border border-teal-500/30 text-teal-400 px-4 py-2 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                    正在進行深度視覺分析...
                </div>
            </div>
          )}
        </div>

        {/* Action Area */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-3 pb-safe">
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect}
           />
           
           {/* Quick Actions (only show if not typing) */}
           {!chatInput && !analyzing && !feedback && (
             <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button 
                  onClick={handleTriggerUpload}
                  className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition"
                >
                  <Camera size={14} className="text-teal-400" /> 上傳照片
                </button>
                <button 
                   onClick={() => setChatInput('我該如何突破平台期？')}
                   className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold transition"
                >
                   突破平台期?
                </button>
                <button 
                   onClick={() => setChatInput('幫我計算今天的 TDEE')}
                   className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold transition"
                >
                   TDEE 計算
                </button>
             </div>
           )}

           {/* Input */}
           <div className="flex gap-2 items-end">
             <div className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-1 flex items-center">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="輸入訊息..."
                    className="w-full bg-transparent px-3 py-2 text-slate-200 focus:outline-none text-sm placeholder:text-slate-500"
                />
             </div>
             <button 
               onClick={sendMessage}
               disabled={!chatInput.trim()}
               className="p-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 rounded-2xl text-white transition shadow-lg shadow-teal-900/20 shrink-0"
             >
               <Send size={18} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};