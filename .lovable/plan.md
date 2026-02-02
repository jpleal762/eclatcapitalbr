

## Correção: ICM Geral e ICM por Assessor não reajustam com Meta Acumulada

### Problema Identificado

Na função `processDashboardData`:

1. **Linha 999**: `icmGeral = calculateICMGeral(filteredByAssessor, selectedMonth)` - **NÃO recebe** `accumulatedGaps`
2. **Linhas 1091-1093**: `assessorPerformance` usa `calculateICMGeral(assessorData, selectedMonth)` - **NÃO recebe** `accumulatedGaps`

Apenas os `gaugeKPIs` (linha 1183-1190) aplicam os gaps corretamente.

### Solução

Modificar a função `calculateICMGeral` para aceitar um parâmetro opcional `accumulatedGaps` e usá-lo ao calcular os targets.

### Arquivo a Modificar

**`src/lib/kpiUtils.ts`**

#### 1. Atualizar `calculateICMGeral` (linhas 450-482)

```typescript
export function calculateICMGeral(
  data: ProcessedKPI[], 
  month: string,
  accumulatedGaps?: Map<string, number>  // NOVO PARÂMETRO
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(KPI_WEIGHTS).forEach(([category, weight]) => {
    const catData = filterByCategory(data, category);
    const plannedData = catData.filter(d => isPlannedMonthStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));

    let target = month !== "all" 
      ? getMonthValue(plannedData, month) 
      : plannedData.reduce((s, d) => s + d.total, 0);
    
    // APLICAR ACCUMULATED GAPS AO TARGET
    if (accumulatedGaps) {
      target += accumulatedGaps.get(category) || 0;
    }
    
    let actual = month !== "all" 
      ? getMonthValue(realizedData, month) 
      : realizedData.reduce((s, d) => s + d.total, 0);

    // ... resto do código igual
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
```

#### 2. Atualizar chamada do `icmGeral` (linha 999)

```typescript
const icmGeral = calculateICMGeral(filteredByAssessor, selectedMonth, accumulatedGaps);
```

#### 3. Atualizar loop do `assessorPerformance` (linhas 1091-1101)

```typescript
const assessorPerformance: AssessorPerformance[] = allAssessors.map(assessor => {
  const assessorData = filterByAssessor(data, assessor);
  const icm = calculateICMGeral(assessorData, selectedMonth, accumulatedGaps);  // PASSAR GAPS
  const icmSemanal = calculateICMSemanal(assessorData, selectedMonth);
  return {
    name: assessor.split(" ").slice(0, 2).join(" "),
    fullName: assessor,
    geralPercentage: icm,
    semanaPercentage: icmSemanal,
  };
}).sort((a, b) => b.geralPercentage - a.geralPercentage);
```

### Resultado Esperado

Ao clicar no botão "Meta Acumulada":
- ICM Geral será recalculado com os targets ajustados
- ICM de cada assessor será recalculado com os targets ajustados
- Rankings serão atualizados corretamente

### Exemplo

Para Habilitação em Fevereiro:
- Meta original: 24
- Gap de Janeiro: +7
- **Meta ajustada: 31**
- Se realizado = 20: Percentual cai de 83% (20/24) para 65% (20/31)

