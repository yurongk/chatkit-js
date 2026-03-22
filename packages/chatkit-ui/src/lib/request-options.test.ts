import { describe, expect, it } from 'vitest';

import { STATE_VARIABLE_HUMAN } from '@xpert-ai/chatkit-types';

import {
  buildInjectedRequestOptions,
  mergeRequestOptions,
  normalizeRequestContextAndConfig,
} from './request-options';

describe('buildInjectedRequestOptions', () => {
  it('merges default state with the active human input', () => {
    const result = buildInjectedRequestOptions({
      defaults: {
        state: {
          resource: {
            resourceId: 'res-1',
            resourceType: 'slack',
          },
        },
      },
      humanInput: {
        input: 'hello',
      },
    });

    expect(result).toEqual({
      state: {
        resource: {
          resourceId: 'res-1',
          resourceType: 'slack',
        },
        [STATE_VARIABLE_HUMAN]: {
          input: 'hello',
        },
      },
    });
  });

  it('lets explicit state/context override defaults while preserving human input', () => {
    const result = buildInjectedRequestOptions({
      defaults: {
        state: {
          resource: {
            resourceId: 'res-1',
            owner: 'team-a',
          },
          [STATE_VARIABLE_HUMAN]: {
            locale: 'zh-CN',
          },
        },
        context: {
          source: 'resource-page',
          env: {
            region: 'default',
          },
        },
      },
      state: {
        resource: {
          resourceId: 'res-2',
        },
        [STATE_VARIABLE_HUMAN]: {
          reply: 'msg-1',
        },
      },
      context: {
        source: 'custom-send',
        traceId: 'trace-1',
        env: {
          oidc_token: 'override-token',
          region: 'override-from-context',
        },
      },
      config: {
        configurable: {
          agentKey: 'planner',
        },
      },
      humanInput: {
        input: 'ask something',
      },
    });

    expect(result).toEqual({
      state: {
        resource: {
          resourceId: 'res-2',
        },
        [STATE_VARIABLE_HUMAN]: {
          locale: 'zh-CN',
          reply: 'msg-1',
          input: 'ask something',
        },
      },
      context: {
        source: 'custom-send',
        traceId: 'trace-1',
        env: {
          region: 'override-from-context',
          oidc_token: 'override-token',
        },
      },
      config: {
        configurable: {
          agentKey: 'planner',
        },
      },
    });
  });

  it('keeps config.env inside config instead of mapping it into context.env', () => {
    const result = buildInjectedRequestOptions({
      defaults: {
        context: {
          source: 'resource-page',
        },
        config: {
          env: {
            oidc_token: 'token-1',
            region: 'cn',
          },
          configurable: {
            recursion_limit: 10,
          },
        },
      },
      config: {
        env: {
          oidc_token: 'token-2',
        },
        configurable: {
          agentKey: 'planner',
        },
      },
    });

    expect(result).toEqual({
      context: {
        source: 'resource-page',
      },
      config: {
        env: {
          oidc_token: 'token-2',
        },
        configurable: {
          agentKey: 'planner',
        },
      },
    });
  });

  it('lets explicit context.env override default context.env', () => {
    const result = mergeRequestOptions({
      defaults: {
        context: {
          env: {
            oidc_token: 'token-1',
            region: 'default-context',
          },
        },
      },
      context: {
        env: {
          region: 'explicit-context',
        },
      },
    });

    expect(result).toEqual({
      context: {
        env: {
          oidc_token: 'token-1',
          region: 'explicit-context',
        },
      },
    });
  });

  it('keeps context.env and config separate for the run payload', () => {
    const result = normalizeRequestContextAndConfig({
      context: {
        source: 'resource-page',
        env: {
          oidc_token: 'token-1',
        },
      },
      config: {
        env: {
          legacy: 'value',
        },
        configurable: {
          agentKey: 'planner',
        },
      },
    });

    expect(result).toEqual({
      context: {
        source: 'resource-page',
        env: {
          oidc_token: 'token-1',
        },
      },
      config: {
        env: {
          legacy: 'value',
        },
        configurable: {
          agentKey: 'planner',
        },
      },
    });
  });
});
