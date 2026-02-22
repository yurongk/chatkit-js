import * as React from 'react';

import { cn } from '../../lib/utils';
import { useStreamContext } from '../../providers/Stream';
import { useChatkitTranslation } from '../../i18n/useChatkitTranslation';
import { ProgressCircle } from '../ui/progress-circle';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type ContextUsageIndicatorProps = {
  fallbackApiKey?: string;
  label?: string;
  className?: string;
};

const kNumberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

function normalizeContextSize(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
}

function resolveAssistantContextSize(assistant: {
  metadata?: Record<string, unknown> | null;
  config?: { configurable?: Record<string, unknown> } | null;
}): number | null {
  return (
    normalizeContextSize(assistant.metadata?.context_size) ??
    normalizeContextSize(assistant.config?.configurable?.context_size)
  );
}

async function fetchThreadContextTokens(
  apiUrl: string,
  apiKey: string,
  threadId: string,
): Promise<number | null> {
  const endpoint = `${apiUrl.replace(/\/$/, '')}/threads/${threadId}/context-usage`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load context usage: ${response.status}`);
  }

  const payload = (await response.json()) as {
    usage?: {
      context_tokens?: unknown;
    };
  };

  return normalizeContextSize(payload?.usage?.context_tokens);
}

function clampUsage(value: number | null, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.min(Math.floor(value), max);
}

function formatCountInK(value: number): string {
  return `${kNumberFormatter.format(value / 1000)}K`;
}

export function ContextUsageIndicator({
  fallbackApiKey,
  label,
  className,
}: ContextUsageIndicatorProps) {
  const { t } = useChatkitTranslation();
  const stream = useStreamContext();
  const [maxContextSize, setMaxContextSize] = React.useState<number | null>(null);
  const [usedContextSize, setUsedContextSize] = React.useState<number | null>(null);
  const effectiveApiKey = stream.apiKey?.trim() ? stream.apiKey : (fallbackApiKey ?? '');

  React.useEffect(() => {
    if (!stream.client || !stream.assistantId) {
      setMaxContextSize(null);
      return;
    }

    let cancelled = false;
    stream.client.assistants
      .get(stream.assistantId)
      .then((assistant) => {
        if (cancelled || !assistant) return;
        setMaxContextSize(resolveAssistantContextSize(assistant));
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[Chat] Failed to load assistant context size:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [stream.client, stream.assistantId]);

  React.useEffect(() => {
    if (!stream.apiUrl || !effectiveApiKey.trim()) {
      setUsedContextSize(null);
      return;
    }
    if (!stream.threadId) {
      setUsedContextSize(0);
      return;
    }
    if (stream.isLoading) return;

    let cancelled = false;
    fetchThreadContextTokens(stream.apiUrl, effectiveApiKey, stream.threadId)
      .then((result) => {
        if (cancelled) return;
        setUsedContextSize(result ?? 0);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[Chat] Failed to load thread context usage:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveApiKey, stream.apiUrl, stream.threadId, stream.isLoading]);

  if (
    typeof maxContextSize !== 'number' ||
    !Number.isFinite(maxContextSize) ||
    maxContextSize <= 0
  ) {
    return null;
  }

  const max = Math.floor(maxContextSize);
  const used = clampUsage(usedContextSize, max);
  const percent = Math.max(0, Math.min(100, (used / max) * 100));
  const roundedPercent = Math.round(percent);
  const usageSummary = `${formatCountInK(used)} / ${formatCountInK(max)} (${roundedPercent}%)`;
  const usageLabel = label ?? t('chat.contextUsage.label');
  const progressClassName =
    percent >= 90 ? 'text-destructive' : percent >= 75 ? 'text-amber-500' : 'text-primary';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
            className,
          )}
          aria-label={`${usageLabel}: ${usageSummary}`}
        >
          <ProgressCircle value={percent} className={cn('size-3.5', progressClassName)} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6} className="space-y-0.5 px-2 py-1.5">
        <div className="font-medium">{usageLabel}</div>
        <div>{usageSummary}</div>
      </TooltipContent>
    </Tooltip>
  );
}
