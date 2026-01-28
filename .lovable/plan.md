
## Plano: Reduzir Todos os Tamanhos em 50%

### Objetivo

Aplicar uma redução de 50% em **todos** os tamanhos fixos do projeto:
- Tipografia (fontes)
- Gaps (espaçamentos)
- Paddings e margins
- Alturas de barras
- Tamanhos de ícones
- Dimensões dos gauges (largura, altura, stroke)

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/index.css` | Reduzir todas as classes fixas em 50% |
| `src/components/dashboard/GaugeChart.tsx` | Reduzir dimensões dos gauges em 50% |
| `src/components/dashboard/ICMCard.tsx` | Reduzir dimensões do gauge em 50% |
| `src/components/dashboard/YearlyGaugeChart.tsx` | Reduzir dimensões em 50% |
| `src/components/dashboard/YearlyICMCard.tsx` | Reduzir dimensões em 50% |

---

### Novos Valores (50% dos atuais)

#### Tipografia

| Classe | Valor Atual | Novo Valor (50%) |
|--------|-------------|------------------|
| `text-responsive-4xs` | `11px` | `6px` |
| `text-responsive-3xs` | `10px` | `5px` |
| `text-responsive-2xs` | `11px` | `6px` |
| `text-responsive-xs` | `12px` | `6px` |
| `text-responsive-sm` | `14px` | `7px` |
| `text-responsive-base` | `16px` | `8px` |
| `text-responsive-lg` | `20px` | `10px` |
| `text-responsive-xl` | `24px` | `12px` |
| `text-responsive-2xl` | `28px` | `14px` |
| `text-responsive-3xl` | `34px` | `17px` |
| `text-responsive-4xl` | `40px` | `20px` |

#### Tipografia TV Mode

| Classe | Valor Atual | Novo Valor (50%) |
|--------|-------------|------------------|
| `text-tv-3xs` | `12px` | `6px` |
| `text-tv-2xs` | `14px` | `7px` |
| `text-tv-xs` | `16px` | `8px` |
| `text-tv-sm` | `20px` | `10px` |
| `text-tv-base` | `24px` | `12px` |
| `text-tv-lg` | `28px` | `14px` |
| `text-tv-xl` | `32px` | `16px` |
| `text-tv-2xl` | `40px` | `20px` |

#### Gaps

| Classe | Valor Atual | Novo Valor (50%) |
|--------|-------------|------------------|
| `gap-responsive-sm` | `4px` | `2px` |
| `gap-responsive` | `6px` | `3px` |
| `gap-responsive-lg` | `12px` | `6px` |

#### Paddings e Margins

| Classe | Valor Atual | Novo Valor (50%) |
|--------|-------------|------------------|
| `p-responsive-sm` | `4px` | `2px` |
| `p-responsive` | `8px` | `4px` |
| `p-responsive-lg` | `12px` | `6px` |
| `px-responsive` | `8px` | `4px` |
| `py-responsive` | `4px` | `2px` |
| `py-responsive-sm` | `2px` | `1px` |
| `mb-responsive` | `4px` | `2px` |
| `mt-responsive` | `4px` | `2px` |

#### Alturas de Barras

| Classe | Valor Atual | Novo Valor (50%) |
|--------|-------------|------------------|
| `h-bar-responsive-sm` | `6px` | `3px` |
| `h-bar-responsive` | `9px` | `5px` |
| `h-bar-responsive-lg` | `12px` | `6px` |

#### Tamanhos de Ícones

| Classe | Valor Atual | Novo Valor (50%) |
|--------|-------------|------------------|
| `icon-responsive-sm` | `16px` | `8px` |
| `icon-responsive` | `20px` | `10px` |
| `icon-responsive-lg` | `28px` | `14px` |

---

### Dimensões dos Gauges (50% dos atuais)

#### GaugeChart.tsx

**Normal mode:**
| Tamanho | Atual | Novo (50%) |
|---------|-------|------------|
| `sm` | `112×64, stroke 10` | `56×32, stroke 5` |
| `md` | `144×80, stroke 12` | `72×40, stroke 6` |
| `lg` | `160×90, stroke 14` | `80×45, stroke 7` |

**Compact mode:**
| Tamanho | Atual | Novo (50%) |
|---------|-------|------------|
| `sm` | `90×52, stroke 8` | `45×26, stroke 4` |
| `md` | `115×64, stroke 10` | `58×32, stroke 5` |
| `lg` | `128×72, stroke 11` | `64×36, stroke 6` |

#### ICMCard.tsx

| Propriedade | Atual | Novo (50%) |
|-------------|-------|------------|
| `gaugeWidth` | `140px` | `70px` |
| `gaugeHeight` | `80px` | `40px` |
| `gaugeRadius` | `60px` | `30px` |
| `strokeWidth` | `12px` | `6px` |
| `triangleSize` | `4px` | `2px` |

#### YearlyGaugeChart.tsx

| Tamanho | Atual | Novo (50%) |
|---------|-------|------------|
| `sm` | `112×63, stroke 7` | `56×32, stroke 4` |
| `md` | `144×81, stroke 9` | `72×41, stroke 5` |
| `lg` | `176×99, stroke 11` | `88×50, stroke 6` |

#### YearlyICMCard.tsx

| Propriedade | Atual | Novo (50%) |
|-------------|-------|------------|
| `gaugeWidth` | `180px` | `90px` |
| `gaugeHeight` | `100px` | `50px` |
| `gaugeRadius` | `80px` | `40px` |
| `strokeWidth` | `14px` | `7px` |

---

### Código CSS Atualizado (index.css)

```css
/* Fixed typography - 50% reduction */
.text-responsive-4xs { font-size: 6px; }
.text-responsive-3xs { font-size: 5px; }
.text-responsive-2xs { font-size: 6px; }
.text-responsive-xs { font-size: 6px; }
.text-responsive-sm { font-size: 7px; }
.text-responsive-base { font-size: 8px; }
.text-responsive-lg { font-size: 10px; }
.text-responsive-xl { font-size: 12px; }
.text-responsive-2xl { font-size: 14px; }
.text-responsive-3xl { font-size: 17px; }
.text-responsive-4xl { font-size: 20px; }

