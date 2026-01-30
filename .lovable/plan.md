

## Plano: Modo TV 55" com Zoom Proporcional

### Conceito

Em vez de escalar elementos individuais (que pode causar desalinhamentos), vamos usar **CSS transform: scale()** no container principal. Isso funciona como o zoom do navegador - mantém o layout exatamente igual, apenas maior.

---

### Como Funciona

| Abordagem | Comportamento | Risco de Quebra |
|-----------|---------------|-----------------|
| Escala por elemento (atual) | Cada texto/ícone escala individualmente | Médio - gaps e alinhamentos podem quebrar |
| Transform scale (proposta) | Todo o container escala como bloco | Zero - é literalmente um zoom |

---

### Implementação

#### 1. Novo Modo "TV 55\"" no ScaleSelector

Adicionar opção especial que ativa o zoom de container:

```
1x, 1.25x, 1.5x, 1.75x, 2x, [TV 55" - ícone de monitor]
```

#### 2. ScaleContext - Nova Flag para Modo TV

```typescript
type ScaleFactor = 1 | 1.25 | 1.5 | 1.75 | 2 | "tv55";

// Quando "tv55", aplica transform: scale() no container
```

#### 3. Container Principal com Transform

No `Index.tsx`, envolver o conteúdo em um container escalável:

```tsx
<main className="flex-1 overflow-hidden">
  <div 
    className={cn(
      "h-full w-full origin-top-left",
      scaleFactor === "tv55" && "tv-scale-container"
    )}
    style={scaleFactor === "tv55" ? {
      transform: "scale(1.5)", // Escala para TV
      width: "66.67%",         // Compensa a escala (100/1.5)
      height: "66.67%"
    } : undefined}
  >
    {/* Todo o dashboard aqui */}
  </div>
</main>
```

#### 4. Cálculo Automático da Escala

Para TVs 55" (tipicamente 3840x2160 4K ou 1920x1080):

| Resolução TV | Resolução Base | Fator de Escala |
|--------------|----------------|-----------------|
| 3840x2160 (4K) | 1920x1080 | 2.0x |
| 1920x1080 (FHD) | 1920x1080 | 1.5x (para melhor leitura) |

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/ScaleContext.tsx` | Adicionar tipo "tv55" e lógica de detecção |
| `src/components/ScaleSelector.tsx` | Adicionar opção "TV 55\"" com ícone Monitor |
| `src/pages/Index.tsx` | Aplicar transform: scale() quando modo TV ativo |
| `src/index.css` | Classe auxiliar `.tv-scale-container` |

---

### Detalhes Técnicos

#### ScaleContext.tsx

```typescript
type ScaleFactor = 1 | 1.25 | 1.5 | 1.75 | 2 | "tv55";

// Função para calcular escala do TV baseado na viewport
const getTVScale = () => {
  const width = window.innerWidth;
  if (width >= 3840) return 2.0;  // 4K
  if (width >= 2560) return 1.75; // QHD
  return 1.5; // FHD ou menor
};
```

#### ScaleSelector.tsx

```tsx
const SCALE_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 1.75, label: "1.75x" },
  { value: 2, label: "2x" },
  { value: "tv55", label: "TV 55\"", icon: Monitor },
];
```

#### Index.tsx - Container Escalável

```tsx
const { scaleFactor } = useScale();

// Calcular escala real para TV
const tvScale = useMemo(() => {
  if (scaleFactor !== "tv55") return 1;
  const width = window.innerWidth;
  if (width >= 3840) return 2.0;
  if (width >= 2560) return 1.75;
  return 1.5;
}, [scaleFactor]);

const isTV = scaleFactor === "tv55";

// No JSX:
<main className="flex-1 overflow-hidden">
  <div 
    style={isTV ? {
      transform: `scale(${tvScale})`,
      transformOrigin: "top left",
      width: `${100 / tvScale}%`,
      height: `${100 / tvScale}%`,
    } : undefined}
  >
    {/* Dashboard content */}
  </div>
</main>
```

---

### Resultado Esperado

**Comportamento no computador (1920x1080)**:
- Layout normal, sem alterações

**Comportamento na TV 55" (FHD)**:
- Todo o dashboard escalado 1.5x
- Layout idêntico ao computador, apenas maior
- Zero sobreposições ou quebras

**Comportamento na TV 55" (4K)**:
- Todo o dashboard escalado 2x
- Aproveitamento total da resolução
- Textos e gráficos perfeitamente legíveis

---

### Vantagem desta Abordagem

1. **Zero risco de quebra** - É literalmente um zoom do navegador
2. **Proporcional** - Tudo escala junto (textos, gaps, ícones, mascotes)
3. **Automático** - Detecta a resolução da TV e ajusta
4. **Reversível** - Basta trocar de volta para 1x

