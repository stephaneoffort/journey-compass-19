import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Smartphone, 
  Check, 
  Share, 
  MoreVertical, 
  Plus,
  ArrowLeft,
  Plane,
  Wifi,
  Zap,
  Bell
} from 'lucide-react';

export default function Install() {
  const { isInstallable, isInstalled, isIOS, isAndroid, promptInstall } = usePWAInstall();

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      // Installation accepted
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="page-header safe-top">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <h1 className="page-title">Installer TripTracker</h1>
        <p className="page-subtitle">Installez l'application sur votre téléphone</p>
      </div>

      <div className="px-5 pb-8 space-y-6">
        {/* App preview card */}
        <div className="card-flat p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Plane className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold font-display">TripTracker</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Suivi des déplacements professionnels
          </p>
          
          {isInstalled ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-500">
              <Check className="w-5 h-5" />
              <span className="font-medium">Application installée</span>
            </div>
          ) : isInstallable ? (
            <Button 
              onClick={handleInstallClick}
              className="btn-primary mt-4 w-full"
            >
              <Download className="w-5 h-5 mr-2" />
              Installer l'application
            </Button>
          ) : null}
        </div>

        {/* Benefits */}
        <div className="card-flat p-5 space-y-4">
          <h3 className="font-semibold">Pourquoi installer ?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Accès rapide</div>
                <div className="text-sm text-muted-foreground">Lancez l'app directement depuis votre écran d'accueil</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="font-medium">Mode hors-ligne</div>
                <div className="text-sm text-muted-foreground">Consultez vos voyages même sans connexion</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="font-medium">Expérience native</div>
                <div className="text-sm text-muted-foreground">Interface plein écran comme une vraie application</div>
              </div>
            </div>
          </div>
        </div>

        {/* Installation instructions */}
        {!isInstalled && (
          <div className="card-flat p-5 space-y-4">
            <h3 className="font-semibold">Comment installer ?</h3>
            
            {isAndroid && !isInstallable && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Sur Android avec Chrome :</p>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">1</div>
                    <div className="text-sm">
                      <span>Appuyez sur </span>
                      <MoreVertical className="w-4 h-4 inline mx-1" />
                      <span> (menu 3 points) en haut à droite</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">2</div>
                    <div className="text-sm">Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">3</div>
                    <div className="text-sm">Confirmez l'installation</div>
                  </li>
                </ol>
              </div>
            )}

            {isIOS && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Sur iPhone/iPad avec Safari :</p>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">1</div>
                    <div className="text-sm">
                      <span>Appuyez sur </span>
                      <Share className="w-4 h-4 inline mx-1" />
                      <span> (icône de partage) en bas</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">2</div>
                    <div className="text-sm">
                      <span>Faites défiler et appuyez sur "Sur l'écran d'accueil" </span>
                      <Plus className="w-4 h-4 inline" />
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">3</div>
                    <div className="text-sm">Appuyez sur "Ajouter"</div>
                  </li>
                </ol>
              </div>
            )}

            {!isAndroid && !isIOS && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Pour installer l'application :</p>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">1</div>
                    <div className="text-sm">Ouvrez cette page sur votre téléphone Android ou iOS</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">2</div>
                    <div className="text-sm">Utilisez Chrome sur Android ou Safari sur iOS</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">3</div>
                    <div className="text-sm">Suivez les instructions pour ajouter à l'écran d'accueil</div>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Already installed message */}
        {isInstalled && (
          <div className="card-flat p-5 text-center">
            <Check className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <h3 className="font-semibold">Application installée !</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vous pouvez maintenant accéder à TripTracker depuis votre écran d'accueil.
            </p>
            <Link to="/">
              <Button className="btn-primary mt-4">
                Continuer vers l'application
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