/* TV Mode - 50% reduction */
.text-tv-3xs { font-size: 6px; }
.text-tv-2xs { font-size: 7px; }
.text-tv-xs { font-size: 8px; }
.text-tv-sm { font-size: 10px; }
.text-tv-base { font-size: 12px; }
.text-tv-lg { font-size: 14px; }
.text-tv-xl { font-size: 16px; }
.text-tv-2xl { font-size: 20px; }

/* Fixed gaps - 50% reduction */
.gap-responsive-sm { gap: 2px; }
.gap-responsive { gap: 3px; }
.gap-responsive-lg { gap: 6px; }

/* Fixed padding/margin - 50% reduction */
.p-responsive-sm { padding: 2px; }
.p-responsive { padding: 4px; }
.p-responsive-lg { padding: 6px; }
.px-responsive { padding-left: 4px; padding-right: 4px; }
.py-responsive { padding-top: 2px; padding-bottom: 2px; }
.py-responsive-sm { padding-top: 1px; padding-bottom: 1px; }
.mb-responsive { margin-bottom: 2px; }
.mt-responsive { margin-top: 2px; }

/* Fixed bar heights - 50% reduction */
.h-bar-responsive-sm { height: 3px; }
.h-bar-responsive { height: 5px; }
.h-bar-responsive-lg { height: 6px; }

/* Fixed icon sizes - 50% reduction */
.icon-responsive-sm { width: 8px; height: 8px; }
.icon-responsive { width: 10px; height: 10px; }
.icon-responsive-lg { width: 14px; height: 14px; }
```

---

### Código dos Gauges Atualizado

#### GaugeChart.tsx (dimensões)

```tsx
const dimensions = {
  sm: { width: compact ? 45 : 56, height: compact ? 26 : 32, stroke: compact ? 4 : 5 },
  md: { width: compact ? 58 : 72, height: compact ? 32 : 40, stroke: compact ? 5 : 6 },
  lg: { width: compact ? 64 : 80, height: compact ? 36 : 45, stroke: compact ? 6 : 7 },
};
```

#### ICMCard.tsx (dimensões)

```tsx
const gaugeWidth = 70;
const gaugeHeight = 40;
const gaugeRadius = 30;
const strokeWidth = 6;
const triangleSize = 2;
```

#### YearlyGaugeChart.tsx (dimensões)

```tsx
const dimensions = {
  sm: { width: 56, height: 32, stroke: 4 },
  md: { width: 72, height: 41, stroke: 5 },
  lg: { width: 88, height: 50, stroke: 6 },
};
```

#### YearlyICMCard.tsx (dimensões)

```tsx
const gaugeWidth = 90;
const gaugeHeight = 50;
const gaugeRadius = 40;
const strokeWidth = 7;
```

---

### Resultado Esperado

Após as alterações:
- Todos os elementos visuais terão **metade do tamanho** atual
- Layout permanece proporcional e centralizado
- Mais espaço livre dentro dos cards
- Texto pode ficar pequeno demais para leitura confortável (ajuste futuro possível)

---

### Aviso

Uma redução de 50% pode tornar textos com `5px` ou `6px` **praticamente ilegíveis**. Se necessário, podemos ajustar valores mínimos após visualização.
