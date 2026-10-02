import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthProvider';
import { AuthGate } from './components/auth/AuthGate';
import { ensureServiceWorkerControlsThisLoad } from './registerServiceWorker';

function renderApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {/* No `basename` here — GitHub Pages already serves the app at /SpendFlow/
          via Vite's `base` config; HashRouter's basename would apply *inside*
          the hash fragment instead, which isn't what we want. */}
      <HashRouter>
        <AuthProvider>
          <AuthGate>
            <App />
          </AuthGate>
        </AuthProvider>
      </HashRouter>
    </StrictMode>,
  );
}

// No service worker exists in dev (`npm run dev`) — only gate on it in a
// production build, where sw.js is actually built and served. Waiting here
// (rather than registering after rendering) is what keeps "Sign in with
// Google" from ever being clickable before the page is in the state it
// needs to be in — see registerServiceWorker.ts for why that race mattered.
if (import.meta.env.PROD) {
  void ensureServiceWorkerControlsThisLoad().then(renderApp);
} else {
  renderApp();
}
