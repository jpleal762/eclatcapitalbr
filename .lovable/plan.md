
## Diagnóstico: Por que o app carrega versão antiga

### Causa raiz — Service Worker PWA agressivo

O `vite-plugin-pwa` está configurado com `registerType: "autoUpdate"` e `globPatterns` que inclui **todos os arquivos JS, CSS e HTML**. Isso cria um Service Worker que:

1. **Cacheia tudo agressivamente** — JS, CSS, HTML, fontes, ícones
2. **Serve do cache primeiro** — o browser usa o cache local sem consultar o servidor
3. **Atualiza em background** — o novo SW fica "esperando" mas só ativa no próximo reload completo (ou quando fechar todas as abas)

Resultado: depois de cada deploy, o usuário continua vendo a versão anterior até fechar e reabrir o app.

**Além disso:** falta `skipWaiting: true` + `clientsClaim: true` no workbox — sem isso, mesmo quando o novo SW é baixado, ele fica aguardando indefinidamente.

### O que precisa mudar

**1. `vite.config.ts`** — adicionar ao workbox:
- `skipWaiting: true` → novo SW ativa imediatamente ao ser baixado
- `clientsClaim: true` → novo SW toma controle de todas as abas imediatamente
- `cleanupOutdatedCaches: true` → limpa caches antigos automaticamente
- Retirar `html` do `globPatterns` → nunca cachear o HTML principal (evita o loop "versão antiga")

**2. `src/main.tsx`** — registrar um listener de atualização que força o reload quando um novo SW é detectado, para que o usuário veja a versão nova automaticamente sem precisar fechar o app:
```ts
import { registerSW } from 'virtual:pwa-register'
registerSW({ onNeedRefresh() { window.location.reload() } })
```

**3. `index.html`** — adicionar meta tag `no-cache` para o HTML nunca ser cacheado pelo browser diretamente (camada adicional de proteção):
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
```

### Resultado esperado

```text
Antes (quebrado):
  Deploy → SW novo baixado → fica "waiting" → usuário vê versão antiga
  Usuário precisa fechar todas as abas para ver versão nova

Depois (correto):
  Deploy → SW novo baixado → skipWaiting ativa imediatamente → reload automático
  Usuário sempre vê versão mais recente em < 30 segundos
```

### Tabela de mudanças

| Arquivo | Mudança |
|---|---|
| `vite.config.ts` | skipWaiting, clientsClaim, cleanupOutdatedCaches, remover html do glob |
| `src/main.tsx` | registerSW com onNeedRefresh → reload |
| `index.html` | meta Cache-Control no-cache |

Nenhuma mudança de banco de dados necessária.
