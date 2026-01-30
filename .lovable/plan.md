

## Plano: Ajustes Visuais nas Telas de Análise, Dashboard e Sprint

### Resumo das Alterações

| Tela | Alteração |
|------|-----------|
| Análise Trimestral | Barras 2x mais largas + sinalização dos 2 maiores gaps |
| Dashboard (Gauges) | Largura 3x nos gráficos de arco |
| Sprint | Barras 3x + formato de linhas verticais + máximo 3 itens |

---

### 1. Análise Trimestral - Barras 2x Mais Largas

**Arquivo**: `src/components/dashboard/QuarterlyKPIBar.tsx`

Alterar altura da barra de progresso:

```typescript
// Atual
<div className="relative h-scale-1 lg:h-scale-1.5 my-[1px]">

// Novo (2x)
<div className="relative h-scale-2 lg:h-scale-3 my-[1px]">
```

---

### 2. Análise Trimestral - Sinalizar os 2 Maiores Gaps

**Arquivo**: `src/components/dashboard/AnalysisPage.tsx`

Adicionar lógica para identificar os 2 KPIs com maior gap (menor percentage vs ritmo ideal):

```typescript
// Calcular os 2 maiores gaps
const top2Gaps = useMemo(() => {
  const withGap = quarterlyKPIs
    .filter(kpi => kpi.percentage < ritmoIdeal && kpi.target > 0)
    .map(kpi => ({ label: kpi.label, gap: ritmoIdeal - kpi.percentage }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 2)
    .map(g => g.label);
  return new Set(withGap);
}, [quarterlyKPIs, ritmoIdeal]);
```

**Arquivo**: `src/components/dashboard/QuarterlyKPIBar.tsx`

Adicionar prop `isTopGap` e visual de destaque:

```typescript
interface QuarterlyKPIBarProps extends QuarterlyKPI {
  ritmoIdeal: number;
  headName?: string;
  isTopGap?: boolean; // NEW
}

// Visual: borda vermelha pulsante ou ícone de alerta
{isTopGap && (
  <span className="text-red-500 font-bold animate-pulse">⚠️ PRIORIDADE</span>
)}
```

---

### 3. Dashboard - Gauges 3x Mais Largos

**Arquivo**: `src/components/dashboard/GaugeChart.tsx`

Dimensões atuais (2x) → novas (3x):

| Tamanho | Atual (2x) | Novo (3x) |
|---------|------------|-----------|
| sm | 112x64 | 168x96 |
| md | 144x80 | 216x120 |
| lg | 160x90 | 240x135 |
| sm compact | 90x52 | 135x78 |
| md compact | 116x64 | 174x96 |
| lg compact | 128x72 | 192x108 |

```typescript
const dimensions = {
  sm: { width: compact ? 135 : 168, height: compact ? 78 : 96, stroke: compact ? 12 : 15 },
  md: { width: compact ? 174 : 216, height: compact ? 96 : 120, stroke: compact ? 15 : 18 },
  lg: { width: compact ? 192 : 240, height: compact ? 108 : 135, stroke: compact ? 18 : 21 },
};
```

---

### 4. Sprint - Barras 3x Mais Largas + Formato Vertical

**Arquivo**: `src/components/dashboard/SprintKPIBar.tsx`

Barra de progresso atual → barras verticais:

```typescript
// ANTES (barra horizontal)
<div className="relative h-scale-1.5 lg:h-scale-2 w-full rounded-full bg-muted/30">
  <div className="h-full rounded-full" style={{ width: `${progressPercentage}%` }} />
</div>

// DEPOIS (barras verticais estilo gráfico de colunas)
<div className="relative h-scale-6 lg:h-scale-8 w-full flex items-end gap-px bg-muted/10 rounded">
  {/* Barra de Meta (cinza) */}
  <div className="flex-1 bg-muted/30 rounded-t" style={{ height: '100%' }} />
  {/* Barra de Realizado (colorida) */}
  <div 
    className={cn("flex-1 rounded-t", getBarColorClass())} 
    style={{ height: `${Math.min(progressPercentage, 100)}%` }} 
  />
  {/* Indicador de Falta (linha pontilhada) */}
  <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-red-400/50" 
       style={{ top: `${100 - Math.min(progressPercentage, 100)}%` }} />
</div>
```

Altura aumentada 3x:
- Atual: `h-scale-1.5 lg:h-scale-2`
- Novo: `h-scale-6 lg:h-scale-8`

---

### 5. Sprint - Máximo 3 Itens Selecionados

**Arquivo**: `src/components/dashboard/SprintPage.tsx`

Adicionar validação no toggle:

```typescript
const handleProductToggle = (category: string) => {
  const newSet = new Set(selectedProducts);
  
  if (newSet.has(category)) {
    // Sempre pode desmarcar
    newSet.delete(category);
  } else {
    // Só pode marcar se tiver menos de 3
    if (newSet.size < 3) {
      newSet.add(category);
    } else {
      // Feedback visual ou toast informando o limite
      toast.warning("Máximo de 3 itens selecionados");
      return;
    }
  }
  
  onProductToggle(category);
};
```

Adicionar indicador visual do limite:

```tsx
<span className="text-scale-5 text-muted-foreground">
  ({selectedProducts.size}/3)
</span>
```

---

### Arquivos a Modificar

| Arquivo | Alterações |
|---------|-----------|
| `src/components/dashboard/QuarterlyKPIBar.tsx` | Altura 2x + prop isTopGap |
| `src/components/dashboard/AnalysisPage.tsx` | Cálculo dos 2 maiores gaps + passar prop |
| `src/components/dashboard/GaugeChart.tsx` | Dimensões 3x |
| `src/components/dashboard/SprintKPIBar.tsx` | Barras verticais 3x |
| `src/components/dashboard/SprintPage.tsx` | Limite de 3 itens + validação |

---

### Resultado Visual Esperado

**Análise Trimestral**:
- Barras de progresso mais proeminentes (2x altura)
- Os 2 KPIs com maior déficit destacados com badge "⚠️ PRIORIDADE"

**Dashboard**:
- Gráficos de arco 3x maiores para melhor visibilidade em TV

**Sprint**:
- Formato de barras verticais (estilo gráfico de colunas)
- Altura 3x para melhor visualização
- Contador "(2/3)" ao lado dos checkboxes
- Bloqueio ao tentar selecionar mais de 3 produtos

