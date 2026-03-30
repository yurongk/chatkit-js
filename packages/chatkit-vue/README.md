# @xpert-ai/chatkit-vue

Vue 3 bindings for the Xpert ChatKit web component.

## Install

```bash
pnpm add @xpert-ai/chatkit-vue
```

## Usage

```vue
<script setup lang="ts">
import { ChatKit, useChatKit } from '@xpert-ai/chatkit-vue';

const { control } = useChatKit({
  frameUrl: '<url-to-chatkit-frame>',
  api: {
    apiUrl: 'https://api.xpertai.cn',
    xpertId: 'your-assistant-id',
    getClientSecret: async () => {
      const response = await fetch('/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      return {
        secret: data.client_secret,
        organizationId: data.organization_id,
      };
    },
  },
  onReady: () => {
    console.log('ChatKit is ready');
  },
});
</script>

<template>
  <ChatKit :control="control" style="height: 100vh;" />
</template>
```

`getClientSecret` may continue returning the legacy `string`, or return
`{ secret, organizationId }` to have ChatKit send `organization-id` on hosted
API requests.

## Vite Config

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

## uni-app

This wrapper works for uni-app H5 and `web-view` targets where Web Components
are supported. If you need native mini-program UI, you will need a separate
rendering layer.
