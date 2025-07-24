import { Clock, Tag, CheckCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { Button } from './button';

interface Dream {
  id: string;
  title: string;
  type: 'short-term' | 'long-term';
  category: string;
  targetDate: string;
  progress: number;
  checklist?: { text: string; done: boolean }[];
  description?: string;
}

interface DreamCardProps {
  dream: Dream;
  onClick?: () => void;
  className?: string;
}

export default function DreamCard({ dream, onClick, className = '' }: DreamCardProps) {
  const daysLeft = dream.targetDate ? Math.ceil((new Date(dream.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  
  const totalTasks = dream.checklist?.length || 0;
  const completedTasks = dream.checklist?.filter(item => item.done).length || 0;

  return (
    <div 
      className={`manifestor-card p-6 cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
            {dream.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{dream.category}</span>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className={isOverdue ? 'text-destructive' : ''}>
                  {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          dream.type === 'long-term' 
            ? 'bg-accent text-accent-foreground' 
            : 'bg-secondary text-secondary-foreground'
        }`}>
          {dream.type.replace('-', ' ')}
        </div>
      </div>

      {/* Description */}
      {dream.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {dream.description}
        </p>
      )}

      {/* Progress */}
      <div className="space-y-3">
        <ProgressBar progress={dream.progress} showPercentage />
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle className="w-4 h-4" />
            <span>{completedTasks} of {totalTasks} tasks</span>
          </div>
          
          <Button
            variant="ghost" 
            size="sm"
            className="text-xs hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}