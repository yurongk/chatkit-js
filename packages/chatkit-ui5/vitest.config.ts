import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously',
        url: 'file:///',
      },
    },
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
