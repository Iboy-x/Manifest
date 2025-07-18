import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakCounter({ streak, className = '', size = 'md' }: StreakCounterProps) {
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

  return (
    <div className={`manifestor-streak-badge inline-flex items-center ${sizeClasses[size]} ${className}`}>
      <Flame className={`${iconSizes[size]} ${streak > 0 ? 'text-orange-400' : ''}`} />
      <span className="font-semibold">{streak}</span>
      <span className="font-normal">day{streak !== 1 ? 's' : ''}</span>
    </div>
  );
}