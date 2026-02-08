import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoundedClass(themeRadius: string | undefined) {
  switch (themeRadius) {
    case 'pill':
      return 'rounded-full';
    case 'round':
      return 'rounded-xl';
    case 'soft':
      return 'rounded-lg';
    case 'sharp':
      return 'rounded-none';
    default:
      return 'rounded-full'; // Default to full circle
  }
};

export function createMessageId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}