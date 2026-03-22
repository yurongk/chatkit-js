import {
  type ChatKitRequestContext,
  STATE_VARIABLE_HUMAN,
  type ChatKitRequestOptions,
  type TChatRequest,
  type TChatRequestHuman,
} from '@xpert-ai/chatkit-types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function resolveHumanStateValue(
  value: Record<string, any> | null | undefined,
): Record<string, unknown> {
  const human = value?.[STATE_VARIABLE_HUMAN];
  return isRecord(human) ? human : {};
}

function splitEnvCarrier<TValue extends Record<string, unknown>>(
  value: TValue | null | undefined,
): {
  value: Omit<TValue, 'env'>;
  env: Record<string, unknown>;
} {
  if (!isRecord(value)) {
    return { value: {} as Omit<TValue, 'env'>, env: {} };
  }

  const { env, ...rest } = value;
  return {
    value: rest as Omit<TValue, 'env'>,
    env: isRecord(env) ? env : {},
  };
}

type RequestRuntimeOptions<
  TContext extends ChatKitRequestContext = ChatKitRequestContext,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
> = {
  context?: TContext | null;
  config?: TConfig | null;
  defaults?: {
    context?: TContext | null;
    config?: TConfig | null;
  } | null;
};

type ContextEnv<TContext extends ChatKitRequestContext> =
  TContext extends { env?: infer TEnv }
    ? TEnv extends Record<string, unknown>
      ? TEnv
      : Record<string, unknown>
    : Record<string, unknown>;

export function mergeRequestOptions<
  TContext extends ChatKitRequestContext = ChatKitRequestContext,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
>(input: RequestRuntimeOptions<TContext, TConfig>): {
  context?: TContext;
  config?: TConfig;
} {
  const defaultContext = splitEnvCarrier(input.defaults?.context);
  const explicitContext = splitEnvCarrier(input.context);
  const defaultConfig = isRecord(input.defaults?.config)
    ? input.defaults?.config
    : {};
  const explicitConfig = isRecord(input.config) ? input.config : {};

  const mergedEnv = {
    ...defaultContext.env,
    ...explicitContext.env,
  } as ContextEnv<TContext>;
  const mergedContextBase = {
    ...defaultContext.value,
    ...explicitContext.value,
  } as Omit<TContext, 'env'>;
  const mergedConfig = {
    ...defaultConfig,
    ...explicitConfig,
  } as TConfig;

  const hasEnv = Object.keys(mergedEnv).length > 0;
  const mergedContext = (
    hasEnv ? { ...mergedContextBase, env: mergedEnv } : mergedContextBase
  ) as TContext;
  const hasContext = Object.keys(mergedContextBase).length > 0 || hasEnv;
  const hasConfig = Object.keys(mergedConfig).length > 0;

  return {
    ...(hasContext ? { context: mergedContext } : {}),
    ...(hasConfig ? { config: mergedConfig } : {}),
  };
}

export function normalizeRequestContextAndConfig<
  TContext extends ChatKitRequestContext = ChatKitRequestContext,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
>(input: RequestRuntimeOptions<TContext, TConfig>): {
  context?: TContext;
  config?: TConfig;
} {
  return mergeRequestOptions(input);
}

export function buildInjectedRequestOptions<
  TContext extends ChatKitRequestContext = ChatKitRequestContext,
  TConfig extends Record<string, unknown> = Record<string, unknown>,
>(input: {
  defaults?: ChatKitRequestOptions<Record<string, any>, TContext, TConfig>;
  state?: Record<string, any> | null;
  context?: TContext | null;
  config?: TConfig | null;
  humanInput?: TChatRequestHuman | null;
}): {
  state?: TChatRequest['state'];
  context?: TContext;
  config?: TConfig;
} {
  const defaultState = input.defaults?.state;
  const explicitState = input.state;
  const normalizedRequest = mergeRequestOptions({
    defaults: {
      context: input.defaults?.context,
      config: input.defaults?.config,
    },
    context: input.context,
    config: input.config,
  });

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
    ...(normalizedRequest.context ? { context: normalizedRequest.context } : {}),
    ...(normalizedRequest.config ? { config: normalizedRequest.config } : {}),
  };
}
