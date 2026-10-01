import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves this repo at /SpendFlow/ (the repository name's
  // exact casing — GitHub Pages asset serving is case-sensitive, so this
  // must match the repo name precisely or every asset 404s and the app
  // renders a blank page). Production assets must be built with that base
  // path. `vite preview` serves the already-built dist/ folder (whose
  // index.html references /SpendFlow/...), so it needs the same base
  // despite internally using command 'serve' like dev does — `isPreview` is
  // what actually distinguishes it from `npm run dev`.
  base: command === 'build' || isPreview ? '/SpendFlow/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // A custom service worker (src/sw.ts) instead of the default
      // auto-generated one — needed so the navigation response can carry a
      // Cross-Origin-Opener-Policy header GitHub Pages has no way to send
      // itself. See src/sw.ts for why that header is required for Google
      // Sign-In's popup flow to work at all on this host.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        // Precache only the built app shell (JS/CSS/HTML/icons). sw.ts adds
        // no runtime-caching rule for Google's APIs — financial data must
        // never be served from a cache, so those requests always hit the
        // network, every time.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
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
        // whether served at '/' (dev) or '/SpendFlow/' (GitHub Pages).
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
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
