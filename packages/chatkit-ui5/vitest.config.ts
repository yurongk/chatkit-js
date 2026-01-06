import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@xpert-ai/chatkit-web-component': resolve(
        __dirname,
        'src/__mocks__/chatkit-web-component.ts',
      ),
    },
  },
});
