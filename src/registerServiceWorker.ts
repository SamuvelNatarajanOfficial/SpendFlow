/**
 * Resolves once this page load is safe to show an interactive sign-in
 * button, or gives up after a short timeout so the app never hangs.
 *
 * Why this exists: sw.ts adds a Cross-Origin-Opener-Policy header to every
 * navigation response so Google Sign-In's popup flow works at all on
 * GitHub Pages (which can't send custom HTTP headers itself — see
 * src/sw.ts). That header only applies once the service worker is the one
 * actually serving the navigation — never on the very first load of a
 * page, before any service worker can control it.
 *
 * An earlier version of this fix reloaded the page automatically whenever
 * a new service worker took control, but *after* rendering the app
 * normally. That created a race: if "Sign in with Google" was clicked
 * before the reload fired, the reload destroyed the page mid-flow —
 * wiping out the very JS context holding Google's token callback — which
 * produced the exact same "popup window closed" symptom this was meant to
 * fix. Blocking the render itself (see main.tsx) until this resolves — or
 * reloading before anything interactive ever appears — removes that race
 * entirely instead of racing it.
 */
export function ensureServiceWorkerControlsThisLoad(): Promise<void> {
  if (!('serviceWorker' in navigator)) return Promise.resolve();

  // Already controlled — true for every visit after the very first, since
  // the service worker persists across page loads once registered. The
  // overwhelmingly common case; no reload needed.
  if (navigator.serviceWorker.controller) return Promise.resolve();

  // This promise intentionally never resolves on its own: if a new service
  // worker takes control, we reload immediately, which discards this whole
  // execution context rather than ever reaching the `resolve()` below.
  const untilControlled = new Promise<void>(() => {
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => window.location.reload(),
      { once: true },
    );

    const base = import.meta.env.BASE_URL;
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {
      // Registration failed outright (unsupported context, network issue,
      // etc.) — nothing will ever take control, so just fall through via
      // the timeout below instead of waiting forever.
    });
  });

  // Safety valve: if registration/activation hasn't resolved this one way
  // or another in a few seconds, render anyway rather than hang the app.
  const givingUp = new Promise<void>((resolve) => setTimeout(resolve, 4000));

  return Promise.race([untilControlled, givingUp]);
}
