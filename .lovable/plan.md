

## Plano: Simplificar Sprint Page e Corrigir Overflow

### Problemas Identificados

1. **Remover barra "Sprint Semanal"** - O header grande com estatísticas globais ocupa muito espaço
2. **"Falta por Assessor" atrás do card** - O texto está vazando para fora do card (mesmo problema do QuarterlyKPIBar)

### Diagrama do Problema Atual

```text
┌─────────────────────────────────────────────────────────────────┐
│  SPRINT SEMANAL - MISSÃO: Zerar o gap                          │
│  ┌────────┐ ┌────────┐ ┌────────────┐ ┌────────┐               │  ← REMOVER
│  │Meta    │ │Produzido│ │O QUE FALTA │ │Zerados │               │
│  └────────┘ └────────┘ └────────────┘ └────────┘               │
│  ███████████████████████████████████░░░░░░░░░░░░░░ 65%          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔥 Receita                                                     │
│  ┌────────┬───────────┬─────────┐                              │
│  │ Meta   │ Realizado │ Falta   │                              │
│  └────────┴───────────┴─────────┘                              │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░ 49%                   │
│  Falta por Assessor:                                            │
│  Hingrid -R$ 18.5K | Jose -R$ 12.7K | ...                      │ ← VAZANDO
└─────────────────────────────────────────────────────────────────┘
```

