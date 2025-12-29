import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'XpertChatkit',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: (id) =>
        id.startsWith('@a2ui/lit') ||
        id.startsWith('@langchain/core') ||
        id.startsWith('@langchain/langgraph-sdk'),
    },
    sourcemap: true,
    minify: false,
  },
});
