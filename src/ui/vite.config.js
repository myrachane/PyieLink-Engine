import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: path.resolve('src/ui'),
  plugins: [react()],
  build: {
    outDir: path.resolve('src/ui/dist'),
    emptyOutDir: true,
  },
});
