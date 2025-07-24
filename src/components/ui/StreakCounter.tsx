import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string; // optional text/icon color override
  bgColor?: string; // optional background color override
}

export default function StreakCounter({ streak, className = '', size = 'md', color, bgColor }: StreakCounterProps) {
  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-2',
    lg: 'text-lg gap-2'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Color logic
  let streakColor = color;
  let streakBg = bgColor;
  let border = '';
  let shadow = '';
  if (!streakColor || !streakBg) {
    if (streak >= 50) {
      streakColor = 'text-white';
      streakBg = 'bg-blue-500';
      border = 'border border-blue-500';
      shadow = 'shadow-blue-500/40';
    } else if (streak >= 30) {
      streakColor = 'text-white';
      streakBg = 'bg-red-500';
      border = 'border border-red-500';
      shadow = 'shadow-red-500/40';
    } else if (streak >= 20) {
      streakColor = 'text-white';
      streakBg = 'bg-orange-500';
      border = 'border border-orange-500';
      shadow = 'shadow-orange-500/40';
    } else if (streak >= 10) {
      streakColor = 'text-white';
      streakBg = 'bg-green-500';
      border = 'border border-green-500';
      shadow = 'shadow-green-500/40';
    } else {
      streakColor = 'text-yellow-900';
      streakBg = 'bg-yellow-400';
      border = 'border border-yellow-500';
      shadow = 'shadow-yellow-400/40';
    }
  }

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} ${streakBg} ${streakColor} ${border} px-4 py-2 rounded-full font-semibold ${shadow} shadow-md ${className}`}>
      <Flame className={`${iconSizes[size]} ${streakColor}`} />
      <span>{streak}</span>
      <span className="font-normal">day{streak !== 1 ? 's' : ''}</span>
    </div>
  );
}