### Solução Proposta

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│  🔥 Receita                                                              49%  │
│  ┌────────────────┬─────────────────┬─────────────────┐                       │
│  │ Meta: R$ 85K   │ Real: R$ 42.3K  │ ⚠ Falta: R$ 42.7K│                      │
│  └────────────────┴─────────────────┴─────────────────┘                       │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                    │
│  Falta: Hingrid -R$ 18.5K | Jose -R$ 12.7K                                   │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/SprintPage.tsx` | **MODIFICAR** - Remover SprintHeader, manter apenas filtros |
| `src/components/dashboard/SprintKPIBar.tsx` | **MODIFICAR** - Adicionar overflow-hidden, compactar layout |

---

### Detalhes Técnicos

#### 1. Remover SprintHeader e Manter Apenas Filtros

**Arquivo: `src/components/dashboard/SprintPage.tsx`**

Remover o componente SprintHeader e adicionar apenas os filtros diretamente:

```tsx
export function SprintPage({ ... }: SprintPageProps) {
  const sortedData = [...sprintData].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    return b.totalRemaining - a.totalRemaining;
  });

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Filtros simples no topo */}
      <div className="flex items-center justify-end gap-2 mb-2 flex-shrink-0">
        <Select value={selectedAssessor} onValueChange={onAssessorChange} disabled={isLocked}>
          <SelectTrigger className="w-[140px] lg:w-[180px] h-8 text-xs lg:text-sm">
            <SelectValue placeholder="Assessor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Assessores</SelectItem>
            {assessors.map((assessor) => (
              <SelectItem key={assessor} value={assessor}>{assessor}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[100px] lg:w-[120px] h-8 text-xs lg:text-sm">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Bars */}
      <div className="flex-1 flex flex-col gap-1 lg:gap-1.5 min-h-0 overflow-hidden">
        {sortedData.map((kpi) => (
          <SprintKPIBar key={kpi.category} data={kpi} evolution={evolutionMap?.get(kpi.category)} />
        ))}
      </div>
    </div>
  );
}
```

#### 2. Corrigir Overflow no SprintKPIBar

**Arquivo: `src/components/dashboard/SprintKPIBar.tsx`**

Aplicar as mesmas correções do QuarterlyKPIBar:

1. **Adicionar `overflow-hidden`** ao container principal
2. **Reduzir padding e margens** 
3. **Compactar seção de valores** - Meta/Realizado/Falta em uma linha mais compacta
4. **Mover "Falta por Assessor"** para a mesma linha de valores ou reduzi-lo

**Estrutura nova do card:**

```tsx
<div className="p-2 lg:p-3 bg-card rounded-lg border border-border flex-1 flex flex-col min-h-0 overflow-hidden">
  {/* Header: Icon + Label + Percentage */}
  <div className="flex items-center justify-between mb-1">
    <div className="flex items-center gap-2">
      {getUrgencyIcon(progressPercentage, isCompleted)}
      <span className="text-xs lg:text-sm font-semibold text-foreground truncate">{label}</span>
    </div>
    <span className={cn("font-bold text-sm lg:text-base", isCompleted ? "text-green-500" : progressPercentage >= 50 ? "text-eclat-gold" : "text-destructive")}>
      {Math.round(progressPercentage)}%
    </span>
  </div>

  {/* Compact Values Row: Meta | Realizado | Falta */}
  <div className="grid grid-cols-3 gap-1 mb-1 text-center text-[9px] lg:text-[10px]">
    <div>
      <span className="text-muted-foreground">Meta: </span>
      <span className="font-medium text-foreground">{formatValue(totalTarget, isCurrency)}</span>
    </div>
    <div>
      <span className="text-muted-foreground">Real: </span>
      <span className="font-medium text-green-500">{formatValue(totalRealized, isCurrency)}</span>
    </div>
    <div className={cn(isCompleted ? "text-green-500" : "text-destructive font-bold")}>
      {isCompleted ? "✓ Zerado" : `Falta: ${formatValue(totalRemaining, isCurrency)}`}
    </div>
  </div>

  {/* Progress Bar */}
  <div className="relative h-3 lg:h-4 w-full rounded-full bg-muted/30 overflow-hidden mb-1">
    <div className={cn("h-full rounded-full transition-all duration-500", getBarColorClass())}
         style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
  </div>

  {/* Assessor Breakdown - compact, single line */}
  {assessorBreakdown.length > 0 && (
    <div className="flex flex-wrap gap-x-2 text-[9px] lg:text-[10px] text-muted-foreground truncate">
      <span className="font-medium">Falta:</span>
      {assessorBreakdown.slice(0, 4).map((a, i) => (
        <span key={i}>{a.name} -{formatValue(a.remaining, isCurrency)}</span>
      ))}
      {assessorBreakdown.length > 4 && <span>+{assessorBreakdown.length - 4}</span>}
    </div>
  )}
</div>
```

---

### Comparação Visual

**Antes:**
```text
┌────────────────────────────────────────────┐
│        SPRINT SEMANAL HEADER               │  ← GRANDE, ocupando espaço
│  [Meta] [Produzido] [Falta] [Zerados]     │
│  ████████████████████████░░░░░░░░ 65%      │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│ 🔥 Receita                                 │
│ ┌───────┬───────────┬─────────┐           │
│ │ Meta  │ Realizado │ Falta   │           │
│ └───────┴───────────┴─────────┘           │  ← Cards com margem excessiva
│ ██████████████████░░░░░░░░░░░ 49%          │
│ Falta por Assessor:                        │
│ Hingrid -R$ 18.5K | Jose -R$ 12.7K        │ ← VAZANDO
└────────────────────────────────────────────┘
```

**Depois:**
```text
         [Assessor ▼] [Mês ▼]                  ← Filtros compactos apenas
┌────────────────────────────────────────────┐
│ 🔥 Receita                           49%   │ ← Header com %
│ Meta: R$85K | Real: R$42K | Falta: R$43K  │ ← Valores em 1 linha
│ ████████████████████░░░░░░░░░░░░░░░░░░    │ ← Barra
│ Falta: Hingrid -18.5K | Jose -12.7K +2    │ ← Assessores compacto
└────────────────────────────────────────────┘
```

---

### Benefícios

1. **Mais espaço para KPIs** - Sem header grande, cabem mais barras na tela
2. **Sem overflow** - `overflow-hidden` e layout compacto garantem que tudo fica dentro
3. **Informação preservada** - Mesmos dados, só mais compactos
4. **Consistência** - Mesmo estilo visual do QuarterlyKPIBar

