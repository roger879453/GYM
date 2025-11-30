export interface WorkoutSet {
  id: number;
  kg: number;
  reps: number;
  rpe: number;
  completed: boolean;
  isWarmup?: boolean; // 新增：暖身組標記
}

export interface Exercise {
  id: string;
  name: string;
  part: string;
  type: string;
  tips: string;
  iconColor: string;
  localId?: number;
  note?: string; // 新增：動作備註
  sets?: WorkoutSet[];
}

export interface Message {
  role: 'user' | 'coach';
  text: string;
  image?: string;
}

export interface Feedback {
  score: number;
  points: string[];
}

export type Tab = 'home' | 'workout' | 'tools' | 'profile';

export interface UserProfile {
  nickname: string;
  avatar?: string;
  gender: 'male' | 'female' | 'other';
  age: string;
  status: '增肌期' | '減脂期' | '維持期' | '受傷休息';
  height: string;
  weight: string;
  muscle: string;
  bodyFat: string;
  weeklyGoal: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  progress: number;
  totalVolume: number;
}

export type ToastType = 'success' | 'error' | 'info';
export type ShowToastFn = (message: string, type?: ToastType) => void;
