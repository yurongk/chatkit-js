# @xpert-ai/chatkit-js

Framework-agnostic ChatKit integration helpers for vanilla JS + Web Components.

## Minimal Example

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
        const { client_secret } = await res.json();
        return client_secret;
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
