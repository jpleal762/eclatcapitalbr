

## Plano: Implementar Botão de Escala/Zoom na Barra Superior

### Objetivo

Adicionar um botão dropdown na barra superior do dashboard que permite selecionar um multiplicador de escala (1x, 1.25x, 1.5x, 2x). Quando selecionado, todos os elementos visuais (fontes, gaps, paddings, ícones, barras) serão multiplicados pelo fator escolhido.

---

### Arquitetura da Solução

A abordagem mais eficiente é usar **CSS custom properties (variáveis CSS)** combinadas com um contexto React:

1. **CSS Variables Base**: Definir variáveis CSS para todos os tamanhos base
2. **Multiplicador Dinâmico**: Uma variável `--scale-factor` que é multiplicada por todas as outras
3. **Contexto React**: Para propagar o fator de escala pelo app
4. **Persistência**: Salvar preferência no localStorage

---

### Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/contexts/ScaleContext.tsx` | Criar | Contexto React para gerenciar fator de escala |
| `src/components/ScaleSelector.tsx` | Criar | Componente dropdown para seleção de escala |
| `src/index.css` | Modificar | Adicionar variáveis CSS base e classes escaláveis |
| `src/pages/Index.tsx` | Modificar | Adicionar ScaleSelector no header e wrapper do contexto |
| `src/App.tsx` | Modificar | Adicionar ScaleProvider no nível superior |

---

### Detalhamento Técnico

#### 1. Criar ScaleContext.tsx

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ScaleFactor = 1 | 1.25 | 1.5 | 2;

interface ScaleContextType {
  scaleFactor: ScaleFactor;
  setScaleFactor: (factor: ScaleFactor) => void;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

const SCALE_STORAGE_KEY = "dashboard-scale-factor";

export function ScaleProvider({ children }: { children: ReactNode }) {
  const [scaleFactor, setScaleFactorState] = useState<ScaleFactor>(() => {
    const saved = localStorage.getItem(SCALE_STORAGE_KEY);
    return saved ? (parseFloat(saved) as ScaleFactor) : 1;
  });

  const setScaleFactor = (factor: ScaleFactor) => {
    setScaleFactorState(factor);
    localStorage.setItem(SCALE_STORAGE_KEY, factor.toString());
    // Atualizar CSS custom property no root
    document.documentElement.style.setProperty("--scale-factor", factor.toString());
  };

  // Aplicar escala inicial no mount
  useEffect(() => {
    document.documentElement.style.setProperty("--scale-factor", scaleFactor.toString());
  }, []);

  return (
    <ScaleContext.Provider value={{ scaleFactor, setScaleFactor }}>
      {children}
    </ScaleContext.Provider>
  );
}

export function useScale() {
  const context = useContext(ScaleContext);
  if (!context) {
    throw new Error("useScale must be used within a ScaleProvider");
  }
  return context;
}
```

#### 2. Criar ScaleSelector.tsx

```tsx
import { ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScale } from "@/contexts/ScaleContext";
import { cn } from "@/lib/utils";

const SCALE_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
] as const;

export function ScaleSelector() {
  const { scaleFactor, setScaleFactor } = useScale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Escala de visualização">
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Escala</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SCALE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setScaleFactor(option.value)}
            className={cn(
              "cursor-pointer",
              scaleFactor === option.value && "bg-primary/10 text-primary font-bold"
            )}
          >
            {option.label}
            {scaleFactor === option.value && " ✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### 3. Modificar index.css

Adicionar classes escaláveis que usam `calc()` com `--scale-factor`:

```css
:root {
  --scale-factor: 1;
}

/* Scaled Typography Classes */
.text-scaled-4xs { font-size: calc(6px * var(--scale-factor)); }
.text-scaled-3xs { font-size: calc(5px * var(--scale-factor)); }
.text-scaled-2xs { font-size: calc(6px * var(--scale-factor)); }
.text-scaled-xs { font-size: calc(6px * var(--scale-factor)); }
.text-scaled-sm { font-size: calc(7px * var(--scale-factor)); }
.text-scaled-base { font-size: calc(8px * var(--scale-factor)); }
.text-scaled-lg { font-size: calc(10px * var(--scale-factor)); }
.text-scaled-xl { font-size: calc(12px * var(--scale-factor)); }
.text-scaled-2xl { font-size: calc(14px * var(--scale-factor)); }

/* Scaled Gaps */
.gap-scaled-sm { gap: calc(2px * var(--scale-factor)); }
.gap-scaled { gap: calc(3px * var(--scale-factor)); }
.gap-scaled-lg { gap: calc(6px * var(--scale-factor)); }

/* Scaled Padding */
.p-scaled-sm { padding: calc(2px * var(--scale-factor)); }
.p-scaled { padding: calc(4px * var(--scale-factor)); }
.p-scaled-lg { padding: calc(6px * var(--scale-factor)); }

/* Scaled Bar Heights */
.h-bar-scaled-sm { height: calc(3px * var(--scale-factor)); }
.h-bar-scaled { height: calc(5px * var(--scale-factor)); }
.h-bar-scaled-lg { height: calc(6px * var(--scale-factor)); }

/* Scaled Icon Sizes */
.icon-scaled-sm { width: calc(8px * var(--scale-factor)); height: calc(8px * var(--scale-factor)); }
.icon-scaled { width: calc(10px * var(--scale-factor)); height: calc(10px * var(--scale-factor)); }
.icon-scaled-lg { width: calc(14px * var(--scale-factor)); height: calc(14px * var(--scale-factor)); }
```

#### 4. Modificar Index.tsx

Adicionar o ScaleSelector no header (linha ~622):

```tsx
// Importar no topo
import { ScaleSelector } from "@/components/ScaleSelector";

// Adicionar no header, após o botão de fullscreen (~linha 621)
<ScaleSelector />
<ThemeToggle />
```

#### 5. Modificar App.tsx

Envolver o app com ScaleProvider:

```tsx
import { ScaleProvider } from "@/contexts/ScaleContext";

// No return, envolver com ScaleProvider
return (
  <QueryClientProvider client={queryClient}>
    <ScaleProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          {/* ... resto do app */}
        </TooltipProvider>
      </ThemeProvider>
    </ScaleProvider>
  </QueryClientProvider>
);
```

---

### Comportamento Esperado

| Seleção | Efeito |
|---------|--------|
| **1x** | Tamanho atual (base: 50% já aplicado) |
| **1.25x** | 25% maior que o base |
| **1.5x** | 50% maior que o base |
| **2x** | Dobro do base (volta ao tamanho original antes da redução) |

---

### Exemplo de Escala

Para um elemento com `text-[6px]`:

| Fator | Tamanho Final |
|-------|---------------|
| 1x | 6px |
| 1.25x | 7.5px |
| 1.5x | 9px |
| 2x | 12px |

---

### Persistência

- A preferência de escala é salva no `localStorage` com a chave `dashboard-scale-factor`
- Ao recarregar a página, a escala selecionada é restaurada automaticamente

---

### Ordem de Implementação

1. Criar `src/contexts/ScaleContext.tsx`
2. Criar `src/components/ScaleSelector.tsx`
3. Adicionar variáveis CSS em `src/index.css`
4. Modificar `src/App.tsx` para adicionar ScaleProvider
5. Modificar `src/pages/Index.tsx` para adicionar o botão no header

---

### Próximos Passos (Opcional)

Após a implementação inicial, podemos:
- Substituir gradualmente as classes `text-responsive-*` por `text-scaled-*` nos componentes
- Ou aplicar o fator de escala via transform CSS no container principal (mais simples, mas pode afetar o layout)

