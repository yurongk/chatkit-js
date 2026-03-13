import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

const externalDeps = ['@xpert-ai/chatkit-types'];

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({
      rollupTypes: true,
      exclude: ['src/**/*.test.ts', 'src/__mocks__/**'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'XpertChatkitUI5',
      fileName: (format) => {
        if (format === 'cjs') return 'chatkit.cjs';
        if (format === 'umd') return 'chatkit.ui5.js';
        return 'index.js';
      },
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      // Keep types external, but bundle the web component so the UI5 build works standalone.
      external: externalDeps,
      output: {
        // Generate an AMD-friendly wrapper using sap.ui.define so UI5's loader can consume it directly.
        amd: {
          id: 'xpertai/chatkit/ui5',
          define: 'sap.ui.define',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
});
