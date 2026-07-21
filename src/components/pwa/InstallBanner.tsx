import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallBanner() {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner before
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setDismissed(true);
    }
  };

  // Don't show if installed, dismissed, or not installable via prompt
  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <div className="sticky top-0 left-0 right-0 z-50 safe-top">
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Download className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium truncate">
            Installez TripTracker sur votre téléphone
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isInstallable ? (
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleInstall}
              className="h-8 px-3 text-xs"
            >
              Installer
            </Button>
          ) : (
            <Link to="/install">
              <Button 
                size="sm" 
                variant="secondary"
                className="h-8 px-3 text-xs"
              >
                Comment ?
              </Button>
            </Link>
          )}
          <button 
            onClick={handleDismiss}
            className="p-1 hover:bg-primary-foreground/10 rounded"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
