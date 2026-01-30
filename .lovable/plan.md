
## Plano: Exibir Top 2 Assessores com Maiores Gaps por KPI (Análise Trimestral)

### Objetivo
Cada barra de KPI na análise trimestral mostrará os 2 assessores com maior déficit em relação ao ritmo ideal, **sem alterar o layout atual**.

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/quarterlyKpiUtils.ts` | Nova interface + função para calcular gaps por assessor |
| `src/components/dashboard/AnalysisPage.tsx` | Calcular e passar dados dos assessores |
| `src/components/dashboard/QuarterlyKPIBar.tsx` | Exibir badges compactos dos assessores com gap |

---

### 1. quarterlyKpiUtils.ts - Nova Interface e Função

**Nova interface:**
```typescript
export interface AssessorQuarterlyGap {
  name: string;           // Primeiro nome do assessor
  gap: number;            // Valor absoluto que falta
  gapPercentage: number;  // Gap em pontos percentuais
}
```

**Nova função `calculateAssessorGapsForKPI`:**
- Recebe dados, ano, trimestre, configuração do KPI, e ritmo ideal
- Para cada assessor, calcula target e actual individuais
- Calcula gap = max(0, valorEsperadoRitmo - actual)
- Retorna os 2 assessores com maiores gaps

---

### 2. AnalysisPage.tsx - Calcular Gaps

**Adicionar useMemo para calcular gaps por assessor para cada KPI:**

```typescript
import { calculateAssessorGapsForKPI, AssessorQuarterlyGap } from "@/lib/quarterlyKpiUtils";
import { KPI_CATEGORIES } from "@/lib/kpiUtils";

const kpisWithGaps = useMemo(() => {
  return quarterlyKPIs.map(kpi => {
    // Encontrar config original do KPI
    const kpiConfig = KPI_CATEGORIES.find(k => k.label === kpi.label);
    if (!kpiConfig || selectedAssessor !== "all") {
      return { ...kpi, topAssessorGaps: [] };
    }
    
    const gaps = calculateAssessorGapsForKPI(
      processedData,
      selectedYear,
      selectedQuarter,
      kpiConfig,
      ritmoIdeal
    );
    
    return { ...kpi, topAssessorGaps: gaps };
  });
}, [quarterlyKPIs, processedData, selectedYear, selectedQuarter, ritmoIdeal, selectedAssessor]);
```

**Importante:** Só calcula gaps quando filtro de assessor é "TODOS" (faz sentido comparar assessores).

---

### 3. QuarterlyKPIBar.tsx - Exibir Assessores com Gap

**Nova prop:**
```typescript
interface QuarterlyKPIBarProps extends QuarterlyKPI {
  ritmoIdeal: number;
  headName?: string;
  isTopGap?: boolean;
  topAssessorGaps?: AssessorQuarterlyGap[]; // NEW
}
```

**Visual compacto na linha de valores (sem adicionar nova linha):**

```tsx
{/* Values - compact font */}
<div className="flex justify-between items-center text-scale-5 text-muted-foreground mt-[1px]">
  <span>
    <span className="font-medium text-foreground">{formatValue(value, isCurrency)}</span>
    {" / "}
    {formatValue(target, isCurrency)}
  </span>
  
  {/* TOP 2 ASSESSOR GAPS - inline, compacto */}
  {topAssessorGaps && topAssessorGaps.length > 0 && (
    <div className="flex items-center gap-0.5">
      {topAssessorGaps.map((a) => (
        <span 
          key={a.name}
          className="px-0.5 py-[1px] text-scale-4 rounded bg-red-500/10 text-red-500 border border-red-500/20"
        >
          {a.name}: -{formatValue(a.gap, isCurrency)}
        </span>
      ))}
    </div>
  )}
  
  {/* Rhythm status indicator */}
  {atingiuRitmo ? (
    <span className="text-green-500 font-medium">✓ OK</span>
  ) : faltaParaRitmo > 0 ? (
    <span className={`font-medium whitespace-nowrap ${textColor}`}>
      Ritmo: -{formatValue(faltaParaRitmo, isCurrency)}
    </span>
  ) : null}
  
  {/* Total remaining */}
  {percentage < 100 && target > 0 && (
    <span className="text-muted-foreground whitespace-nowrap">
      Falta: {formatValue(target - value, isCurrency)}
    </span>
  )}
</div>
```

---

### Layout Preservado

O layout não será alterado porque:
1. Os badges dos assessores ficam **na mesma linha** dos valores existentes
2. Usam tamanho de fonte menor (`text-scale-4`)
3. São compactos com padding mínimo (`px-0.5 py-[1px]`)
4. Só aparecem quando há assessores com gap E filtro = "TODOS"

---

### Resultado Visual

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Captação NET                                     ⚠️ PRIORIDADE   75% │
│ ════════════════════════════════░░░░░░░░░░░░░░░░░░░░░░░░░           │
│ R$ 1,2Mi / R$ 2Mi  [BRUNO:-80K] [ANA:-65K]  Ritmo: -R$200K  Falta:800K│
└──────────────────────────────────────────────────────────────────────┘
```

- Badges vermelhos compactos inline
- Apenas primeiro nome do assessor
- Valor do gap formatado (K/Mi)
- Não quebra linha, não adiciona altura

---

### Regras de Negócio

1. **Só mostrar quando filtro = "TODOS"**: Não faz sentido mostrar gaps de assessores quando já filtrou por um específico
2. **Máximo 2 assessores**: Os 2 com maior gap absoluto
3. **Só assessores com gap > 0**: Se atingiu o ritmo, não aparece
4. **Primeiro nome apenas**: "BRUNO" ao invés de "BRUNO SILVA"
