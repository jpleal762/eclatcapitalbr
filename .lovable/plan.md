
## Plano: Aumentar Fonte dos Cards Flip e Adicionar Opção 1.75x

### Objetivo

1. Aumentar o tamanho da fonte nos cards pequenos que viram (especialmente o FlipGaugeChart)
2. Adicionar a opção 1.75x no seletor de escala

---

### Problema Identificado

O **FlipGaugeChart** (verso dos gráficos pequenos) usa tamanhos de fonte fixos muito pequenos:
- Título do verso: `text-[5px]`
- Ícone de rotação: `w-[5px] h-[5px]`
- Lista de assessores: `text-[5px]`

Esses valores não usam as classes `text-responsive-*` que escalam com `--scale-factor`.

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/ScaleContext.tsx` | Adicionar 1.75 ao tipo ScaleFactor |
| `src/components/ScaleSelector.tsx` | Adicionar opção 1.75x no dropdown |
| `src/components/dashboard/FlipGaugeChart.tsx` | Substituir tamanhos fixos por classes responsivas |

---

### Detalhamento Técnico

#### 1. ScaleContext.tsx - Adicionar 1.75

```tsx
// ANTES (linha 3)
type ScaleFactor = 1 | 1.25 | 1.5 | 2;

// DEPOIS
type ScaleFactor = 1 | 1.25 | 1.5 | 1.75 | 2;

// ANTES (linha 19)
if (parsed === 1 || parsed === 1.25 || parsed === 1.5 || parsed === 2) {

// DEPOIS
if (parsed === 1 || parsed === 1.25 || parsed === 1.5 || parsed === 1.75 || parsed === 2) {
```

#### 2. ScaleSelector.tsx - Adicionar opção 1.75x

```tsx
// ANTES (linhas 12-17)
const SCALE_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 2, label: "2x" },
] as const;

// DEPOIS
const SCALE_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 1.75, label: "1.75x" },
  { value: 2, label: "2x" },
] as const;

// ANTES (linha 34)
onClick={() => setScaleFactor(option.value as 1 | 1.25 | 1.5 | 2)}

// DEPOIS
onClick={() => setScaleFactor(option.value as 1 | 1.25 | 1.5 | 1.75 | 2)}
```

#### 3. FlipGaugeChart.tsx - Aumentar fontes do verso

Substituir tamanhos fixos (`text-[5px]`) por classes responsivas que escalam:

```tsx
// ANTES (linha 111)
<h4 className="font-semibold text-[5px] text-foreground">

// DEPOIS - usando text-responsive-2xs (6px * scale)
<h4 className="font-semibold text-responsive-2xs text-foreground">

// ANTES (linha 115)
<RotateCcw className="w-[5px] h-[5px] text-muted-foreground" />

// DEPOIS
<RotateCcw className="icon-responsive-sm text-muted-foreground" />

// ANTES (linha 126)
className="flex items-center justify-between text-[5px] py-0"

// DEPOIS
className="flex items-center justify-between text-responsive-2xs py-0"

// ANTES (linha 137)
<p className="text-[5px] text-muted-foreground italic text-center py-0.5">

// DEPOIS
<p className="text-responsive-2xs text-muted-foreground italic text-center py-0.5">
```

---

### Comparação de Tamanhos (FlipGaugeChart verso)

| Elemento | Antes | Depois (base) | Depois (2x) |
|----------|-------|---------------|-------------|
| Título | 5px fixo | 6px | 12px |
| Lista | 5px fixo | 6px | 12px |
| Ícone | 5x5px | 8x8px | 16x16px |

---

### Escala Completa Após Alteração

| Seleção | Multiplicador |
|---------|---------------|
| 1x | 1.0 |
| 1.25x | 1.25 |
| 1.5x | 1.5 |
| **1.75x** | **1.75** (nova) |
| 2x | 2.0 |

---

### Resultado Esperado

- Opção 1.75x aparece no dropdown de escala entre 1.5x e 2x
- Fontes do verso do FlipGaugeChart (lista "Falta por Assessor") ficam maiores e escalam com o seletor
- Todos os cards pequenos que viram terão texto legível mesmo em telas grandes
