import React from 'react';

interface ExerciseImageProps {
  name: string;
  colorClass: string;
}

export const ExerciseImage: React.FC<ExerciseImageProps> = ({ name, colorClass }) => (
  <div className={`w-16 h-16 rounded-lg ${colorClass || 'bg-slate-700'} flex items-center justify-center shrink-0 shadow-inner`}>
    <span className="text-white font-bold text-xs text-center px-1 leading-tight opacity-90">{name}</span>
  </div>
);