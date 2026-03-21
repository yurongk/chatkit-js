import { describe, expect, it } from 'vitest';

import { STATE_VARIABLE_HUMAN } from '@xpert-ai/chatkit-types';

import { buildInjectedRequestOptions } from './request-options';

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
      },
    });
  });
});
