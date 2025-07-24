import { Quote } from 'lucide-react';

interface QuoteBoxProps {
  quote: string;
  author?: string;
  className?: string;
}

export default function QuoteBox({ quote, author, className = '' }: QuoteBoxProps) {
  return (
    <div className={`manifestor-quote-box ${className}`}>
      <div className="flex items-start gap-3">
        <Quote className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-foreground/80 leading-relaxed mb-2">
            "{quote}"
          </p>
          {author && (
            <p className="text-sm text-muted-foreground font-medium">
              — {author}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}