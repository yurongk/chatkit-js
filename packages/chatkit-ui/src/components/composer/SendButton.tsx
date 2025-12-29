import * as React from 'react';
import { cn } from '../../lib/utils';

export type SendButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onStop?: () => void;
  stopLabel?: string;
  sendLabel?: string;
};

// Upward arrow icon
function ArrowUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

// Stop icon (square)
function StopIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

export function SendButton({
  disabled = false,
  isLoading = false,
  onStop,
  stopLabel = 'Stop',
  sendLabel = 'Send',
}: SendButtonProps) {
  if (isLoading) {
    return (
      <button
        type="button"
        onClick={onStop}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full cursor-pointer',
          'bg-primary text-background',
          'transition-transform duration-150 ease-out',
          'hover:scale-105 active:scale-95'
        )}
        aria-label={stopLabel}
      >
        <StopIcon />
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full cursor-pointer',
        'bg-primary text-background',
        'transition-all duration-150 ease-out',
        'hover:scale-105 active:scale-95',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
      )}
      aria-label={sendLabel}
    >
      <ArrowUpIcon />
    </button>
  );
}

export default SendButton;
