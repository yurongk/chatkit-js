# @xpert-ai/chatkit-js

Framework-agnostic ChatKit integration helpers for vanilla JS + Web Components.

## Minimal Example
Framework-agnostic bindings for the Xpert Chatkit Web Component.

## Install

```bash
pnpm add @xpert-ai/chatkit-js
```

## Usage

```ts
import { createChatKit } from '@xpert-ai/chatkit-js';

const container = document.getElementById('chatkit-root');

// 1) Create + mount the custom element
const element = document.createElement('xpertai-chatkit');
container?.appendChild(element);

// 2) Provide options + event callbacks
const chatkit = createChatKit(element, {
  options: {
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        const { client_secret, organization_id } = await res.json();
        return {
          secret: client_secret,
          organizationId: organization_id,
        };
      },
    },
    theme: { colorScheme: 'light', radius: 'round' },
  },
  onReady() {
    console.log('ChatKit is ready');
  },
  onResponseEnd() {
    console.log('Assistant finished responding');
  },
});

// 3) Clean up on page unload
window.addEventListener('beforeunload', () => {
  chatkit.destroy();
});
```
const chatkit = createChatKit({
  apiBase: 'https://your-xpertai-api-host',
  apiKey: 'your-xpertai-api-key',
  onReady: () => {
    console.log('chatkit ready');
  },
});

document.body.appendChild(chatkit.element);
```

Call `chatkit.destroy()` when you no longer need the instance to remove event listeners.

`getClientSecret` also continues to support the legacy `Promise<string>` return
shape when you do not need to send an organization id.
