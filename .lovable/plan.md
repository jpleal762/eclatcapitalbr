

## Plano: Adicionar Toggle Desktop/Mobile no Dashboard

### Objetivo

Criar um botão de alternância que permite visualizar o dashboard em modo desktop (padrão) ou modo mobile (simulando tela de smartphone com largura de 390px).

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Index.tsx` | **MODIFICAR** - Adicionar estado viewMode e botão toggle |
| `src/index.css` | **MODIFICAR** - Adicionar estilos para modo mobile simulado |

---

### Detalhes Técnicos

#### 1. Adicionar Estado e Botão Toggle (Index.tsx)

**Localização**: Após linha 98 (junto com outros estados de controle)

```typescript
const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
```

**Localização**: Linha ~520 (junto com outros botões no header, antes do Fullscreen)

```tsx
{/* Desktop/Mobile View Toggle */}
{hasData && (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
        className="h-8 w-8"
      >
        {viewMode === 'desktop' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      {viewMode === 'desktop' ? 'Ver em modo Mobile' : 'Ver em modo Desktop'}
    </TooltipContent>
  </Tooltip>
)}
```

**Import adicional necessário** (linha ~46):
```typescript
import { Menu, Maximize2, Minimize2, Layers, RotateCcw, Smartphone, Monitor } from "lucide-react";
```

---

#### 2. Aplicar Classes Condicionais no Container (Index.tsx)

**Localização**: Linha 573 (container `<main>`)

```tsx
// ANTES
<main className="flex-1 overflow-hidden px-4 py-3">

// DEPOIS
<main className={cn(
  "flex-1 overflow-hidden px-4 py-3",
  viewMode === 'mobile' && "flex justify-center"
)}>
  <div className={cn(
    "h-full w-full",
    viewMode === 'mobile' && "mobile-view-container max-w-[390px] overflow-y-auto"
  )}>
    {/* conteúdo existente */}
  </div>
</main>
```

**Import adicional necessário**:
```typescript
import { cn } from "@/lib/utils";
```

---

#### 3. Estilos CSS para Modo Mobile (index.css)

**Adicionar ao final do arquivo**:

```css
/* Mobile View Simulation */
.mobile-view-container {
  /* Simula viewport de smartphone */
  max-width: 390px;
  margin: 0 auto;
  border-left: 2px solid hsl(var(--border));
  border-right: 2px solid hsl(var(--border));
  background: hsl(var(--card));
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Ajustes de layout para modo mobile */
.mobile-view-container .grid {
  grid-template-columns: 1fr !important;
}

.mobile-view-container .lg\:grid-cols-2,
.mobile-view-container .lg\:grid-cols-3 {
  grid-template-columns: 1fr !important;
}

/* Reduzir gaps em mobile */
.mobile-view-container .gap-3 {
  gap: 0.5rem;
}

/* Ajustar flex ratios para coluna única */
.mobile-view-container .flex-\[45\],
.mobile-view-container .flex-\[55\],
.mobile-view-container .flex-\[65\],
.mobile-view-container .flex-\[35\] {
  flex: none;
  height: auto;
  min-height: 200px;
}

/* Permitir scroll vertical no conteúdo */
.mobile-view-container > div {
  overflow-y: auto;
  overflow-x: hidden;
}
```

---

### Comportamento Esperado

```text
MODO DESKTOP (padrão):
┌────────────────────────────────────────────────────────────────┐
│ 🍔  [🔒 Assessor]        LOGO         📱 📄 🔄 ⛶ 🌙 📤       │
├────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │   Card 1   │  │   Card 2   │  │   Card 3   │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  Graph 1   │  │  Graph 2   │  │  Graph 3   │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└────────────────────────────────────────────────────────────────┘

MODO MOBILE (após clicar no ícone 📱):
┌────────────────────────────────────────────────────────────────┐
│ 🍔  [🔒 Assessor]        LOGO         🖥️ 📄 🔄 ⛶ 🌙 📤       │
├────────────────────────────────────────────────────────────────┤
│                    ┌──────────┐                                │
│                    │ Card 1   │                                │
│                    ├──────────┤                                │
│                    │ Card 2   │                                │
│                    ├──────────┤                                │
│                    │ Card 3   │  ← Scroll vertical             │
│                    ├──────────┤                                │
│                    │ Graph 1  │                                │
│                    ├──────────┤                                │
│                    │ Graph 2  │                                │
│                    └──────────┘                                │
└────────────────────────────────────────────────────────────────┘
```

---

### Ícones e Estados

| Estado | Ícone Exibido | Tooltip | Ação |
|--------|---------------|---------|------|
| Desktop | `<Smartphone />` | "Ver em modo Mobile" | Clique muda para mobile |
| Mobile | `<Monitor />` | "Ver em modo Desktop" | Clique volta para desktop |

---

### Benefícios

1. **Simulação realista** - Container de 390px simula iPhone/Android típico
2. **Layout adaptativo** - Grid muda para coluna única automaticamente
3. **Scroll habilitado** - Permite navegar por todo o conteúdo em modo mobile
4. **Visual diferenciado** - Bordas e sombra simulam device frame
5. **Não afeta código existente** - Mudanças são puramente visuais/condicionais
6. **Persistência** - Estado pode ser salvo no localStorage se desejado

