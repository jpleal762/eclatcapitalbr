

## Plano: Adicionar Histórico de Desempenho por Assessor no ICM Geral

### Objetivo

Quando um assessor específico for selecionado (não "TODOS"), exibir o desempenho do ICM do mês atual e dos dois meses anteriores no card ICM Geral, permitindo visualizar a evolução do assessor ao longo do tempo.

### Arquitetura da Solução

```text
QUANDO ASSESSOR = "TODOS":
┌─────────────────────────────────────────────────────────────────┐
│  ICM Geral                          [Assessor ▼] [Mês ▼]        │
│                                                                 │
│      [===GAUGE===]        Dias Úteis    Ritmo                  │
│         72%               Restantes     Ideal                   │
│                              8          65%                     │
│                                                                 │
│  ⚠️ Abaixo do esperado                                          │
└─────────────────────────────────────────────────────────────────┘

QUANDO ASSESSOR = "Bruno Silva" (específico):
┌─────────────────────────────────────────────────────────────────┐
│  ICM Geral                          [Assessor ▼] [Mês ▼]        │
│                                                                 │
│      [===GAUGE===]        Dias Úteis    Ritmo                  │
│         72%               Restantes     Ideal                   │
│                              8          65%                     │
│                                                                 │
│  📊 NOV: 85% │ DEZ: 92% │ JAN: 72%                             │
│  ⚠️ Abaixo do esperado                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/kpiUtils.ts` | **ADICIONAR** - Função `getPreviousMonths()` e `getAssessorHistoricalICM()` |
| `src/components/dashboard/ICMCard.tsx` | **MODIFICAR** - Adicionar seção de histórico quando assessor selecionado |
| `src/components/dashboard/FlipICMCard.tsx` | **MODIFICAR** - Passar dados históricos para ICMCard |
| `src/pages/Index.tsx` | **MODIFICAR** - Calcular e passar dados históricos |

---

### Detalhes Técnicos

#### 1. Criar Função para Obter Meses Anteriores (kpiUtils.ts)

```typescript
/**
 * Get the previous N months from the selected month
 * @param selectedMonth - Current selected month (e.g., "jan-26")
 * @param availableMonths - Array of available months in the data
 * @param count - Number of previous months to get (default: 2)
 * @returns Array of previous month strings in chronological order
 */
export function getPreviousMonths(
  selectedMonth: string, 
  availableMonths: string[], 
  count: number = 2
): string[] {
  if (!selectedMonth || selectedMonth === "all" || availableMonths.length === 0) {
    return [];
  }
  
  // Find the index of the selected month
  const normalizedSelected = selectedMonth.toLowerCase().replace("-", "/");
  const currentIndex = availableMonths.findIndex(m => 
    m.toLowerCase().replace("-", "/") === normalizedSelected
  );
  
  if (currentIndex === -1) return [];
  
  // Get previous months (as many as available, up to count)
  const previousMonths: string[] = [];
  for (let i = 1; i <= count && currentIndex - i >= 0; i++) {
    previousMonths.unshift(availableMonths[currentIndex - i]);
  }
  
  return previousMonths;
}

/**
 * Calculate historical ICM data for a specific assessor
 */
export interface HistoricalICMData {
  month: string;
  icmGeral: number;
}

export function getAssessorHistoricalICM(
  data: ProcessedKPI[],
  assessor: string,
  selectedMonth: string,
  previousMonths: string[]
): HistoricalICMData[] {
  if (assessor === "all" || !assessor) return [];
  
  const assessorData = filterByAssessor(data, assessor);
  const allMonths = [...previousMonths, selectedMonth];
  
  return allMonths.map(month => ({
    month: month.toUpperCase().split("/")[0].split("-")[0], // "JAN"
    icmGeral: calculateICMGeral(assessorData, month)
  }));
}
```

#### 2. Atualizar Props do ICMCard (ICMCard.tsx)

