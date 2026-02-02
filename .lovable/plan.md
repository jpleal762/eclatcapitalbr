

## Plano: Remover Botão "Meta Acumulada" e Adicionar Gaps Acumulados nas Barras Trimestrais

### Resumo das Mudanças

1. **Dashboard Mensal**: Remover o botão "Meta Acumulada" e toda a lógica associada
2. **Dashboard Trimestral**: Adicionar indicadores de gap acumulado abaixo de cada traço de mês nas barras de progresso

---

### Parte 1: Remover Botão "Meta Acumulada" do Dashboard Mensal

#### Arquivos a Modificar

**1. `src/components/dashboard/ICMCard.tsx`**

Remover:
- Props: `isAccumulatedMode`, `onAccumulatedModeChange`
- Função `handleAccumulatedToggle`
- Badge "⚡ META ACUMULADA"
- Botão com ícone `TrendingUp` e seu tooltip

**2. `src/components/dashboard/FlipICMCard.tsx`**

Remover:
- Props: `isAccumulatedMode`, `onAccumulatedModeChange`
- Passagem dessas props para `ICMCard`

**3. `src/pages/Index.tsx`**

Remover:
- Estado: `const [isAccumulatedMode, setIsAccumulatedMode] = useState(false)`
- Cálculo: `const accumulatedGaps = useMemo(...)`
- Passagem de `accumulatedGaps` para `processDashboardData`
- Props `isAccumulatedMode` e `onAccumulatedModeChange` do `FlipICMCard`

**4. `src/lib/kpiUtils.ts`**

Remover:
- Parâmetro `accumulatedGaps` de `calculateICMGeral`
- Parâmetro `accumulatedGaps` de `processDashboardData`
- Função `calculateAccumulatedGaps` (ou manter se for reutilizada para o trimestral)
- Console.logs de debug

---

### Parte 2: Adicionar Gaps Acumulados nas Barras Trimestrais

#### Lógica do Gap Acumulado

Para cada mês do trimestre (traços em 33.33% e 66.66%):
- Calcular o gap de cada mês anterior
- Mostrar o gap acumulado abaixo do traço correspondente
- Se a barra já passou do traço, não mostrar nada

```text
Exemplo Q1 (Jan-Fev-Mar), estamos em Fevereiro:

Barra de progresso:
|=======|       |       |
0%    33.33%  66.66%  100%
       M1      M2      M3

Se barra < 33.33%:
- Mostrar gap M1 abaixo do traço M1
- Mostrar gap M1+M2 abaixo do traço M2

Se barra entre 33.33% e 66.66%:
- Não mostrar nada no M1 (já passou)
- Mostrar gap M2 abaixo do traço M2
```

#### Arquivos a Modificar

**1. `src/lib/quarterlyKpiUtils.ts`**

Adicionar nova função para calcular gaps por mês:

```typescript
export interface MonthlyGapData {
  position: number;          // 33.33 ou 66.66
  monthLabel: string;        // "Jan", "Fev", etc.
  cumulativeGap: number;     // Gap acumulado até este mês
  isCurrency: boolean;
  showGap: boolean;          // Se deve mostrar (baseado na posição da barra)
}

export function calculateMonthlyGapsForBar(
  data: ProcessedKPI[],
  year: number,
  quarter: string,
  kpiConfig: KPIConfig,
  currentPercentage: number
): MonthlyGapData[]
```

Lógica:
- Para cada mês do trimestre, calcular meta e realizado
- Calcular gap = meta - realizado (se negativo, gap = 0)
- Gap acumulado no mês 2 = gap M1 + gap M2
- Gap acumulado no mês 3 = gap M1 + gap M2 + gap M3
- `showGap` = true apenas se a barra atual estiver ANTES do traço E estivermos naquele mês ou depois

**2. `src/components/dashboard/AnalysisPage.tsx`**

Passar os dados de gap mensal para cada `QuarterlyKPIBar`

**3. `src/components/dashboard/QuarterlyKPIBar.tsx`**

Adicionar renderização dos gaps abaixo dos traços:

```text
Estrutura visual:
┌─────────────────────────────────────────┐
│ Label                              XX%  │
├─────────────────────────────────────────┤
│ ████████░░░░░░░|░░░░░░░|░░░░░░░░░░░░░  │  <- Barra
│            -R$ 50K  -R$ 120K           │  <- Gaps
├─────────────────────────────────────────┤
│ R$ 100K / R$ 500K      Falta: R$ 400K  │
└─────────────────────────────────────────┘
```

---

### Detalhes Técnicos

#### Cálculo do Gap Acumulado por Mês

Para Q1 (Jan-Fev-Mar) no KPI "Captação NET":

```typescript
// Mês 1 (Janeiro)
const metaJan = getMonthValue(planned, "jan-26");
const realJan = getMonthValue(realized, "jan-26");
const gapJan = Math.max(0, metaJan - realJan);

// Mês 2 (Fevereiro)
const metaFev = getMonthValue(planned, "fev-26");
const realFev = getMonthValue(realized, "fev-26");
const gapFev = Math.max(0, metaFev - realFev);
const gapAcumuladoM2 = gapJan + gapFev;

// Mês 3 (Março)
const metaMar = getMonthValue(planned, "mar-26");
const realMar = getMonthValue(realized, "mar-26");
const gapMar = Math.max(0, metaMar - realMar);
const gapAcumuladoM3 = gapJan + gapFev + gapMar;
```

#### Lógica de Exibição

```typescript
// Determinar mês atual do ano
const currentMonth = new Date().getMonth(); // 0-11

// Determinar em qual mês do trimestre estamos
const quarterDef = QUARTERS.find(q => q.value === quarter);
const monthsInQuarter = quarterDef.months; // ["jan", "fev", "mar"]

// Para cada traço (M1 em 33.33%, M2 em 66.66%)
monthlyGaps.forEach(gap => {
  // Mostrar gap apenas se:
  // 1. Estamos nesse mês ou depois
  // 2. A barra ainda não atingiu esse ponto
  gap.showGap = (estamoNesseMesOuDepois) && (currentPercentage < gap.position);
});
```

---

### Resultado Visual Esperado

```text
┌─────────────────────────────────────────────────────┐
│ Captação NET                                   45%  │
├─────────────────────────────────────────────────────┤
│ ██████████████░░░░░░░░|░░░░░░░░|░░░░░░░░░░░░░░░░  │
│                 ▲          ▲                        │
│             -R$ 50K    -R$ 85K                      │
├─────────────────────────────────────────────────────┤
│ R$ 450K / R$ 1Mi                     Falta: R$ 550K │
└─────────────────────────────────────────────────────┘

Legenda:
- Traço 1 (33.33%): Gap de Janeiro = R$ 50K
- Traço 2 (66.66%): Gap Jan + Fev = R$ 85K
- (Se barra passasse do traço 1, não mostraria o -R$ 50K)
```

---

### Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/ICMCard.tsx` | Remover botão e lógica de meta acumulada |
| `src/components/dashboard/FlipICMCard.tsx` | Remover props de meta acumulada |
| `src/pages/Index.tsx` | Remover estado e cálculo de gaps acumulados |
| `src/lib/kpiUtils.ts` | Remover parâmetro accumulatedGaps, limpar debug logs |
| `src/lib/quarterlyKpiUtils.ts` | Adicionar função de cálculo de gaps mensais |
| `src/components/dashboard/AnalysisPage.tsx` | Passar dados de gaps para QuarterlyKPIBar |
| `src/components/dashboard/QuarterlyKPIBar.tsx` | Renderizar gaps abaixo dos traços de mês |

