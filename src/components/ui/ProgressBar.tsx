interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ progress, className = '', showPercentage = false }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="manifestor-progress-bar">
        <div 
          className="manifestor-progress-fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{clampedProgress.toFixed(0)}% complete</span>
        </div>
      )}
    </div>
  );
}