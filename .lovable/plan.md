

## Plano: Botão "Meta Acumulada" com Gaps de Meses Anteriores

### Objetivo
Criar um botão no dashboard que, ao ser ativado, recalcula todas as metas adicionando os gaps (falta para bater meta) dos meses anteriores do ano atual.

---

### Lógica de Cálculo

**Fórmula:**
```
Nova Meta = Meta do Mês Atual + Σ(Gaps dos Meses Anteriores do Ano)
```

**Onde:**
```
Gap de um mês = max(0, Planejado Mês - Realizado)
```

**Exemplo:**
- Meta de Janeiro: 10 (realizado: 8) → Gap: 2
- Meta de Fevereiro: 12 (realizado: 15) → Gap: 0 (bateu meta)
- Meta de Março (atual): 12
- **Nova Meta de Março:** 12 + 2 + 0 = 14

---

### Arquivos a Modificar

#### 1. **`src/lib/kpiUtils.ts`**
Nova função para calcular gaps acumulados:

```typescript
export function calculateAccumulatedGaps(
  data: ProcessedKPI[],
  currentMonth: string,
  assessor: string
): Map<string, number>
```

- Retorna um Map com categoria → valor do gap acumulado
- Considera apenas meses anteriores ao mês selecionado, no mesmo ano
- Aplica a mesma lógica de categorias especiais (Receita XP = PJ1 + PJ2)

#### 2. **`src/lib/kpiUtils.ts`** - Modificar `processDashboardData`
Adicionar parâmetro opcional `accumulatedGaps`:

```typescript
export function processDashboardData(
  data: ProcessedKPI[], 
  selectedMonth: string, 
  selectedAssessor: string = "all",
  accumulatedGaps?: Map<string, number>  // NOVO
): DashboardData
```

- Quando `accumulatedGaps` é fornecido, adiciona o gap ao target de cada KPI

#### 3. **`src/pages/Index.tsx`**
- Adicionar estado: `isAccumulatedMode: boolean`
- Calcular gaps acumulados via `useMemo`
- Passar gaps para `processDashboardData` quando modo ativo
- Propagar estado para componentes filhos

#### 4. **`src/components/dashboard/ICMCard.tsx`**
Adicionar botão toggle ao lado dos filtros:

| Visual |
|--------|
| `[📊]` Botão com ícone que alterna entre ativo/inativo |
| Tooltip: "Meta Acumulada (inclui gaps de meses anteriores)" |
| Quando ativo: cor primária destacada |

---

### Detalhes Técnicos

**Novo estado em Index.tsx:**
```typescript
const [isAccumulatedMode, setIsAccumulatedMode] = useState(false);
```

**Cálculo dos gaps:**
```typescript
const accumulatedGaps = useMemo(() => {
  if (!isAccumulatedMode) return undefined;
  return calculateAccumulatedGaps(processedData, filters.month, filters.assessor);
}, [isAccumulatedMode, processedData, filters.month, filters.assessor]);
```

**Dashboard data com gaps:**
```typescript
const dashboardData = useMemo(
  () => processDashboardData(processedData, filters.month, filters.assessor, accumulatedGaps),
  [processedData, filters.month, filters.assessor, accumulatedGaps]
);
```

---

### Componentes Afetados

Quando o modo acumulado estiver ativo, todas essas métricas serão recalculadas:

| Componente | Impacto |
|------------|---------|
| GaugeChart (todos os 9) | Nova meta → novo percentual |
| FlipICMCard | ICM Geral recalculado |
| MetaTable | Valores de meta atualizados |
| AssessorChart | Rankings recalculados |
| FlipGaugeChart | "Falta por Assessor" atualizado |

---

### Props a Adicionar

**ICMCard / FlipICMCard:**
```typescript
isAccumulatedMode: boolean;
onAccumulatedModeChange: (value: boolean) => void;
```

---

### Visual do Botão

```text
┌─────────────────────────────────────────────────────────┐
│ ICM Geral          [Assessor ▾] [Mês ▾] [📊 Acum.]     │
└─────────────────────────────────────────────────────────┘
```

- Ícone sugerido: `TrendingUp` ou `Layers` (lucide-react)
- Estado ativo: fundo primário, ícone branco
- Estado inativo: fundo muted, ícone cinza
- Tooltip explicativo

---

### Indicador Visual de Modo Ativo

Quando o modo acumulado estiver ativo, adicionar badge visível:

```text
┌──────────────────────────────────────────────────────────┐
│ ICM Geral  ⚡ META ACUMULADA    [Assessor ▾] [Mês ▾]    │
└──────────────────────────────────────────────────────────┘
```

Badge amarelo/laranja indicando que as metas estão ajustadas.

---

### Resultado Esperado

1. Botão toggle discreto mas acessível
2. Ao ativar, todas as metas são recalculadas instantaneamente
3. Percentuais, "quanto falta", e rankings refletem a nova meta
4. Ao desativar, volta ao comportamento normal
5. Estado persistido na sessão (não em localStorage)

