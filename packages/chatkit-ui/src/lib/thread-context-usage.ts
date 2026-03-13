import type { TThreadContextUsageEvent } from '@xpert-ai/chatkit-types';

export type ThreadContextUsageByAgentKey = Record<
  string,
  TThreadContextUsageEvent
>;

function normalizeNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function normalizeNullableString(value: unknown): string | null {
  if (value == null) return null;
  return normalizeNonEmptyString(value);
}

export function normalizeContextUsageNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed);
    }
  }
  return null;
}

function normalizeOptionalUsageNumber(value: unknown): number {
  const normalized = normalizeContextUsageNumber(value);
  return normalized == null ? 0 : normalized;
}

function normalizeOptionalFiniteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return 0;
}

export function parseThreadContextUsageEvent(
  value: unknown,
): TThreadContextUsageEvent | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  if (raw.type !== 'thread_context_usage') return null;

  const threadId = normalizeNonEmptyString(raw.threadId);
  const agentKey = normalizeNonEmptyString(raw.agentKey);
  const usage = raw.usage;

  if (!threadId || !agentKey || !usage || typeof usage !== 'object') {
    return null;
  }

  const usageRecord = usage as Record<string, unknown>;
  const totalTokens = normalizeContextUsageNumber(usageRecord.totalTokens);
  if (totalTokens == null) return null;

  return {
    type: 'thread_context_usage',
    threadId,
    agentKey,
    runId: normalizeNullableString(raw.runId),
    updatedAt: normalizeNonEmptyString(raw.updatedAt) ?? '',
    usage: {
      totalTokens,
      contextTokens: normalizeOptionalUsageNumber(usageRecord.contextTokens),
      inputTokens: normalizeOptionalUsageNumber(usageRecord.inputTokens),
      outputTokens: normalizeOptionalUsageNumber(usageRecord.outputTokens),
      embedTokens: normalizeOptionalUsageNumber(usageRecord.embedTokens),
      totalPrice: normalizeOptionalFiniteNumber(usageRecord.totalPrice),
      currency:
        raw.usage && typeof usageRecord.currency === 'string'
          ? usageRecord.currency
          : usageRecord.currency == null
            ? null
            : undefined,
    },
  };
}

export function isThreadContextUsageEvent(
  value: unknown,
): value is TThreadContextUsageEvent {
  return parseThreadContextUsageEvent(value) != null;
}

export function upsertThreadContextUsage(
  state: ThreadContextUsageByAgentKey,
  event: TThreadContextUsageEvent,
): ThreadContextUsageByAgentKey {
  return {
    ...(state ?? {}),
    [event.agentKey]: event,
  };
}

export function applyThreadContextUsageEvent(
  state: ThreadContextUsageByAgentKey,
  event: TThreadContextUsageEvent,
  activeThreadId: string | null | undefined,
): ThreadContextUsageByAgentKey {
  if (!activeThreadId || event.threadId !== activeThreadId) {
    return state ?? {};
  }
  return upsertThreadContextUsage(state, event);
}

export function getThreadContextUsage(
  state: ThreadContextUsageByAgentKey,
  agentKey: string | null | undefined,
): TThreadContextUsageEvent | null {
  if (!agentKey) return null;
  return state[agentKey] ?? null;
}

export function getThreadContextUsageTotalTokens(
  event: TThreadContextUsageEvent | null | undefined,
): number | null {
  return normalizeContextUsageNumber(event?.usage?.totalTokens);
}

export function resolveUsedContextSize(options: {
  realtimeUsage?: TThreadContextUsageEvent | null;
  fallbackUsedTokens?: unknown;
}): number {
  const realtimeUsedTokens = getThreadContextUsageTotalTokens(
    options.realtimeUsage,
  );
  if (realtimeUsedTokens != null) {
    return realtimeUsedTokens;
  }
  return normalizeContextUsageNumber(options.fallbackUsedTokens) ?? 0;
}
