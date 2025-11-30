import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-teal-600 border-teal-500 text-white',
    error: 'bg-red-600 border-red-500 text-white',
    info: 'bg-slate-800 border-slate-600 text-slate-200',
  };

  const icons = {
    success: <CheckCircle size={20} className="shrink-0" />,
    error: <XCircle size={20} className="shrink-0" />,
    info: <Info size={20} className="shrink-0" />,
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-fade-in mb-3 max-w-[90vw] ${styles[type]}`}>
      {icons[type]}
      <span className="text-sm font-bold shadow-sm">{message}</span>
    </div>
  );
};

export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center pointer-events-none">
    {children}
  </div>
);