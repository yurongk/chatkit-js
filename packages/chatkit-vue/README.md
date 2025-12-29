# @xpert-ai/chatkit-vue

Vue 3 bindings for Xpert Chatkit Web Component.

## Install

```bash
pnpm add @xpert-ai/chatkit-vue
```

## Usage (Vue 3)

```vue
<script setup lang="ts">
import { ChatKit, useChatKit } from '@xpert-ai/chatkit-vue';

const { control } = useChatKit({
  apiBase: 'https://your-api-host',
  apiKey: 'your-api-key',
  onReady: () => {
    console.log('chatkit ready');
  },
});
</script>

<template>
  <ChatKit :control="control" style="height: 100vh;" />
</template>
```

Register the custom element tag in your Vue compiler config:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'xpertai-chatkit',
        },
      },
    }),
  ],
});
```

## Usage (uni-app)

This wrapper works for uni-app H5 and `web-view` targets where Web Components are supported.
If you need native mini-program UI, you will need a separate rendering layer.

In uni-app (Vue 3), also register `xpertai-chatkit` as a custom element in your build config.
