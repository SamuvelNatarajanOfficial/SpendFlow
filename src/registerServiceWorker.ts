/**
 * Registers the service worker and, the first time a new one takes control
 * of this page, reloads once automatically.
 *
 * Why: sw.ts adds a Cross-Origin-Opener-Policy header to every navigation
 * response so Google Sign-In's popup flow works at all on GitHub Pages
 * (which can't send custom HTTP headers itself — see src/sw.ts). That
 * header only applies once the service worker is the one actually serving
 * the navigation — the very first load of a page is always served before
 * any service worker can control it. Without this reload, a genuinely
 * first-ever visit could click "Sign in with Google" before the header is
 * in effect and hit the same popup-closed failure once. The `hasReloaded`
 * guard (the standard pattern for this, also used by workbox-window) makes
 * sure this never loops.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  let hasReloaded = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasReloaded) return;
    hasReloaded = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL;
    void navigator.serviceWorker.register(`${base}sw.js`, { scope: base });
  });
}
