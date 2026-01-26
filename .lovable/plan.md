

## Plano: Separar Controle de Rotação de Páginas e Flip de Cards

### Problema Atual

Existe um único botão Play/Pause (`isAutoRotationEnabled`) que controla **ambos**:
1. **Rotação de páginas** - Alterna entre Dashboard → Análises → Sprint a cada 90s
2. **Flip de cards** - Vira os cards (FlipICMCard, FlipMetaTable, etc.) a cada 30s

O usuário quer controles **independentes** para cada funcionalidade.

### Solução Proposta

Separar o estado único em dois estados independentes com dois botões no header:

```text
ANTES:
┌────────────────────────────────────────────────────────────────┐
│  [Logo]  [Dashboard ▼]  [⏸ Pausar]  [⬜ Fullscreen]  [🌙]    │
│                          ↑                                     │
│                    Controla TUDO                               │
└────────────────────────────────────────────────────────────────┘

DEPOIS:
┌────────────────────────────────────────────────────────────────┐
│  [Logo]  [Dashboard ▼]  [📄 Páginas] [🔄 Cards]  [⬜]  [🌙]   │
│                          ↑            ↑                        │
│              Rotação Páginas    Flip Cards                     │
└────────────────────────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Index.tsx` | **MODIFICAR** - Separar estados e adicionar segundo botão |

---

### Detalhes Técnicos

#### 1. Separar Estados

**Antes:**
```tsx
const [isAutoRotationEnabled, setIsAutoRotationEnabled] = useState(true);
```

**Depois:**
```tsx
const [isPageRotationEnabled, setIsPageRotationEnabled] = useState(true);
const [isCardFlippingEnabled, setIsCardFlippingEnabled] = useState(true);
```

#### 2. Atualizar Effects

**Effect de Rotação de Páginas (90s):**
```tsx
useEffect(() => {
  if (!hasData || !isPageRotationEnabled) return;  // ← Usa estado específico
  
  const pageOrder: PageType[] = ["dashboard", "analysis", "sprint"];
  const interval = setInterval(() => {
    setCurrentPage(prev => {
      const currentIndex = pageOrder.indexOf(prev);
      const nextIndex = (currentIndex + 1) % pageOrder.length;
      return pageOrder[nextIndex];
    });
  }, 90000);
  
  return () => clearInterval(interval);
}, [hasData, isPageRotationEnabled]);
```

**Effect de Flip de Cards (30s):**
```tsx
useEffect(() => {
  if (!hasData || !isCardFlippingEnabled) return;  // ← Usa estado específico
  
  const interval = setInterval(() => {
    setIsGlobalFlipped(prev => !prev);
  }, 30000);
  
  return () => clearInterval(interval);
}, [hasData, isCardFlippingEnabled]);
```

#### 3. Adicionar Dois Botões no Header

```tsx
import { Menu, Maximize2, Minimize2, Play, Pause, RotateCcw, Layers } from "lucide-react";

// No header, substituir o botão único por dois:
{hasData && (
  <>
    {/* Botão de Rotação de Páginas */}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsPageRotationEnabled(prev => !prev)}
      className="h-8 w-8"
      title={isPageRotationEnabled ? "Pausar Rotação de Páginas" : "Iniciar Rotação de Páginas"}
    >
      {isPageRotationEnabled ? (
        <Layers className="h-4 w-4 text-primary" />
      ) : (
        <Layers className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
    
    {/* Botão de Flip de Cards */}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsCardFlippingEnabled(prev => !prev)}
      className="h-8 w-8"
      title={isCardFlippingEnabled ? "Pausar Flip de Cards" : "Iniciar Flip de Cards"}
    >
      {isCardFlippingEnabled ? (
        <RotateCcw className="h-4 w-4 text-primary" />
      ) : (
        <RotateCcw className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  </>
)}
```

---

### Ícones Sugeridos

| Funcionalidade | Ícone Ativo | Ícone Inativo | Descrição |
|----------------|-------------|---------------|-----------|
| Rotação Páginas | `Layers` (colorido) | `Layers` (cinza) | Representa múltiplas páginas |
| Flip Cards | `RotateCcw` (colorido) | `RotateCcw` (cinza) | Representa rotação/flip |

---

### Comportamento

| Estado Páginas | Estado Cards | Resultado |
|----------------|--------------|-----------|
| ✅ Ativo | ✅ Ativo | Tudo automático (padrão) |
| ❌ Pausado | ✅ Ativo | Página fixa, cards viram |
| ✅ Ativo | ❌ Pausado | Páginas alternam, cards fixos |
| ❌ Pausado | ❌ Pausado | Tudo parado (modo apresentação manual) |

---

### Benefícios

1. **Flexibilidade** - Usuário pode pausar páginas enquanto mantém cards virando
2. **Clareza visual** - Ícones diferentes indicam claramente cada funcionalidade
3. **Feedback visual** - Cor do ícone indica estado (primary vs muted)
4. **Tooltips descritivos** - Usuário entende o que cada botão faz

