

## Plano: Tela Sprint com Objetivo = "O que Falta" e Produção por Assessor

### Conceito Corrigido

A tela Sprint mostra **o que falta para bater a meta semanal** como objetivo:
- **Objetivo (Meta da Barra):** Valor que falta para atingir a meta semanal
- **Produção:** Inicia em zero e vai preenchendo conforme produção é registrada
- **Por Assessor:** Breakdown mostrando quanto cada assessor contribuiu ou precisa contribuir

---

### Visualização Proposta

```text
+-------------------------------------------------------------------------+
|  Sprint Semanal                              [Assessor v] [Mes v]       |
|  Objetivo: Zerar o que falta da meta semanal                            |
+-------------------------------------------------------------------------+
|                                                                         |
|  Captação NET                                          Objetivo: R$ 0   |
|  ████████████████████████████████████████████████████████████  ZERADO!  |
|  Por Assessor: Hingrid +R$ 12K | Jose +R$ 8K | Marcela +R$ 5K           |
|                                                                         |
|  Receita                                       Objetivo: R$ 45.200      |
|  ██████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   32%   |
|  Falta por Assessor:                                                    |
|  Hingrid ......... R$ 18.500 | Jose .......... R$ 12.700               |
|  Marcela ......... R$ 8.200  | Romulo ........ R$ 5.800                 |
|                                                                         |
|  Diversificação                                Objetivo: R$ 12.500      |
|  ████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   45%   |
|  Falta por Assessor:                                                    |
|  Jose ............ R$ 6.200  | Hingrid ....... R$ 4.100                 |
|  Onacilda ........ R$ 2.200  |                                          |
|                                                                         |
|  Primeiras Reuniões                             Objetivo: 2 reuniões    |
|  ██████████████████████████████████████████████████████████░░░░   85%   |
|  Falta por Assessor: Marcela -1 | Jose -1                               |
|                                                                         |
|  Habilitação                                           Objetivo: 0      |
|  ████████████████████████████████████████████████████████████  ZERADO!  |
|  Todos os assessores atingiram a meta!                                  |
|                                                                         |
|  Ativação                                       Objetivo: 1 ativação    |
|  ████████████████████████████████████████████████████████░░░░░░   75%   |
|  Falta por Assessor: Onacilda -1                                        |
|                                                                         |
+-------------------------------------------------------------------------+
```

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/kpiUtils.ts` | **MODIFICAR** - Adicionar função `calculateSprintData` e `calculateWeeklyRemainingByAssessor` |
| `src/types/kpi.ts` | **MODIFICAR** - Adicionar interfaces `SprintKPIData` e `AssessorWeeklyRemaining` |
| `src/components/dashboard/SprintPage.tsx` | **CRIAR** - Componente principal da tela |
| `src/components/dashboard/SprintKPIBar.tsx` | **CRIAR** - Barra individual com breakdown por assessor |
| `src/components/dashboard/PageToggle.tsx` | **MODIFICAR** - Adicionar opção "sprint" |
| `src/pages/Index.tsx` | **MODIFICAR** - Integrar nova página e calcular dados de sprint |

---

### Detalhes Técnicos

#### 1. Novas Interfaces em `src/types/kpi.ts`

```typescript
export interface AssessorWeeklyRemaining {
  name: string;           // Primeiro nome do assessor
  remaining: number;      // Quanto falta para bater a meta semanal individual
  achieved: boolean;      // Se já atingiu a meta
  contribution?: number;  // Quanto já contribuiu (opcional, para mostrar produção)
}

export interface SprintKPIData {
  label: string;                          // "Captação NET", "Receita", etc.
  category: string;                       // Categoria interna
  totalRemaining: number;                 // Total que falta (objetivo da barra)
  totalRealized: number;                  // Total já realizado nesta semana
  totalTarget: number;                    // Meta semanal total
  progressPercentage: number;             // % do objetivo já produzido
  isCurrency: boolean;                    // Se é valor monetário
  isCompleted: boolean;                   // Se objetivo foi zerado
  assessorBreakdown: AssessorWeeklyRemaining[]; // Falta por assessor
}
```

#### 2. Nova Função em `src/lib/kpiUtils.ts`

```typescript
export function calculateWeeklyRemainingByAssessor(
  data: ProcessedKPI[],
  category: string,
  month: string,
  includeEmpilhada: boolean = false
): AssessorWeeklyRemaining[] {
  if (!data || data.length === 0 || month === "all") return [];

  const allAssessors = [...new Set(data.map(d => d.assessor))]
    .filter(a => a && a !== "Socios");

  return allAssessors.map(assessor => {
    const assessorData = filterByAssessor(data, assessor);
    
    // Meta semanal individual
    const catData = filterByCategory(assessorData, category);
    const weeklyPlanned = catData.filter(d => isPlannedWeekStatus(d.status));
    const target = getMonthValue(weeklyPlanned, month);
    
    // Realizado individual
    const realizedData = catData.filter(d => isRealizedStatus(d.status));
    let value = getMonthValue(realizedData, month);
    
    // Adicionar Receita Empilhada se aplicável
    if (includeEmpilhada) {
      const empilhadaData = filterByCategory(assessorData, "Receita Empilhada");
      const empilhadaRealized = empilhadaData.filter(d => isRealizedStatus(d.status));
      value += getMonthValue(empilhadaRealized, month);
    }
    
    const remaining = Math.max(target - value, 0);
    
    return {
      name: assessor.split(" ")[0],
      remaining,
      achieved: target > 0 && value >= target,
      contribution: value
    };
  })
  .filter(a => !a.achieved) // Só mostrar quem ainda precisa produzir
  .sort((a, b) => b.remaining - a.remaining); // Maior falta primeiro
}

