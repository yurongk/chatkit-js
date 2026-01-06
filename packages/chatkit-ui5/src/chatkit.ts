import type { ChatKitEvents, ChatKitOptions, XpertAIChatKit } from '@xpert-ai/chatkit-types';
import '@xpert-ai/chatkit-web-component';

declare const sap: any;

type DotToCamelCase<S extends string> = S extends `${infer Head}.${infer Tail}`
  ? `${Head}${Capitalize<DotToCamelCase<Tail>>}`
  : S;

export type ToEventHandlerKey<K extends keyof ChatKitEvents> = K extends string
  ? DotToCamelCase<K> extends `chatkit${infer EventName}`
    ? `on${Capitalize<EventName>}`
    : never
  : never;

export type ChatKitEventHandlers = Partial<{
  [K in keyof ChatKitEvents as ToEventHandlerKey<K>]: ChatKitEvents[K] extends CustomEvent<
    infer Detail
  >
    ? Detail extends undefined
      ? () => void
      : (event: Detail) => void
    : never;
}>;

export type ChatKitUI5Config = ChatKitOptions & ChatKitEventHandlers;

type ListenerCleanup = (() => void) | undefined;

const CHATKIT_METHOD_NAMES = Object.freeze([
  'focusComposer',
  'setThreadId',
  'sendUserMessage',
  'setComposerValue',
  'fetchUpdates',
  'sendCustomAction',
] as const);

type ChatKitMethod = (typeof CHATKIT_METHOD_NAMES)[number];

const EVENT_HANDLER_MAP: {
  [K in keyof ChatKitEvents]: ToEventHandlerKey<K>;
} = {
  'chatkit.error': 'onError',
  'chatkit.response.end': 'onResponseEnd',
  'chatkit.response.start': 'onResponseStart',
  'chatkit.log': 'onLog',
  'chatkit.thread.change': 'onThreadChange',
  'chatkit.thread.load.start': 'onThreadLoadStart',
  'chatkit.thread.load.end': 'onThreadLoadEnd',
  'chatkit.ready': 'onReady',
  'chatkit.effect': 'onEffect',
};

const UI5_EVENT_NAME_MAP: Record<keyof ChatKitEvents, string> = {
  'chatkit.error': 'error',
  'chatkit.response.end': 'responseEnd',
  'chatkit.response.start': 'responseStart',
  'chatkit.log': 'log',
  'chatkit.thread.change': 'threadChange',
  'chatkit.thread.load.start': 'threadLoadStart',
  'chatkit.thread.load.end': 'threadLoadEnd',
  'chatkit.ready': 'ready',
  'chatkit.effect': 'effect',
};

const EVENT_NAMES = Object.keys(EVENT_HANDLER_MAP) as (keyof ChatKitEvents)[];

function splitOptions(value: ChatKitUI5Config | undefined): {
  options: ChatKitOptions;
  handlers: ChatKitEventHandlers;
} {
  const options = {} as ChatKitOptions;
  const handlers: ChatKitEventHandlers = {};

  if (!value) {
    return { options, handlers };
  }

  for (const [key, entry] of Object.entries(value)) {
    if (/^on[A-Z]/.test(key) && key !== 'onClientTool') {
      (handlers as any)[key] = entry;
    } else {
      (options as any)[key] = entry;
    }
  }

  return { options, handlers };
}

function applyOptions(
  el: XpertAIChatKit,
  options: ChatKitOptions,
  isCurrent: () => boolean,
): ListenerCleanup {
  if (typeof customElements === 'undefined') {
    if (typeof (el as any).setOptions === 'function') {
      el.setOptions(options);
    }
    return;
  }

  if (customElements.get('xpertai-chatkit')) {
    el.setOptions(options);
    return;
  }

  let active = true;
  customElements.whenDefined('xpertai-chatkit').then(() => {
    if (active && isCurrent()) {
      el.setOptions(options);
    }
  });

  return () => {
    active = false;
  };
}

function getControlBase(): any {
  if (sap?.ui?.core?.Control) {
    return sap.ui.core.Control;
  }

  throw new Error('sap.ui.core.Control is required for @xpert-ai/chatkit-ui5');
}

const ControlBase = getControlBase();

type InternalState = {
  _chatkitEl: XpertAIChatKit | null;
  _optionsCleanup?: ListenerCleanup;
  _eventsAbortController: AbortController | null;
  _options: ChatKitOptions;
  _handlers: ChatKitEventHandlers;
};

type ChatKitInstance = InstanceType<typeof ControlBase> & InternalState;

