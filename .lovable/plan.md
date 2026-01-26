

## Plano: Ajustar Histórico para Usar Mês Atual e Melhorar Layout Visual

### Problema Identificado

Atualmente o histórico é calculado a partir do **mês selecionado** no filtro. O correto é usar o **mês atual do sistema** como referência e mostrar os dois meses anteriores a ele, independente do mês selecionado no filtro.

### Alterações Visuais

O layout atual está muito comprimido em uma única linha. Vamos reorganizar para ficar mais claro:

```text
LAYOUT ATUAL (confuso):
┌──────────────────────────────────────────────────────────┐
│  📊 NOV: 85% │ DEZ: 92% │ JAN: 72%                      │
└──────────────────────────────────────────────────────────┘

LAYOUT NOVO (organizado):
┌──────────────────────────────────────────────────────────┐
│  📊 Histórico                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│  │   NOV   │  │   DEZ   │  │   JAN   │  ← mês atual     │
│  │   85%   │  │   92%   │  │   72%   │    em destaque   │
│  └─────────┘  └─────────┘  └─────────┘                  │
└──────────────────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/kpiUtils.ts` | **MODIFICAR** - Usar mês atual do sistema como referência |
| `src/components/dashboard/ICMCard.tsx` | **MODIFICAR** - Melhorar layout visual do histórico |
| `src/pages/Index.tsx` | **MODIFICAR** - Ajustar cálculo para usar mês atual |

---

### Detalhes Técnicos

#### 1. Modificar kpiUtils.ts - Nova função para obter mês atual formatado

```typescript
/**
 * Get the current month in the format used by the data (e.g., "jan-26")
 */
export function getCurrentMonthFormatted(): string {
  const now = new Date();
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${monthNames[now.getMonth()]}-${now.getFullYear().toString().slice(-2)}`;
}

/**
 * Get the previous N months from the CURRENT month (not selected month)
 * @param availableMonths - Array of available months in the data
 * @param count - Number of previous months to get (default: 2)
 * @returns Array of previous month strings in chronological order, plus current month
 */
export function getHistoricalMonthsFromCurrent(
  availableMonths: string[], 
  count: number = 2
): string[] {
  const currentMonth = getCurrentMonthFormatted();
  
  if (availableMonths.length === 0) return [];
  
  const normalizeMonth = (m: string) => m.toLowerCase().replace("-", "/");
  const normalizedCurrent = normalizeMonth(currentMonth);
  
  const currentIndex = availableMonths.findIndex(m => 
    normalizeMonth(m) === normalizedCurrent
  );
  
  if (currentIndex === -1) {
    // Current month not in data, use most recent available
    const lastMonth = availableMonths[availableMonths.length - 1];
    const lastIndex = availableMonths.length - 1;
    const result: string[] = [];
    for (let i = count; i >= 1 && lastIndex - i >= 0; i--) {
      result.push(availableMonths[lastIndex - i]);
    }
    result.push(lastMonth);
    return result;
  }
  
  // Get previous months + current month
  const result: string[] = [];
  for (let i = count; i >= 1 && currentIndex - i >= 0; i--) {
    result.push(availableMonths[currentIndex - i]);
  }
  result.push(availableMonths[currentIndex]);
  
  return result;
}

/**
 * Calculate historical ICM data for a specific assessor based on CURRENT month
 */
export function getAssessorHistoricalICMFromCurrent(
  data: ProcessedKPI[],
  assessor: string,
  availableMonths: string[],
  count: number = 2
): HistoricalICMData[] {
  if (assessor === "all" || !assessor) return [];
  
  const historicalMonths = getHistoricalMonthsFromCurrent(availableMonths, count);
  if (historicalMonths.length === 0) return [];
  
  const assessorData = filterByAssessor(data, assessor);
  
  return historicalMonths.map((month, idx) => ({
    month: month.toUpperCase().split("/")[0].split("-")[0],
    icmGeral: calculateICMGeral(assessorData, month),
    isCurrent: idx === historicalMonths.length - 1
  }));
}
```

#### 2. Atualizar Interface HistoricalICMData

```typescript
export interface HistoricalICMData {
  month: string;
  icmGeral: number;
  isCurrent?: boolean;
}
```

#### 3. Modificar ICMCard.tsx - Novo Layout Visual

```tsx
{/* Historical Performance - only when specific assessor is selected */}
{selectedAssessor !== "all" && historicalData && historicalData.length > 0 && (
  <div className="flex flex-col items-center py-1.5 px-2 bg-muted/30 rounded-md flex-shrink-0">
    <span className="text-responsive-4xs text-muted-foreground mb-1">Histórico ICM</span>
    <div className="flex items-center justify-center gap-3">
      {historicalData.map((data, idx) => (
        <div 
          key={data.month} 
          className={`flex flex-col items-center px-2 py-0.5 rounded ${
            data.isCurrent 
              ? 'bg-primary/10 border border-primary/30' 
              : ''
          }`}
        >
          <span className="text-responsive-4xs text-muted-foreground uppercase">
            {data.month}
          </span>
          <span 
            className={`text-responsive-sm font-bold ${
              data.isCurrent 
                ? 'text-primary' 
                : 'text-foreground'
            }`}
          >
            {data.icmGeral}%
          </span>
        </div>
      ))}
    </div>
  </div>
)}
```

#### 4. Modificar Index.tsx - Usar nova função

```typescript
import { 
  // ... imports existentes
  getAssessorHistoricalICMFromCurrent,
} from "@/lib/kpiUtils";

// Substituir:
const assessorHistoricalICM = useMemo(
  () => getAssessorHistoricalICMFromCurrent(processedData, filters.assessor, months, 2),
  [processedData, filters.assessor, months]
);

// Remover previousMonths se não for mais usado
```

---

### Comparativo Visual

| Antes | Depois |
|-------|--------|
| `📊 NOV: 85% │ DEZ: 92% │ JAN: 72%` | Layout em colunas com header "Histórico ICM" |
| Texto em linha única confuso | Cada mês em bloco separado |
| Mês atual apenas em negrito | Mês atual com background e borda destacados |
| Baseado no mês selecionado | Sempre baseado no mês atual do sistema |

---

### Comportamento Final

| Cenário | Histórico Exibido |
|---------|-------------------|
| Hoje = Janeiro 2026 | NOV 85% → DEZ 92% → **JAN 72%** |
| Dados só até Dezembro | OUT 78% → NOV 85% → **DEZ 92%** |
| Apenas 1 mês de dados | **JAN 72%** (sem meses anteriores) |
| Assessor = TODOS | Histórico não aparece |

---

### Benefícios

1. **Clareza Visual** - Cada mês em um bloco separado, fácil de ler
2. **Consistência** - Sempre mostra os mesmos meses independente do filtro
3. **Destaque Claro** - Mês atual com background e borda para identificação rápida
4. **Header Explicativo** - "Histórico ICM" deixa claro o propósito da seção
5. **Responsivo** - Usa classes text-responsive para adaptar ao tamanho da tela

