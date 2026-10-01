import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
  );
}

/** Install affordance for Settings — quiet by design, never a repeating nag. */
export function InstallPwaSection() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    function handleAppInstalled() {
      setInstalled(true);
    }
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  if (installed) {
    return (
      <p className="text-sm text-muted">
        SpendFlow is installed on this device and running as an app.
      </p>
    );
  }

  if (canInstall) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Install SpendFlow for quicker access and a full-screen app experience.
        </p>
        <div>
          <Button onClick={() => void promptInstall()}>
            <Download className="size-4" aria-hidden="true" />
            Install SpendFlow
          </Button>
        </div>
      </div>
    );
  }

  return (
    <p className="text-sm text-muted">
      On Android/Chrome, look for an install icon in the address bar. On iPhone/iPad, tap
      the Share icon in Safari, then{' '}
      <span className="font-medium text-text">Add to Home Screen</span>.
    </p>
  );
}
