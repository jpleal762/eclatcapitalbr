
## Plano: Layout Fixo com Tamanhos Travados (Sem Responsividade Dinâmica)

### Objetivo

Remover o sistema de tamanhos responsivos baseados em `clamp()` e `vh` e substituir por **valores fixos em pixels**. Isso inclui:
1. Fontes de texto e números com tamanhos fixos
2. Gauges com dimensões fixas e centralizados nos cards
3. Gaps e paddings com valores fixos
4. Ícones com tamanhos fixos

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/index.css` | Substituir classes `text-responsive-*`, `gap-responsive-*`, `p-responsive-*`, `icon-responsive-*` por valores fixos em pixels |
| `src/components/dashboard/GaugeChart.tsx` | Remover `useResponsiveSize()`, usar dimensões fixas, centralizar gauge |
| `src/components/dashboard/ICMCard.tsx` | Remover `useResponsiveSize()`, usar dimensões fixas para o gauge |
| `src/components/dashboard/YearlyGaugeChart.tsx` | Remover `useResponsiveSize()`, usar dimensões fixas |
| `src/components/dashboard/YearlyICMCard.tsx` | Remover `useResponsiveSize()`, usar dimensões fixas |
| `src/components/dashboard/FlipGaugeChart.tsx` | Garantir centralização do gauge |
| `src/components/dashboard/AgendadasCard.tsx` | Usar fontes fixas |
| `src/components/dashboard/FlipICMCard.tsx` | Usar fontes fixas |
| `src/components/dashboard/FlipMetaTable.tsx` | Usar fontes fixas |
| `src/components/dashboard/AssessorChart.tsx` | Usar fontes fixas |
| `src/hooks/use-responsive-size.tsx` | Pode ser mantido mas não será mais usado para escala dinâmica |

---

### Valores Fixos Propostos

#### Tipografia (substituindo classes responsivas)

| Classe Atual | Valor Responsivo | Novo Valor Fixo |
|--------------|------------------|-----------------|
| `text-responsive-4xs` | `clamp(13px, 1.4vh, 20px)` | `11px` |
| `text-responsive-3xs` | `clamp(9px, 1.0vh, 14px)` | `10px` |
| `text-responsive-2xs` | `clamp(10px, 1.2vh, 16px)` | `11px` |
| `text-responsive-xs` | `clamp(12px, 1.4vh, 20px)` | `12px` |
| `text-responsive-sm` | `clamp(14px, 1.6vh, 24px)` | `14px` |
| `text-responsive-base` | `clamp(16px, 1.9vh, 28px)` | `16px` |
| `text-responsive-lg` | `clamp(20px, 2.4vh, 36px)` | `20px` |
| `text-responsive-xl` | `clamp(24px, 3vh, 44px)` | `24px` |
| `text-responsive-2xl` | `clamp(28px, 3.5vh, 52px)` | `28px` |
| `text-responsive-3xl` | `clamp(34px, 4.2vh, 60px)` | `34px` |
| `text-responsive-4xl` | `clamp(40px, 5vh, 72px)` | `40px` |

#### Gaps (substituindo classes responsivas)

| Classe Atual | Valor Responsivo | Novo Valor Fixo |
|--------------|------------------|-----------------|
| `gap-responsive-sm` | `clamp(4px, 0.5vh, 10px)` | `4px` |
| `gap-responsive` | `clamp(6px, 0.8vh, 14px)` | `6px` |
| `gap-responsive-lg` | `clamp(12px, 1.4vh, 24px)` | `12px` |

#### Paddings (substituindo classes responsivas)

| Classe Atual | Valor Responsivo | Novo Valor Fixo |
|--------------|------------------|-----------------|
| `p-responsive-sm` | `clamp(4px, 0.5vh, 10px)` | `4px` |
| `p-responsive` | `clamp(8px, 1vh, 16px)` | `8px` |
| `p-responsive-lg` | `clamp(12px, 1.5vh, 24px)` | `12px` |
| `px-responsive` | `clamp(8px, 1vh, 16px)` | `8px` |
| `py-responsive` | `clamp(4px, 0.5vh, 10px)` | `4px` |
| `py-responsive-sm` | `clamp(2px, 0.3vh, 6px)` | `2px` |
| `mb-responsive` | `clamp(4px, 0.5vh, 10px)` | `4px` |
| `mt-responsive` | `clamp(4px, 0.5vh, 10px)` | `4px` |

#### Barras (substituindo classes responsivas)

| Classe Atual | Valor Responsivo | Novo Valor Fixo |
|--------------|------------------|-----------------|
| `h-bar-responsive-sm` | `clamp(6px, 0.75vh, 12px)` | `6px` |
| `h-bar-responsive` | `clamp(9px, 1.05vh, 18px)` | `9px` |
| `h-bar-responsive-lg` | `clamp(12px, 1.5vh, 24px)` | `12px` |

#### Ícones (substituindo classes responsivas)

| Classe Atual | Valor Responsivo | Novo Valor Fixo |
|--------------|------------------|-----------------|
| `icon-responsive-sm` | `clamp(16px, 1.8vh, 26px)` | `16px` |
| `icon-responsive` | `clamp(20px, 2.4vh, 34px)` | `20px` |
| `icon-responsive-lg` | `clamp(28px, 3vh, 44px)` | `28px` |

---

### Dimensões Fixas dos Gauges

#### GaugeChart.tsx (Gauge Principal)

| Tamanho | Largura | Altura | Stroke |
|---------|---------|--------|--------|
| `sm` | `112px` | `64px` | `10px` |
| `md` | `144px` | `80px` | `12px` |
| `lg` | `160px` | `90px` | `14px` |

**Compact mode** (para espaços menores):
| Tamanho | Largura | Altura | Stroke |
|---------|---------|--------|--------|
| `sm` | `90px` | `52px` | `8px` |
| `md` | `115px` | `64px` | `10px` |
| `lg` | `128px` | `72px` | `11px` |

#### ICMCard.tsx (Gauge ICM)

| Propriedade | Valor Fixo |
|-------------|------------|
| Largura | `140px` |
| Altura | `80px` |
| Raio | `60px` |
| Stroke | `12px` |

#### YearlyGaugeChart.tsx

| Tamanho | Largura | Altura | Stroke |
|---------|---------|--------|--------|
| `sm` | `112px` | `63px` | `7px` |
| `md` | `144px` | `81px` | `9px` |
| `lg` | `176px` | `99px` | `11px` |

#### YearlyICMCard.tsx

| Propriedade | Valor Fixo |
|-------------|------------|
| Largura | `180px` |
| Altura | `100px` |
| Raio | `80px` |
| Stroke | `14px` |

---

### Centralização dos Gauges

Em todos os componentes de gauge, o SVG será centralizado com:

```tsx
<div className="flex flex-col items-center justify-center flex-1 min-h-0">
  {/* Gauge SVG */}
  <div className="relative" style={{ width: FIXED_WIDTH, height: FIXED_HEIGHT }}>
    <svg ... />
  </div>