export const ChatKit = ControlBase.extend('xpertai.chatkit.ui5.ChatKit', {
  metadata: {
    properties: {
      config: { type: 'object', defaultValue: {} },
    },
    events: {
      error: { parameters: { detail: { type: 'object' } } },
      responseEnd: { parameters: { detail: { type: 'object' } } },
      responseStart: { parameters: { detail: { type: 'object' } } },
      log: { parameters: { detail: { type: 'object' } } },
      threadChange: { parameters: { detail: { type: 'object' } } },
      threadLoadStart: { parameters: { detail: { type: 'object' } } },
      threadLoadEnd: { parameters: { detail: { type: 'object' } } },
      ready: { parameters: { detail: { type: 'object' } } },
      effect: { parameters: { detail: { type: 'object' } } },
    },
  },
  renderer: {
    apiVersion: 2,
    render(oRm: any, oControl: ChatKitInstance) {
      oRm.openStart('xpertai-chatkit', oControl);
      oRm.openEnd();
      oRm.close('xpertai-chatkit');
    },
  },
  init(this: ChatKitInstance) {
    this._chatkitEl = null;
    this._optionsCleanup = undefined;
    this._eventsAbortController = null;

    const config = typeof this.getProperty === 'function' ? this.getProperty('config') : {};
    this._setConfig(config ?? {});
  },
  setConfig(this: ChatKitInstance, value: ChatKitUI5Config) {
    if (typeof this.setProperty === 'function') {
      this.setProperty('config', value ?? {}, true);
    }
    this._setConfig(value ?? {});
    return this;
  },
  onAfterRendering(this: ChatKitInstance) {
    this._chatkitEl = typeof this.getDomRef === 'function' ? this.getDomRef() : null;
    this._applyOptions();
    this._bindHandlers();
  },
  exit(this: ChatKitInstance) {
    this._teardown();
  },
  _teardown(this: ChatKitInstance) {
    if (this._optionsCleanup) {
      this._optionsCleanup();
      this._optionsCleanup = undefined;
    }
    if (this._eventsAbortController) {
      this._eventsAbortController.abort();
      this._eventsAbortController = null;
    }
    this._chatkitEl = null;
  },
  _setConfig(this: ChatKitInstance, value: ChatKitUI5Config) {
    const next = splitOptions(value);
    this._options = next.options;
    this._handlers = next.handlers;
    this._applyOptions();
    this._bindHandlers();
  },
  _applyOptions(this: ChatKitInstance) {
    if (this._optionsCleanup) {
      this._optionsCleanup();
      this._optionsCleanup = undefined;
    }

    const el = this._chatkitEl;
    if (!el) return;

    this._optionsCleanup = applyOptions(el, this._options, () => this.getDomRef() === el);
  },
  _bindHandlers(this: ChatKitInstance) {
    if (this._eventsAbortController) {
      this._eventsAbortController.abort();
      this._eventsAbortController = null;
    }

    const el = this._chatkitEl;
    if (!el) return;

    const controller = new AbortController();
    for (const eventName of EVENT_NAMES) {
      el.addEventListener(
        eventName,
        (e: Event) => {
          const detail = (e as CustomEvent).detail;
          const handlerName = EVENT_HANDLER_MAP[eventName];
          const handler = this._handlers?.[handlerName];

          if (typeof handler === 'function') {
            handler(detail as any);
          }

          if (typeof this.fireEvent === 'function') {
            this.fireEvent(UI5_EVENT_NAME_MAP[eventName], { detail });
          }
        },
        { signal: controller.signal },
      );
    }

    this._eventsAbortController = controller;
  },
  _callMethod(this: ChatKitInstance, method: ChatKitMethod, args: IArguments) {
    const el = this._chatkitEl as any;
    if (!el || typeof el[method] !== 'function') {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('ChatKit element is not mounted');
      }
      return;
    }

    return el[method](...Array.prototype.slice.call(args));
  },
  focusComposer(this: ChatKitInstance) {
    return this._callMethod('focusComposer', arguments);
  },
  setThreadId(this: ChatKitInstance, threadId: string) {
    return this._callMethod('setThreadId', arguments);
  },
  sendUserMessage(this: ChatKitInstance, message: unknown) {
    return this._callMethod('sendUserMessage', arguments);
  },
  setComposerValue(this: ChatKitInstance, value: string) {
    return this._callMethod('setComposerValue', arguments);
  },
  fetchUpdates(this: ChatKitInstance) {
    return this._callMethod('fetchUpdates', arguments);
  },
  sendCustomAction(this: ChatKitInstance, action: unknown) {
    return this._callMethod('sendCustomAction', arguments);
  },
});
