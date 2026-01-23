import { ArrowUp, Square } from 'lucide-react';
import { cn } from '../../lib/utils';

export type SendButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  onStop?: () => void;
  stopLabel?: string;
  sendLabel?: string;
};

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
        <Square size={14} fill="currentColor" stroke="currentColor" strokeWidth={0} />
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
      <ArrowUp size={18} strokeWidth={2.5} />
    </button>
  );
}

export default SendButton;
