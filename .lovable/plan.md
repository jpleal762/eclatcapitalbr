

## Plano: Objetivo Sprint Evidente + Evolução 48h + Confetti Animation

### Visão Geral

Três melhorias principais para a tela Sprint:
1. **Objetivo Mais Evidente**: Header hero com métricas agregadas e indicadores visuais de urgência
2. **Evolução em 48h**: Comparação com snapshot anterior após atualização de dados
3. **Confetti Animation**: Efeito visual celebratório quando um KPI é zerado

---

### 1. Animação de Confetti

#### 1.1 Instalar Biblioteca

Adicionar `canvas-confetti` - biblioteca leve (~3KB gzipped) para efeitos de confetti:

```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

#### 1.2 Componente de Confetti

**Novo arquivo: `src/components/dashboard/ConfettiCelebration.tsx`**

```typescript
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiCelebrationProps {
  trigger: boolean;
  origin?: { x: number; y: number };
}

export function ConfettiCelebration({ trigger, origin }: ConfettiCelebrationProps) {
  const hasTriggered = useRef(false);
  
  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      
      // Burst de confetti dourado (cores da marca)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: origin || { y: 0.6 },
        colors: ['#FFE066', '#E6A800', '#22C55E', '#FFFFFF'],
        gravity: 0.8,
        scalar: 1.2,
      });
      
      // Segunda explosão menor após delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: origin || { y: 0.6 },
          colors: ['#FFE066', '#22C55E'],
        });
      }, 150);
    }
  }, [trigger, origin]);
  
  return null;
}
```

#### 1.3 Integração no SprintKPIBar

Adicionar o componente de confetti que dispara quando `isCompleted` muda para `true`:

```typescript
// SprintKPIBar.tsx
import { ConfettiCelebration } from "./ConfettiCelebration";
import { Trophy, PartyPopper } from "lucide-react";

// Dentro do componente:
const [justCompleted, setJustCompleted] = useState(false);
const wasCompletedRef = useRef(isCompleted);

useEffect(() => {
  if (isCompleted && !wasCompletedRef.current) {
    setJustCompleted(true);
    // Reset após animação
    const timer = setTimeout(() => setJustCompleted(false), 3000);
    return () => clearTimeout(timer);
  }
  wasCompletedRef.current = isCompleted;
}, [isCompleted]);

// No render:
<ConfettiCelebration trigger={justCompleted} />

{isCompleted && (
  <span className="flex items-center gap-1 text-green-500 text-xs lg:text-sm font-bold">
    <Trophy className="h-4 w-4 animate-trophy-celebrate" />
    <PartyPopper className="h-4 w-4 animate-celebrate-pop" />
    ZERADO!
  </span>
)}
```

---

### 2. Header Hero com Objetivo Evidente

#### 2.1 Novo Componente: `SprintHeader.tsx`

**Arquivo: `src/components/dashboard/SprintHeader.tsx`**

Layout visual:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  🎯 SPRINT SEMANAL                                                           │
│  ═══════════════════════════════════════════════════════════════════════════ │
│  MISSÃO: Zerar o gap entre META e REALIZADO                                  │
│                                                                              │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐   ✓ 2/6 KPIs  │
│  │  OBJETIVO TOTAL │   │   PRODUZIDO   │   │  AINDA FALTA  │    ZERADOS    │
│  │    R$ 145K     │   │    R$ 82K     │   │    R$ 63K     │               │
│  └────────────────┘   └────────────────┘   └────────────────┘               │
│                                                                              │
│  [████████████████████████████░░░░░░░░░░░░░░░] 56% concluído                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

Props:
```typescript
interface SprintHeaderProps {
  globalStats: SprintGlobalStats;
  assessors: string[];
  months: string[];
  selectedAssessor: string;
  selectedMonth: string;
  onAssessorChange: (assessor: string) => void;
  onMonthChange: (month: string) => void;
  isLocked?: boolean;
}

interface SprintGlobalStats {
  totalObjective: number;
  totalProduced: number;
  totalStillMissing: number;
  globalProgressPercentage: number;
  kpisCompleted: number;
  kpisTotal: number;
}
```

#### 2.2 Indicadores de Urgência nas Barras

Adicionar ícones visuais em cada barra:

| Progresso | Ícone | Cor |
|-----------|-------|-----|
| < 50% | 🔥 `Flame` | Vermelho |
| 50-80% | ⏱️ `Timer` | Amarelo |
| 80-99% | 🎯 `Target` | Verde claro |
| 100% | 🏆 `Trophy` + 🎉 `PartyPopper` | Verde |

---

### 3. Sistema de Evolução em 48h

#### 3.1 Nova Tabela no Banco de Dados

```sql
CREATE TABLE public.sprint_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(10) NOT NULL,
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sprint_snapshots_month ON public.sprint_snapshots(month);
CREATE INDEX idx_sprint_snapshots_created ON public.sprint_snapshots(created_at DESC);

