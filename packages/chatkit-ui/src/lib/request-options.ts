import {
  STATE_VARIABLE_HUMAN,
  type ChatKitOptions,
  type TChatRequest,
  type TChatRequestHuman,
} from '@xpert-ai/chatkit-types';

type ChatKitRequestOptions = NonNullable<ChatKitOptions['request']>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function resolveHumanStateValue(
  value: Record<string, any> | null | undefined,
): Record<string, unknown> {
  const human = value?.[STATE_VARIABLE_HUMAN];
  return isRecord(human) ? human : {};
}

export function buildInjectedRequestOptions(input: {
  defaults?: ChatKitRequestOptions | null;
  state?: Record<string, any> | null;
  context?: Record<string, unknown> | null;
  humanInput?: TChatRequestHuman | null;
}): {
  state?: TChatRequest['state'];
  context?: Record<string, unknown>;
} {
  const defaultState = input.defaults?.state;
  const explicitState = input.state;
  const defaultContext = input.defaults?.context;
  const explicitContext = input.context;

  const mergedContext = {
    ...(defaultContext ?? {}),
    ...(explicitContext ?? {}),
  };

  const hasContext = Object.keys(mergedContext).length > 0;

  const mergedState = {
    ...(defaultState ?? {}),
    ...(explicitState ?? {}),
  } as Record<string, unknown>;

  const mergedHumanState = {
    ...resolveHumanStateValue(defaultState),
    ...resolveHumanStateValue(explicitState),
    ...(input.humanInput ?? {}),
  };

  if (Object.keys(mergedHumanState).length > 0) {
    mergedState[STATE_VARIABLE_HUMAN] = mergedHumanState;
  }

  const hasState = Object.keys(mergedState).length > 0;

  return {
    ...(hasState ? { state: mergedState as TChatRequest['state'] } : {}),
    ...(hasContext ? { context: mergedContext } : {}),
  };
}
