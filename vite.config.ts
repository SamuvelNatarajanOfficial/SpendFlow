import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves this repo at /spendflow/, so production assets must
  // be built with that base path. `vite preview` serves the already-built
  // dist/ folder (whose index.html references /spendflow/...), so it needs
  // the same base despite internally using command 'serve' like dev does —
  // `isPreview` is what actually distinguishes it from `npm run dev`.
  base: command === 'build' || isPreview ? '/spendflow/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // .kilo/ is another tool's nested git worktree, not our source tree.
    exclude: [...configDefaults.exclude, '.kilo/**'],
  },
}));
