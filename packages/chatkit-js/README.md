# @xpert-ai/chatkit-js

Framework-agnostic bindings for the Xpert Chatkit Web Component.

## Install

```bash
pnpm add @xpert-ai/chatkit-js
```

## Usage

```ts
import { createChatKit } from '@xpert-ai/chatkit-js';

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
