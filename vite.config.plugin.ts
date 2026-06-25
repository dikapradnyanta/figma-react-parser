import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2015',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/plugin/index.ts'),
      output: {
        entryFileNames: 'code.js',
        format: 'iife'
      }
    }
  }
});
