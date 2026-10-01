/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();

// `directoryIndex: null` stops the generic precache route from also
// matching navigation requests, so only the NavigationRoute below handles
// them — avoiding two routes racing to call event.respondWith() on the
// same fetch event.
precacheAndRoute(self.__WB_MANIFEST, { directoryIndex: '' });

/**
 * Google's OAuth popup (accounts.google.com) sets a restrictive
 * Cross-Origin-Opener-Policy on itself. Unless THIS page's own COOP
 * explicitly allows it (`same-origin-allow-popups`), the browser severs the
 * popup<->opener relationship that the Google Identity Services token
 * client relies on to detect a successful sign-in — it then misreports a
 * completed sign-in as the user having closed the popup.
 *
 * GitHub Pages serves static files with no way to configure custom HTTP
 * response headers, so this header is added here instead, for every
 * navigation to this app. It has no effect on anything else the app does
 * (COOP never restricts outgoing fetches to Google's APIs).
 */
const navigationHandler = createHandlerBoundToURL('index.html');

registerRoute(
  new NavigationRoute(async (params) => {
    const response = await navigationHandler(params);
    const headers = new Headers(response.headers);
    headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }),
);