ALTER TABLE public.sprint_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to sprint_snapshots"
  ON public.sprint_snapshots FOR ALL
  USING (true)
  WITH CHECK (true);
```

#### 3.2 Funções de Storage

**Novo arquivo: `src/lib/sprintStorage.ts`**

```typescript
export async function saveSprintSnapshot(
  month: string,
  sprintData: SprintKPIData[]
): Promise<void>;

export async function getLatestSnapshot(
  month: string,
  minHoursAgo: number = 24
): Promise<SprintSnapshot | null>;

export function calculateEvolution(
  currentData: SprintKPIData[],
  previousSnapshot: SprintSnapshot
): SprintEvolution;
```

#### 3.3 Interface de Evolução

```typescript
export interface SprintEvolution {
  difference: number;
  percentageChange: number;
  hoursAgo: number;
}

export interface SprintKPIDataWithEvolution extends SprintKPIData {
  evolution?: SprintEvolution;
}
```

#### 3.4 Exibição no SprintKPIBar

Quando houver dados de evolução, mostrar linha adicional:

```text
📈 +R$ 8.300 em 48h (↑22%)
```

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `package.json` | **MODIFICAR** - Adicionar `canvas-confetti` |
| `src/components/dashboard/ConfettiCelebration.tsx` | **CRIAR** |
| `src/components/dashboard/SprintHeader.tsx` | **CRIAR** |
| `src/components/dashboard/SprintKPIBar.tsx` | **MODIFICAR** - Confetti + ícones de urgência |
| `src/components/dashboard/SprintPage.tsx` | **MODIFICAR** - Integrar header + stats globais |
| `src/types/kpi.ts` | **MODIFICAR** - Adicionar interfaces de evolução |
| `src/lib/sprintStorage.ts` | **CRIAR** - Funções de snapshot |
| `src/lib/kpiUtils.ts` | **MODIFICAR** - Função `calculateGlobalSprintStats` |
| `src/pages/Index.tsx` | **MODIFICAR** - Salvar snapshot ao carregar dados |
| `supabase/migrations/xxx.sql` | **CRIAR** - Tabela `sprint_snapshots` |

---

### Fluxo de Dados Completo

```text
Upload Excel / Carregamento
         │
         ▼
  handleDataLoaded()
         │
         ├─► calculateSprintData()
         │         │
         │         ▼
         │   Retorna SprintKPIData[]
         │
         ├─► saveSprintSnapshot() → Supabase
         │
         └─► getLatestSnapshot(>24h)
                   │
                   ▼
           calculateEvolution()
                   │
                   ▼
           SprintKPIDataWithEvolution[]
                   │
                   ▼
             SprintPage
               ├─► SprintHeader (métricas globais)
               └─► SprintKPIBar[] (com evolução + confetti)
```

---

### Resultado Visual Final

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  🎯 SPRINT SEMANAL                                    [Assessor ▼] [Mês ▼]   │
│  MISSÃO: Zerar o gap até a meta                                              │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   ✓ 2/6 ZERADOS       │
│  │   OBJETIVO   │  │  PRODUZIDO   │  │ AINDA FALTA │                        │
│  │   R$ 145K    │  │   R$ 82K     │  │   R$ 63K    │                        │
│  └──────────────┘  └──────────────┘  └──────────────┘                        │
│                                                                              │
│  [████████████████████████████░░░░░░░░░░░░░░] 56% zerado                     │
│  📊 Evolução 48h: +R$ 28.500 produzidos | +1 KPI zerado                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🔥 Receita                                         Objetivo: R$ 45.200      │
│  ███████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  42%                    │
│  📈 +R$ 8.300 em 48h (↑22%)                                                  │
│  Falta: Hingrid -R$ 18.5K | Jose -R$ 12.7K                                   │
│                                                                              │
│  🎯 Diversificação                                  Objetivo: R$ 8.100       │
│  ██████████████████████████████████████░░░░░░░░░░░░  82%                     │
│  📈 +R$ 4.200 em 48h (↑52%)                                                  │
│  Falta: Marcela -R$ 5.2K                                                     │
│                                                                              │
│  🏆🎉 Captação NET                                      ZERADO!              │  
│  ████████████████████████████████████████████████████  100%   ✨ CONFETTI ✨ │
│  ✓ Meta atingida! +R$ 12.000 em 48h finalizou o sprint                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Comportamento do Confetti

1. **Trigger**: Quando `isCompleted` muda de `false` para `true`
2. **Cores**: Dourado (#FFE066, #E6A800), Verde (#22C55E), Branco
3. **Duração**: ~2 segundos com partículas caindo
4. **Dupla explosão**: Burst principal + burst secundário menor após 150ms
5. **Posição**: Originando do centro da barra que foi zerada
6. **Controle**: Só dispara uma vez por KPI (não re-dispara ao navegar)

