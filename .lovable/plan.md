
## Plano: Preservar Token na Instalação do PWA

### Problema Identificado

O PWA está configurado com `start_url: "/"` fixo no `manifest.json`. Quando um assessor acessa via `?token=hb-eclat-2024a` e instala o app, ele abre sempre na raiz `/` sem o token, mostrando a visão do "Escritório".

### Solução

Gerar o **manifest dinamicamente via JavaScript** no momento que a página carrega. Assim, o `start_url` captura a URL atual (incluindo o token) e o PWA instalado sempre abrirá na visão correta do assessor.

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `index.html` | **MODIFICAR** - Remover link estático do manifest, adicionar script dinâmico |
| `vite.config.ts` | **MODIFICAR** - Remover geração de manifest pelo plugin (usar apenas service worker) |
| `public/manifest.json` | **MANTER** - Fallback para quando não há token |

---

### Detalhes Técnicos

#### 1. Modificar index.html - Manifest Dinâmico

Substituir o link estático do manifest por um script que gera dinamicamente:

```html
<head>
  <!-- ... outras meta tags ... -->
  
  <!-- PWA Manifest - Gerado dinamicamente para preservar token -->
  <link rel="manifest" id="pwa-manifest" href="/manifest.json" />
  
  <script>
    // Gera manifest dinâmico para preservar token na URL
    (function() {
      const currentUrl = window.location.href;
      const hasToken = currentUrl.includes('token=');
      
      // Se tem token, gera manifest com start_url dinâmico
      if (hasToken) {
        const manifest = {
          name: "Eclat Capital - Dashboard KPIs",
          short_name: "Eclat KPIs",
          description: "Dashboard de KPIs Eclat Capital XP",
          theme_color: "#1a1a2e",
          background_color: "#1a1a2e",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: window.location.pathname + window.location.search,
          icons: [
            { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
            { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
          ]
        };
        
        const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
        const manifestUrl = URL.createObjectURL(blob);
        document.getElementById('pwa-manifest').setAttribute('href', manifestUrl);
      }
    })();
  </script>
</head>
```

---

#### 2. Modificar vite.config.ts

Ajustar o plugin VitePWA para **não gerar manifest** (deixar o script dinâmico fazer isso):

```typescript
VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico", "robots.txt", "icons/*"],
  // Removido: manifest - será gerado dinamicamente
  manifest: false, // Desativa geração de manifest pelo plugin
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"]
  }
})
```

---

### Fluxo de Funcionamento

```text
┌─────────────────────────────────────────────────────────────────┐
│ ACESSO SEM TOKEN: eclatcapitalbr.lovable.app/                  │
├─────────────────────────────────────────────────────────────────┤
│ 1. Script detecta: hasToken = false                             │
│ 2. Usa manifest.json estático: start_url = "/"                 │
│ 3. PWA instalado abre na visão "Escritório"                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ACESSO COM TOKEN: eclatcapitalbr.lovable.app/?token=hb-xxx     │
├─────────────────────────────────────────────────────────────────┤
│ 1. Script detecta: hasToken = true                              │
│ 2. Gera manifest dinâmico: start_url = "/?token=hb-xxx"        │
│ 3. PWA instalado abre direto na visão "Hingrid"                │
└─────────────────────────────────────────────────────────────────┘
```

---

### Resultado por Assessor

| Assessor | URL de Acesso | start_url do PWA Instalado |
|----------|---------------|---------------------------|
| Hingrid | `/?token=hb-eclat-2024a` | `/?token=hb-eclat-2024a` |
| José Júlio | `/?token=jj-eclat-2024b` | `/?token=jj-eclat-2024b` |
| Marcela | `/?token=mm-eclat-2024c` | `/?token=mm-eclat-2024c` |
| Escritório | `/` | `/` |

---

### Benefícios

1. **Token preservado** - Cada assessor tem seu app personalizado
2. **Sem duplicação** - Mesmo código funciona para todos
3. **Fallback seguro** - Sem token, usa manifest estático padrão
4. **Compatibilidade** - Funciona em Android, iOS (com instruções) e Desktop
