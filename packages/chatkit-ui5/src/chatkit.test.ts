import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

class ControlStub {
  _properties: Record<string, any>;
  _firedEvents: Array<{ name: string; params: any }>;

  constructor() {
    this._properties = {};
    this._firedEvents = [];

    if (typeof (this as any).init === 'function') {
      (this as any).init();
    }
  }

  static extend(_name: string, definition: Record<string, any>) {
    class ExtendedControl extends ControlStub {}
    Object.assign(ExtendedControl.prototype, definition);
    return ExtendedControl as any;
  }

  setProperty(name: string, value: any) {
    this._properties[name] = value;
  }

  getProperty(name: string) {
    return this._properties[name];
  }

  fireEvent(name: string, params: any) {
    this._firedEvents.push({ name, params });
  }
}

const createChatKitElement = () => {
  const listeners: Record<string, (event: any) => void> = {};
  return {
    setOptions: vi.fn(),
    addEventListener: vi.fn((event: string, handler: (event: any) => void) => {
      listeners[event] = handler;
    }),
    dispatch(event: string, detail: any) {
      listeners[event]?.({ detail });
    },
    focusComposer: vi.fn(),
    setThreadId: vi.fn(),
    sendUserMessage: vi.fn(),
    setComposerValue: vi.fn(),
    fetchUpdates: vi.fn(),
    sendCustomAction: vi.fn(),
  };
};

describe('ChatKit UI5 control', () => {
  let originalCustomElements: any;

  beforeEach(() => {
    vi.resetModules();
    originalCustomElements = (globalThis as any).customElements;
    (globalThis as any).customElements = {
      get: vi.fn().mockReturnValue(true),
      whenDefined: vi.fn().mockResolvedValue(undefined),
    };
    (globalThis as any).sap = {
      ui: {
        core: {
          Control: ControlStub,
        },
      },
    };
  });

  afterEach(() => {
    if (typeof originalCustomElements === 'undefined') {
      delete (globalThis as any).customElements;
    } else {
      (globalThis as any).customElements = originalCustomElements;
    }
    delete (globalThis as any).sap;
  });

  it('applies options and forwards events', async () => {
    const element = createChatKitElement();
    const { ChatKit } = await import('./chatkit.js');

    const control = new ChatKit();
    control.getDomRef = () => element as any;

    const onReady = vi.fn();
    control.setConfig({ baseUrl: 'https://example.com', onReady });
    control.onAfterRendering();

    expect(element.setOptions).toHaveBeenCalledWith({ baseUrl: 'https://example.com' });

    element.dispatch('chatkit.ready', { ok: true });

    expect(onReady).toHaveBeenCalledWith({ ok: true });
    expect((control as any)._firedEvents[0]).toEqual({
      name: 'ready',
      params: { detail: { ok: true } },
    });
  });

  it('forwards method calls to the web component instance', async () => {
    const element = createChatKitElement();
    const { ChatKit } = await import('./chatkit.js');

    const control = new ChatKit();
    control.getDomRef = () => element as any;

    control.onAfterRendering();
    control.focusComposer();

    expect(element.focusComposer).toHaveBeenCalledTimes(1);
  });
});
