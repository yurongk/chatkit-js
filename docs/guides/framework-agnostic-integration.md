# Framework-Agnostic Integration (Vanilla JS)

This guide shows how to embed ChatKit without a framework by using the `xpertai-chatkit` Web Component and the `@xpert-ai/chatkit-js` helper.

## 1) Install

```bash
npm install @xpert-ai/chatkit-js
```

## 2) Create + mount the element

```ts
import { createChatKit } from '@xpert-ai/chatkit-js';

const container = document.getElementById('chatkit-root');
const element = document.createElement('xpertai-chatkit');
container?.appendChild(element);

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
```

## 3) Clean up on page unload

```ts
window.addEventListener('beforeunload', () => {
  chatkit.destroy();
});
```

## Notes

- `xpertai-chatkit` is the custom element name. Make sure it is present in the DOM before calling `createChatKit`.
- Always provide a full `options` object when you update configuration.