</div>
```

A estrutura garante:
- `items-center` → centralização horizontal
- `justify-center` → centralização vertical
- `flex-1 min-h-0` → ocupa espaço disponível sem crescer além

---

### Mudanças nos Componentes

#### 1. GaugeChart.tsx

```tsx
// ANTES
const { scale } = useResponsiveSize();
const baseMultiplier = size === "sm" ? 0.7 : size === "md" ? 0.9 : 1.1;
const dynamicScale = Math.max(0.5, Math.min(scale * baseMultiplier * compactFactor, maxScale));
const dynamicWidth = Math.round(baseWidth * dynamicScale);

// DEPOIS
const dimensions = {
  sm: { width: compact ? 90 : 112, height: compact ? 52 : 64, stroke: compact ? 8 : 10 },
  md: { width: compact ? 115 : 144, height: compact ? 64 : 80, stroke: compact ? 10 : 12 },
  lg: { width: compact ? 128 : 160, height: compact ? 72 : 90, stroke: compact ? 11 : 14 },
};
const { width, height, stroke } = dimensions[size];
```

#### 2. ICMCard.tsx

```tsx
// ANTES
const { scale } = useResponsiveSize();
const dynamicScale = Math.max(0.7, Math.min(scale * 1.1, 1.6));
const gaugeWidth = Math.round(140 * dynamicScale);

// DEPOIS
const gaugeWidth = 140;
const gaugeHeight = 80;
const gaugeRadius = 60;
const strokeWidth = 12;
```

#### 3. YearlyGaugeChart.tsx e YearlyICMCard.tsx

Mesma lógica: remover `useResponsiveSize()` e usar valores fixos.

---

### index.css - Novas Classes Fixas

```css
/* Fixed typography */
.text-responsive-4xs { font-size: 11px; }
.text-responsive-3xs { font-size: 10px; }
.text-responsive-2xs { font-size: 11px; }
.text-responsive-xs { font-size: 12px; }
.text-responsive-sm { font-size: 14px; }
.text-responsive-base { font-size: 16px; }
.text-responsive-lg { font-size: 20px; }
.text-responsive-xl { font-size: 24px; }
.text-responsive-2xl { font-size: 28px; }
.text-responsive-3xl { font-size: 34px; }
.text-responsive-4xl { font-size: 40px; }

/* Fixed gaps */
.gap-responsive-sm { gap: 4px; }
.gap-responsive { gap: 6px; }
.gap-responsive-lg { gap: 12px; }

/* Fixed padding */
.p-responsive-sm { padding: 4px; }
.p-responsive { padding: 8px; }
.p-responsive-lg { padding: 12px; }
.px-responsive { padding-left: 8px; padding-right: 8px; }
.py-responsive { padding-top: 4px; padding-bottom: 4px; }
.py-responsive-sm { padding-top: 2px; padding-bottom: 2px; }
.mb-responsive { margin-bottom: 4px; }
.mt-responsive { margin-top: 4px; }

/* Fixed bar heights */
.h-bar-responsive-sm { height: 6px; }
.h-bar-responsive { height: 9px; }
.h-bar-responsive-lg { height: 12px; }

/* Fixed icon sizes */
.icon-responsive-sm { width: 16px; height: 16px; }
.icon-responsive { width: 20px; height: 20px; }
.icon-responsive-lg { width: 28px; height: 28px; }
```

---

### Resultado Esperado

1. **Layout consistente** - Tamanhos não mudam com resize da janela
2. **Gauges centralizados** - Todos os gauges perfeitamente centralizados H+V nos cards
3. **Fontes legíveis** - Tamanhos fixos otimizados para a proporção atual
4. **Performance melhorada** - Sem recálculos de escala em tempo real
5. **Previsibilidade** - O que você vê é o que você obtém, independente da tela

---

### Notas Importantes

- O layout `flex-[45]` / `flex-[55]` para as linhas será mantido (proporções de altura)
- O `overflow-hidden` continua garantindo que nada vaze para fora dos containers
- Mobile continua com scroll vertical (comportamento separado via `mobile-view-container`)
- As dimensões foram escolhidas baseadas na tela atual (proporção ~16:9)
