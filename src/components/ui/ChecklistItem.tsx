import { Check } from 'lucide-react';
import { Checkbox } from './checkbox';

interface ChecklistItemProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: (id: string) => void;
  className?: string;
}

export default function ChecklistItem({ id, text, completed, onToggle, className = '' }: ChecklistItemProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${className}`}>
      <Checkbox
        id={id}
        checked={completed}
        onCheckedChange={() => onToggle(id)}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <label
        htmlFor={id}
        className={`flex-1 text-sm cursor-pointer transition-all ${
          completed 
            ? 'text-muted-foreground line-through' 
            : 'text-foreground hover:text-primary'
        }`}
      >
        {text}
      </label>
      {completed && (
        <Check className="w-4 h-4 text-primary" />
      )}
    </div>
  );
}