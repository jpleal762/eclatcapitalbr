
## Plano: Reorganização dos Controles do Header

### Resumo das Mudanças

1. **Travar botão de IA (flip de cards) para tokens**: Esconder o botão de flip de cards quando acessado via token
2. **Mover botões para dentro do modal de Config**: Rotação de páginas, Flip de cards, Fullscreen, Desktop/Mobile serão movidos para o modal
3. **Manter no header apenas**: ScaleSelector (zoom), ThemeToggle (modo escuro), PageToggle (navegação entre telas), e FileUpload

---

### Parte 1: Modificar Header (Index.tsx)

#### Botões a REMOVER do header (linhas 575-664):
- Desktop/Mobile View Toggle (`viewMode`)
- Token Access Config Button (⚙️ Settings)
- Page Rotation Toggle (Layers)
- Card Flipping Toggle (RotateCcw)
- Fullscreen Button (Maximize2/Minimize2)

#### Botões que PERMANECEM no header:
- PageToggle (navegação entre telas - necessário para navegar)
- ScaleSelector (zoom)
- ThemeToggle (modo escuro/claro)
- FileUpload (apenas quando não é token)

#### Novo botão Config no header:
- Botão ⚙️ visível apenas para modo escritório (não token)
- Abre o modal TokenAccessConfig expandido

---

### Parte 2: Expandir TokenAccessConfig.tsx

#### Adicionar novas seções ao modal:

```text
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Configurações do Dashboard                       ✕  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ▶ CONTROLES DO DASHBOARD                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☑ Rotação automática de páginas (90s)              │ │
│ │ ☑ Flip automático de cards (30s)                   │ │
│ │ ☑ Modo tela cheia                                   │ │
│ │ ○ Desktop  ● Mobile (visualização)                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ▶ ACESSO DOS ASSESSORES                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Assessor         │ 📊 │ 📈 │ 🎯 │ 🏃 │ 📋 │        │ │
│ │ Hingrid Bold     │ ✓  │ ✓  │ ✓  │ ✗  │ ✓  │        │ │
│ │ ...                                                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                              [ Cancelar ] [ Salvar ]    │
└─────────────────────────────────────────────────────────┘
```

#### Props necessárias para o componente:

```typescript
interface TokenAccessConfigProps {
  isOpen: boolean;
  onClose: () => void;
  // Novos props para controles do dashboard
  isPageRotationEnabled: boolean;
  onPageRotationChange: (enabled: boolean) => void;
  isCardFlippingEnabled: boolean;
  onCardFlippingChange: (enabled: boolean) => void;
  isFullscreen: boolean;
  onFullscreenChange: (enabled: boolean) => void;
  viewMode: 'desktop' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
}
```

---

### Parte 3: Visibilidade por Tipo de Acesso

| Elemento | Escritório | Token |
|----------|------------|-------|
| PageToggle | ✓ (todas telas) | ✓ (telas permitidas) |
| Botão Config (⚙️) | ✓ | ✗ |
| ScaleSelector | ✓ | ✓ |
| ThemeToggle | ✓ | ✓ |
| FileUpload | ✓ | ✗ |
| Rotação automática | Via modal | Desabilitado |
| Flip de cards | Via modal | Desabilitado |
| Fullscreen | Via modal | Desabilitado |
| Desktop/Mobile toggle | Via modal | Desabilitado |

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Index.tsx` | Remover botões do header, passar props para TokenAccessConfig |
| `src/components/dashboard/TokenAccessConfig.tsx` | Adicionar seção de controles do dashboard |

---

### Resultado Esperado

**Modo Escritório:**
- Header limpo: PageToggle, ⚙️ Config, Zoom, Tema, Upload
- Modal Config contém: Controles automáticos + Configuração de acesso dos tokens

**Modo Token (Assessor):**
- Header mínimo: PageToggle (telas permitidas), Zoom, Tema
- Sem acesso a configurações, rotação automática ou flip de cards
- Funcionalidade de IA (verso dos cards) bloqueada pois flip está desabilitado
