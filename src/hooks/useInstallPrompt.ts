import { useEffect, useState } from 'react';

/** The non-standard event Chromium-based browsers fire when a PWA becomes installable. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UseInstallPromptResult {
  /** True once the browser has signaled the app can be installed. */
  canInstall: boolean;
  /** Shows the browser's native install prompt. No-op if canInstall is false. */
  promptInstall: () => Promise<void>;
}

/**
 * Wraps the `beforeinstallprompt` event (Chrome/Edge/Android). Safari/iOS
 * never fires this — there is no programmatic install trigger there, only
 * the manual "Share → Add to Home Screen" flow (see the README's PWA
 * section for user-facing instructions).
 */
export function useInstallPrompt(): UseInstallPromptResult {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setDeferredEvent(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
  }

  return { canInstall: deferredEvent !== null, promptInstall };
}
