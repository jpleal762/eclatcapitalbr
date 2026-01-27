import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  assessorName?: string | null;
  enabled?: boolean; // Controla se o prompt pode aparecer (default: true)
}

export const PWAInstallPrompt = ({ assessorName, enabled = true }: PWAInstallPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detecta iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Para iOS, mostra instruções manuais após delay
    if (isIOSDevice) {
      const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Não mostra se já instalado, descartado ou desabilitado
  if (isInstalled || !showPrompt || !enabled || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  const firstName = assessorName?.split(' ')[0] || '';
  const personalizedMessage = assessorName 
    ? `Instale seu dashboard personalizado, ${firstName}!`
    : 'Instale o Dashboard Eclat no seu celular para acesso rápido!';

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="p-4 bg-card border-primary/20 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            {isIOS ? (
              <Share className="h-6 w-6 text-primary" />
            ) : (
              <Download className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Instalar App</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {personalizedMessage}
            </p>
            {isIOS ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Toque em <Share className="h-3 w-3 inline mx-1" /> e depois em <strong>"Adicionar à Tela de Início"</strong>
                </p>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="w-full">
                  <X className="h-4 w-4 mr-1" />
                  Entendi
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Instalar
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
