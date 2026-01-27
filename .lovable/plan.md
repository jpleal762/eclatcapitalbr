
### Diagnóstico (por que ainda abre na “visão do escritório”)
Hoje a regra de acesso por token está 100% baseada em `?token=` na URL (em `src/pages/Index.tsx`). Se o app instalado abre em `/` sem o querystring, o código não encontra token e cai no padrão “Escritório”.

Mesmo com o “manifest dinâmico”, na prática o navegador pode:
- **ler/cachear o manifest cedo demais** (antes de você trocar o `href` via JS) e continuar instalando com `start_url: "/"`; e/ou
- **não reprocessar** o manifest quando o `href` muda (comportamento comum).

Então precisamos de um fallback robusto que não dependa do `start_url` com querystring.

---

### Solução proposta (robusta): “memorizar” o token para o app instalado
Ajustar o frontend para:
1) **Salvar o token em armazenamento local** depois que ele for validado (quando o usuário abre via link com token).
2) Quando o app estiver rodando como **instalado (standalone)** e abrir sem `?token=`, ele:
   - lê o token salvo
   - valida no backend
   - trava a visão do assessor normalmente (como se estivesse no link com token)

Isso garante que, mesmo que o PWA abra em `/`, ele recupera a visão correta.

---

### Mudanças planejadas (arquivos)
#### 1) `src/pages/Index.tsx` (principal)
- Criar uma chave, por exemplo: `ECLAT_PWA_TOKEN = "eclat:pwa:token"`.
- No fluxo atual (quando existe `token` na URL e ele valida):
  - salvar `localStorage.setItem(ECLAT_PWA_TOKEN, token)`
- Adicionar um segundo caminho de validação:
  - se **não** existe `token` na URL
  - e o app está em modo instalado (`display-mode: standalone` ou `navigator.standalone`)
  - e existe token salvo no `localStorage`
  - então validar esse token e aplicar:
    - `setSelectedView(assessor_name)`
    - `setFilters({ assessor: assessor_name, ... })`
    - `setIsTokenLocked(true)`
    - `setTokenValidated(true)`

- Tratamento de erro para token salvo:
  - se o token salvo estiver inválido/desativado, limpar `localStorage.removeItem(ECLAT_PWA_TOKEN)`
  - opcionalmente mostrar uma mensagem/alerta e voltar para visão Escritório (para não “prender” o usuário num acesso negado dentro do app)

#### 2) `src/components/PWAInstallPrompt.tsx` (melhoria para evitar instalar “rápido demais”)
Hoje o prompt pode aparecer antes do token terminar de validar (o `assessorName` ainda não chegou), e o usuário pode instalar naquele momento.

Ajuste:
- Adicionar uma prop `enabled?: boolean` (ou `ready?: boolean`)
- No `Index.tsx`, quando houver `?token=...`, só habilitar o prompt **depois** de `tokenValidated === true`
  - Isso reduz muito a chance de instalar antes de a sessão estar travada no assessor.
- (Opcional) passar também o token como prop e salvar no `localStorage` no clique “Instalar” como redundância.

#### 3) `index.html` (opcional – manter ou simplificar)
Como a correção principal passa a ser “token persistido”, o manifest dinâmico fica menos crítico.
Opções:
- **Opção A (recomendada):** manter como está por enquanto (não atrapalha) e depender do fallback no app.
- **Opção B (mais correta tecnicamente):** mudar para **não criar o `<link rel="manifest">` com `href` fixo no HTML**, e sim criar o link via JS já com o `href` final antes do browser processar (evita cache do manifest “errado”).

Eu recomendo fazer **A + token persistido** primeiro (resolve o problema mesmo se o manifest não obedecer o querystring).

---

### Como vamos validar que ficou certo (passo a passo)
1) Publicar as mudanças.
2) Em um celular (Android ou iOS):
   - Abrir o link com token no navegador: `.../?token=xxxxx`
   - Esperar carregar e ver o cadeado 🔒 com o nome do assessor
   - Instalar/Adicionar à tela inicial
3) Abrir pelo ícone instalado:
   - Mesmo que abra em `/` (sem barra de URL), o app deve:
     - encontrar o token salvo
     - validar
     - entrar direto travado no assessor

**Teste extra (importante):** se você já instalou antes e ficou “Escritório”, após essa mudança você só precisa abrir **uma vez** o link com token no navegador (para salvar o token). Depois disso, o app instalado passa a respeitar o assessor.

---

### Observações importantes
- Essa abordagem funciona tanto para Android quanto para iOS, porque não depende do `start_url` com querystring.
- Se um dia precisar “voltar para Escritório” naquele celular, a solução é:
  - limpar dados do site / desinstalar o app, ou
  - (opcional) eu posso adicionar um botão “Desvincular assessor” no cabeçalho do app instalado.

---

### Entregáveis ao final
- App instalado abrindo sempre na visão correta do assessor
- Prompt de instalação não aparecendo antes de o token estar validado (reduz chance de instalar “na visão errada”)
- Fallback robusto mesmo que o manifest ignore o querystring
