import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeInput(input: string): string {
  // Remove HTML tags and trim whitespace
  return input.replace(/<[^>]*>?/gm, '').trim();
}

export function getDreamProgress(dream: { checklist?: { done: boolean }[] }): number {
  if (!dream?.checklist || dream.checklist.length === 0) {
    return 0;
  }
  const completed = dream.checklist.filter((item) => item.done).length;
  return Math.round((completed / dream.checklist.length) * 100);
}
