import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves this repo at /spendflow/, so production assets must
  // be built with that base path. `vite preview` serves the already-built
  // dist/ folder (whose index.html references /spendflow/...), so it needs
  // the same base despite internally using command 'serve' like dev does —
  // `isPreview` is what actually distinguishes it from `npm run dev`.
  base: command === 'build' || isPreview ? '/spendflow/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Updates silently on next load — a personal single-user app has no
      // need to nag about new versions.
      registerType: 'autoUpdate',
      // The app's existing icon set (public/icon*.png, favicon.*) — used as
      // the PWA's icons as-is, not replaced with generated artwork.
      includeAssets: ['favicon.svg', 'favicon.ico', 'icon-120.png', 'icon-1024.png'],
      manifest: {
        name: 'SpendFlow',
        short_name: 'SpendFlow',
        description:
          'Personal salary and expense planner, backed by your own Google Sheet.',
        theme_color: '#315B8C',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        // Relative to the manifest's own URL, so this resolves correctly
        // whether served at '/' (dev) or '/spendflow/' (GitHub Pages).
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Precache only the built app shell (JS/CSS/HTML/icons). No
        // runtime-caching rule is added for Google's APIs — financial data
        // must never be served from a cache, so those requests are simply
        // left to go to the network as normal, every time.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // .kilo/ is another tool's nested git worktree, not our source tree.
    exclude: [...configDefaults.exclude, '.kilo/**'],
  },
}));
