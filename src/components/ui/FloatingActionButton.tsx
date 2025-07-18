import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export default function FloatingActionButton({ onClick, className = '' }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`manifestor-floating-button ${className}`}
      aria-label="Add new dream"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}