```typescript
interface ICMCardProps {
  icmGeral: number;
  ritmoIdeal: number;
  diasUteisRestantes: number;
  assessors: string[];
  selectedAssessor: string;
  selectedMonth: string;
  months: string[];
  onAssessorChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  isLocked?: boolean;
  // Novo: dados históricos
  historicalData?: { month: string; icmGeral: number }[];
}
```

#### 3. Adicionar Seção de Histórico no ICMCard (ICMCard.tsx)

Inserir entre o gauge e o indicador de performance:

```tsx
{/* Historical Performance - only when specific assessor is selected */}
{selectedAssessor !== "all" && historicalData && historicalData.length > 0 && (
  <div className="flex items-center justify-center gap-3 py-1 px-2 bg-muted/30 rounded-md flex-shrink-0">
    <span className="text-responsive-xs text-muted-foreground">📊</span>
    {historicalData.map((data, idx) => (
      <span 
        key={data.month} 
        className={`text-responsive-xs font-medium ${
          idx === historicalData.length - 1 
            ? 'text-primary font-bold' 
            : 'text-muted-foreground'
        }`}
      >
        {data.month}: {data.icmGeral}%
        {idx < historicalData.length - 1 && (
          <span className="text-muted-foreground/50 ml-2">│</span>
        )}
      </span>
    ))}
  </div>
)}
```

#### 4. Atualizar FlipICMCard (FlipICMCard.tsx)

Adicionar prop `historicalData` e passá-la para o ICMCard:

```typescript
interface FlipICMCardProps {
  // ... props existentes
  historicalData?: { month: string; icmGeral: number }[];
}

// No componente:
<ICMCard
  icmGeral={icmGeral}
  ritmoIdeal={ritmoIdeal}
  // ... outras props
  historicalData={historicalData}
/>
```

#### 5. Calcular Histórico no Index.tsx

```typescript
import { getPreviousMonths, getAssessorHistoricalICM } from "@/lib/kpiUtils";

// Calcular meses anteriores e histórico do assessor
const previousMonths = useMemo(
  () => getPreviousMonths(filters.month, months, 2),
  [filters.month, months]
);

const assessorHistoricalICM = useMemo(
  () => getAssessorHistoricalICM(
    processedData, 
    filters.assessor, 
    filters.month, 
    previousMonths
  ),
  [processedData, filters.assessor, filters.month, previousMonths]
);

// Passar para FlipICMCard:
<FlipICMCard
  icmGeral={dashboardData.icmGeral}
  ritmoIdeal={dashboardData.ritmoIdeal}
  // ... outras props
  historicalData={assessorHistoricalICM}
/>
```

---

### Layout Visual Final

```text
ASSESSOR SELECIONADO - "Bruno Silva" em JAN/26:
┌─────────────────────────────────────────────────────────────────┐
│  ICM Geral                         [Bruno ▼] [JAN-26 ▼]         │
│                                                                 │
│      [===GAUGE===]        Dias Úteis    Ritmo                   │
│         72%               Restantes     Ideal                   │
│                              8          65%                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📊 NOV: 85%  │  DEZ: 92%  │  JAN: 72%                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ⚠️ Abaixo do esperado                                          │
└─────────────────────────────────────────────────────────────────┘

Cores:
- Meses anteriores: text-muted-foreground
- Mês atual: text-primary font-bold
- Separador: │ em cinza claro
```

---

### Comportamento

| Seleção Assessor | Resultado |
|------------------|-----------|
| "TODOS (Escritório)" | Histórico NÃO aparece |
| "Bruno Silva" | Mostra NOV, DEZ, JAN (ou quantos meses anteriores existirem) |
| Menos de 3 meses disponíveis | Mostra apenas os meses que existem |

---

### Benefícios

1. **Visão de Evolução** - Permite ver tendência de performance do assessor
2. **Contexto Temporal** - Compara mês atual com meses anteriores
3. **Destaque Visual** - Mês atual em destaque com cor primária
4. **Não Invasivo** - Só aparece quando relevante (assessor específico selecionado)
5. **Responsivo** - Usa classes text-responsive para adaptar ao tamanho da tela