export function calculateSprintData(
  data: ProcessedKPI[],
  selectedMonth: string,
  selectedAssessor: string
): SprintKPIData[] {
  const categories = [
    { category: "Captação net", label: "Captação NET", isCurrency: true, includeEmpilhada: false },
    { category: "Receita", label: "Receita", isCurrency: true, includeEmpilhada: true },
    { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true, includeEmpilhada: false },
    { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false, includeEmpilhada: false },
    { category: "Habilitacao", label: "Habilitação", isCurrency: false, includeEmpilhada: false },
    { category: "Ativacao", label: "Ativação", isCurrency: false, includeEmpilhada: false },
  ];
  
  return categories.map(item => {
    // Filtrar por assessor se selecionado
    const filteredData = selectedAssessor === "all" 
      ? data 
      : filterByAssessor(data, selectedAssessor);
    
    // Calcular totais
    const catData = filterByCategory(filteredData, item.category);
    const weeklyPlanned = catData.filter(d => isPlannedWeekStatus(d.status));
    const realizedData = catData.filter(d => isRealizedStatus(d.status));
    
    const totalTarget = getMonthValue(weeklyPlanned, selectedMonth);
    let totalRealized = getMonthValue(realizedData, selectedMonth);
    
    if (item.includeEmpilhada) {
      const empilhadaData = filterByCategory(filteredData, "Receita Empilhada");
      const empilhadaRealized = empilhadaData.filter(d => isRealizedStatus(d.status));
      totalRealized += getMonthValue(empilhadaRealized, selectedMonth);
    }
    
    const totalRemaining = Math.max(totalTarget - totalRealized, 0);
    const progressPercentage = totalTarget > 0 
      ? Math.min((totalRealized / totalTarget) * 100, 100) 
      : 100;
    
    // Breakdown por assessor (apenas se "all" selecionado)
    const assessorBreakdown = selectedAssessor === "all"
      ? calculateWeeklyRemainingByAssessor(data, item.category, selectedMonth, item.includeEmpilhada)
      : [];
    
    return {
      label: item.label,
      category: item.category,
      totalRemaining,
      totalRealized,
      totalTarget,
      progressPercentage,
      isCurrency: item.isCurrency,
      isCompleted: totalRemaining === 0,
      assessorBreakdown
    };
  });
}
```

#### 3. Componente `SprintKPIBar.tsx`

Props e estrutura:
```typescript
interface SprintKPIBarProps {
  data: SprintKPIData;
}
```

Características visuais:
- Barra mostra progresso em direção a "zerar o que falta"
- Cor verde quando objetivo zerado (100%)
- Cor dourada/amarela quando em progresso
- Cor vermelha quando progresso < 50%
- Lista de assessores abaixo da barra (quando visualização geral)
- Indicador "ZERADO!" ou "Objetivo: R$ X" à direita

#### 4. Componente `SprintPage.tsx`

```typescript
interface SprintPageProps {
  sprintData: SprintKPIData[];
  assessors: string[];
  months: string[];
  selectedAssessor: string;
  selectedMonth: string;
  onAssessorChange: (assessor: string) => void;
  onMonthChange: (month: string) => void;
  isLocked?: boolean;
}
```

Layout:
- Header com título e filtros
- Lista vertical de `SprintKPIBar` para cada KPI
- Layout responsivo (fit-to-screen em desktop/TV)
- Ordenação: KPIs com maior "falta" primeiro

#### 5. Atualização do `PageToggle.tsx`

```typescript
type PageType = "dashboard" | "analysis" | "sprint";
```

- Novo ícone: `Target` ou `Zap` do Lucide
- Navegação cíclica: Dashboard → Análises → Sprint → Dashboard
- Tooltip: "Ir para Sprint"

#### 6. Integração no `Index.tsx`

```typescript
// Calcular dados de sprint
const sprintData = useMemo(
  () => calculateSprintData(processedData, filters.month, filters.assessor),
  [processedData, filters.month, filters.assessor]
);

// Renderização condicional
{currentPage === "sprint" && (
  <SprintPage 
    sprintData={sprintData}
    assessors={assessors}
    months={months}
    selectedAssessor={filters.assessor}
    selectedMonth={filters.month}
    onAssessorChange={(v) => setFilters({...filters, assessor: v})}
    onMonthChange={(v) => setFilters({...filters, month: v})}
    isLocked={isViewLocked}
  />
)}
```

---

### Lógica de Cores das Barras

| Progresso | Cor | Indicador Visual |
|-----------|-----|------------------|
| 100% (zerado) | Verde (`bg-green-500`) | "ZERADO!" com icone de check |
| 50-99% | Dourado (`bg-eclat-gradient`) | "Objetivo: R$ X" |
| < 50% | Vermelho (`bg-red-gradient`) | "Objetivo: R$ X" (alerta) |

---

### Fluxo de Dados

```text
processedData (KPI brutos)
       │
       ▼
calculateSprintData()
       │
       ├─► totalTarget (meta semanal)
       ├─► totalRealized (produção atual) 
       ├─► totalRemaining = target - realized (OBJETIVO)
       └─► assessorBreakdown (falta por pessoa)
              │
              ▼
       SprintPage (renderiza barras)
              │
              ▼
       SprintKPIBar (cada KPI com breakdown)
```

---

### Resultado Final

Uma tela dedicada de **Sprint** que:
1. Mostra "o que falta" como objetivo de cada barra
2. Inicia com produção zerada e preenche conforme realização
3. Exibe breakdown de quanto cada assessor precisa produzir
4. Permite filtrar por assessor individual
5. Celebra visualmente quando um KPI é "zerado"
6. Mantém layout responsivo fit-to-screen

