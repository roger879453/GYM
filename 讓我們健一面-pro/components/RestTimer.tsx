import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  onComplete?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds, onComplete, isActive, setIsActive }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      if (onComplete) onComplete();
      setSeconds(initialSeconds);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, initialSeconds, onComplete, setIsActive]);

  useEffect(() => {
    if(isActive) setSeconds(initialSeconds);
  }, [initialSeconds, isActive]);

  if (!isActive) return null;

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-teal-500/50 text-teal-400 px-6 py-2 rounded-full shadow-xl z-50 flex items-center gap-3 animate-bounce-subtle backdrop-blur-md cursor-pointer hover:bg-slate-700 transition">
      <Clock size={18} className="animate-pulse" />
      <span className="font-mono font-bold text-lg">{formatTime(seconds)}</span>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsActive(false);
        }} 
        className="text-xs text-slate-400 hover:text-white ml-2"
      >
        跳過
      </button>
    </div>
  );
};