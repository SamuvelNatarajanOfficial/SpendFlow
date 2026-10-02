/**
 * Registers the service worker and, on a first-ever visit, resolves only
 * once it's safe to render (either the new worker has taken control, or a
 * short timeout gives up so the app never hangs).
 *
 * `register()` is called on *every* load, including return visits where a
 * worker already controls the page — not just the first. A plain page load
 * doesn't otherwise prompt the browser to check sw.js for changes at all;
 * without an explicit register() call, a worker installed before some past
 * deploy would keep serving its own cached, now-outdated assets forever,
 * found out only via the browser's own background check (hours to a day
 * later). If that check finds a new worker, `controllerchange` fires and we
 * reload to pick it up — on a return visit this happens in the background
 * without blocking the current render.
 *
 * On a first-ever visit specifically, rendering is blocked until this
 * resolves (see main.tsx) rather than reloading after the fact. An earlier
 * version reloaded only after already rendering the app normally, which
 * raced: clicking "Sign in with Google" before that reload fired destroyed
 * the page mid-flow, wiping out the JS context mid-sign-in.
 */
export function ensureServiceWorkerControlsThisLoad(): Promise<void> {
  if (!('serviceWorker' in navigator)) return Promise.resolve();

  const base = import.meta.env.BASE_URL;
  const alreadyControlled = Boolean(navigator.serviceWorker.controller);

  // Reloading once a *new* service worker takes control applies regardless
  // of whether this load started out controlled — otherwise a stale worker
  // installed before this deploy would keep serving its own cached, outdated
  // assets forever, since nothing else ever prompts the browser to check for
  // an update.
  navigator.serviceWorker.addEventListener(
    'controllerchange',
    () => window.location.reload(),
    { once: true },
  );

  // Calling register() is also what makes the browser check sw.js for
  // changes at all — it isn't automatic on a plain page load. Fired on every
  // load, not just the first, so a new deploy is always picked up (at worst
  // a reload behind) instead of only via the browser's own ~24h background
  // check.
  const registered = navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {
    // Registration failed outright (unsupported context, network issue,
    // etc.) — nothing will ever take control, so just fall through via
    // the timeout below instead of waiting forever.
  });

  // Already controlled — the overwhelmingly common case on a return visit.
  // Don't block rendering on the update check above; it'll reload on its own
  // if it finds something new.
  if (alreadyControlled) return Promise.resolve();

  // First-ever visit: nothing controls this load yet, so block until either
  // the new worker takes control (the `controllerchange` handler above then
  // reloads, which discards this execution context rather than ever
  // reaching a `resolve()` here) or a short timeout gives up and renders
  // anyway rather than hang the app.
  const untilControlled = registered.then(() => new Promise<void>(() => {}));
  const givingUp = new Promise<void>((resolve) => setTimeout(resolve, 4000));

  return Promise.race([untilControlled, givingUp]);
}
