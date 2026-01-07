import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      exclude: ['src/**/*.test.ts', 'src/__mocks__/**'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'XpertChatkitUI5',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@xpert-ai/chatkit-types', '@xpert-ai/chatkit-web-component'],
    },
    sourcemap: true,
    minify: false,
  },
});
