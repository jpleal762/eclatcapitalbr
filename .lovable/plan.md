# Plano: Gaps Acumulados nas Barras Trimestrais

## Status: ✅ IMPLEMENTADO

### Mudanças Realizadas

1. **Dashboard Mensal**: Removido o botão "Meta Acumulada" e toda a lógica associada
2. **Dashboard Trimestral**: Adicionados indicadores de gap acumulado abaixo de cada traço de mês nas barras de progresso

---

### Parte 1: Botão "Meta Acumulada" Removido ✅

- `src/components/dashboard/ICMCard.tsx` - Props e lógica removidos
- `src/components/dashboard/FlipICMCard.tsx` - Props removidos
- `src/pages/Index.tsx` - Estado e passagem de props removidos
- `src/lib/kpiUtils.ts` - Parâmetro `accumulatedGaps` removido de `calculateICMGeral` e `processDashboardData`

---

### Parte 2: Gaps Acumulados nas Barras Trimestrais ✅

#### Nova Interface e Função

**`src/lib/quarterlyKpiUtils.ts`**
```typescript
export interface MonthlyGapData {
  position: number;          // 33.33 ou 66.66 (percentual na barra)
  monthLabel: string;        // "Jan", "Fev", etc.
  monthIndex: number;        // 0, 1 (mês dentro do trimestre)
  cumulativeGap: number;     // Gap acumulado até este mês
  isCurrency: boolean;
  showGap: boolean;          // Se deve mostrar
}

export function calculateMonthlyGapsForBar(
  data: ProcessedKPI[],
  year: number,
  quarter: string,
  kpiConfig: KPIConfig,
  currentPercentage: number,
  assessor: string
): MonthlyGapData[]
```

#### Lógica de Exibição

- Gap só aparece se:
  1. A barra de progresso está ANTES daquela posição (não atingiu ainda)
  2. Estamos naquele mês ou depois (o mês já passou ou é o atual)
  3. O gap é maior que zero

- Traço 1 (33.33%): Gap do mês 1
- Traço 2 (66.66%): Gap do mês 1 + mês 2

---

### Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/ICMCard.tsx` | Removido botão e lógica de meta acumulada |
| `src/components/dashboard/FlipICMCard.tsx` | Removidas props de meta acumulada |
| `src/pages/Index.tsx` | Removido estado e cálculo |
| `src/lib/kpiUtils.ts` | Removido parâmetro accumulatedGaps |
| `src/lib/quarterlyKpiUtils.ts` | Adicionada função `calculateMonthlyGapsForBar` |
| `src/components/dashboard/AnalysisPage.tsx` | Passa `monthlyGaps` para `QuarterlyKPIBar` |
| `src/components/dashboard/QuarterlyKPIBar.tsx` | Renderiza gaps abaixo dos traços |
