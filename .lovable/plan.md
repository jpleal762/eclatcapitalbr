

## Plano: App Instalável (PWA) Personalizado por Assessor

### Objetivo

Transformar o dashboard em um **Progressive Web App (PWA)** que permite aos assessores instalarem o app em seus celulares. Quando acessarem via token (ex: `?token=hb-eclat-2024a`), verão um prompt para instalar o app já configurado para sua visão personalizada.

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `vite.config.ts` | **MODIFICAR** - Adicionar plugin vite-plugin-pwa |
| `public/manifest.json` | **CRIAR** - Manifest base do PWA |
| `public/icons/` | **CRIAR** - Ícones PWA em múltiplos tamanhos |
| `src/components/PWAInstallPrompt.tsx` | **CRIAR** - Componente de prompt de instalação |
| `src/pages/Index.tsx` | **MODIFICAR** - Integrar prompt de instalação |
| `index.html` | **MODIFICAR** - Adicionar meta tags PWA |

---

### Detalhes Técnicos

#### 1. Instalar Dependência PWA

```bash
npm install vite-plugin-pwa
```

#### 2. Configurar vite.config.ts

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Eclat Capital - Dashboard',
        short_name: 'Eclat KPIs',
        description: 'Dashboard de KPIs Eclat Capital',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
}));
```

#### 3. Criar Ícones PWA (public/icons/)

Será necessário criar versões do logo Eclat nos tamanhos:
- 192x192 pixels
- 512x512 pixels

---

#### 4. Componente PWAInstallPrompt.tsx

```tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  assessorName?: string | null;
}

export const PWAInstallPrompt = ({ assessorName }: PWAInstallPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
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
    // Salva no localStorage para não mostrar novamente na sessão
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Não mostra se já instalado ou descartado
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="p-4 bg-card border-primary/20 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Instalar App</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {assessorName 
                ? `Instale seu dashboard personalizado, ${assessorName.split(' ')[0]}!`
                : 'Instale o Dashboard Eclat no seu celular para acesso rápido!'
              }
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleInstall} className="flex-1">
                <Download className="h-4 w-4 mr-1" />
                Instalar
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
```

---

#### 5. Integrar no Index.tsx

**Adicionar import:**
```typescript
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
```

**Adicionar componente antes do fechamento do return:**
```tsx
{/* PWA Install Prompt - personalizado por assessor */}
<PWAInstallPrompt assessorName={isTokenLocked ? selectedView : null} />
```

---

#### 6. Atualizar index.html

```html
<head>
  <!-- Existing meta tags -->
  
  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#1a1a2e" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Eclat KPIs" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
  
  <!-- Updated title -->
  <title>Eclat Capital - Dashboard KPIs</title>
</head>
```

---

### Fluxo de Funcionamento

```text
┌─────────────────────────────────────────────────────────────────┐
│ 1. Assessor acessa: eclatcapitalbr.lovable.app/?token=hb-xxx   │
├─────────────────────────────────────────────────────────────────┤
│ 2. Token validado → Dashboard carrega filtrado para "Hingrid"  │
├─────────────────────────────────────────────────────────────────┤
│ 3. Browser detecta PWA → Dispara evento "beforeinstallprompt"  │
├─────────────────────────────────────────────────────────────────┤
│ 4. Prompt aparece:                                              │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ 📲 Instalar App                                          │ │
│    │ Instale seu dashboard personalizado, Hingrid!            │ │
│    │                                                          │ │
│    │ [📲 Instalar]  [✕]                                       │ │
│    └──────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ 5. Assessor clica "Instalar" → App é adicionado à home screen │
│                                                                 │
│    📱 Home Screen:                                              │
│    ┌───────┐                                                    │
│    │ 🟡    │  ← Ícone Eclat                                     │
│    │Eclat  │                                                    │
│    │ KPIs  │                                                    │
│    └───────┘                                                    │
├─────────────────────────────────────────────────────────────────┤
│ 6. Abre como app standalone (sem barra do browser)             │
│    - URL preservada com token → sempre carrega visão do assessor│
│    - Funciona offline para dados já carregados                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Comportamento por Tipo de Acesso

| Acesso | Mensagem do Prompt | URL Salva |
|--------|-------------------|-----------|
| `?token=hb-eclat-2024a` | "Instale seu dashboard personalizado, Hingrid!" | `/?token=hb-eclat-2024a` |
| `?token=jj-eclat-2024b` | "Instale seu dashboard personalizado, José!" | `/?token=jj-eclat-2024b` |
| Sem token (Escritório) | "Instale o Dashboard Eclat para acesso rápido!" | `/` |

---

### Compatibilidade

| Plataforma | Suporte |
|------------|---------|
| Android Chrome | Prompt nativo de instalação |
| iOS Safari | Instruções manuais (Share → Add to Home) |
| Desktop Chrome | Ícone de instalação na barra de endereços |

---

### Benefícios

1. **Acesso rápido** - Ícone na home screen do celular
2. **Personalização** - Cada assessor tem "seu" app com dados filtrados
3. **Experiência nativa** - Abre sem barra do browser
4. **Token preservado** - URL com token é salva na instalação
5. **Offline parcial** - Cache de assets para carregamento rápido

