import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthProvider';
import { AuthGate } from './components/auth/AuthGate';

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
