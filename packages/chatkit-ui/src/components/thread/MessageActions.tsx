import * as React from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChatkitTranslation } from '../../i18n/useChatkitTranslation';

export type MessageActionsProps = {
  content: string;
  isAssistant?: boolean;
  isStreaming?: boolean;
  onRetry?: () => void;
  className?: string;
};

export function MessageActions({
  content,
  isAssistant = false,
  isStreaming = false,
  onRetry,
  className,
}: MessageActionsProps) {
  const { t } = useChatkitTranslation();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Hide actions while streaming
  if (isStreaming) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity',
        className
      )}
    >
      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
          copied && 'text-green-500'
        )}
        title={copied ? t('messageActions.copied') : t('messageActions.copy')}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>

      {/* Retry button (only for assistant messages) */}
      {isAssistant && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={t('messageActions.regenerate')}
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
}

export default MessageActions;
