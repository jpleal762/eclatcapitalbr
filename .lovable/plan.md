
## Plano: Simplificar Card de Primeiras Reuniões Agendadas Semana

### Objetivo
Remover o gráfico gauge e a meta do card, exibindo apenas:
1. O número total de reuniões realizadas (destaque grande)
2. Lista de assessores com suas quantidades

---

### Mudanças no Componente

**Arquivo: `src/components/dashboard/AgendadasCard.tsx`**

#### 1. Simplificar Props (remover target e percentage)
```typescript
// ANTES:
interface AgendadasCardProps {
  agendadasValue: number;
  agendadasTarget: number;
  agendadasPercentage: number;
  assessorData: Array<{ name: string; value: number }>;
}

// DEPOIS:
interface AgendadasCardProps {
  agendadasValue: number;
  assessorData: Array<{ name: string; value: number }>;
}
```

#### 2. Substituir Gauge por Número Grande
Remover todo o SVG do gauge e exibir apenas o número de forma destacada:

```text
┌─────────────────────────────────────────────┐
│ Primeiras Reuniões Agendadas Semana         │
├───────────────┬─────────────────────────────┤
│               │  Por Assessor               │
│     12        │  Hingrid ............... 3  │
│   reuniões    │  José Júlio ............ 4  │
│               │  Marcela ............... 2  │
│               │  Onacilda .............. 1  │
│               │  Rômulo ................ 2  │
└───────────────┴─────────────────────────────┘
```

#### 3. Estrutura do Novo Layout
- **Lado esquerdo**: Número grande centralizado com label "reuniões" abaixo
- **Lado direito**: Lista de assessores (mantém comportamento atual)
- Remover: gauge SVG, texto de meta, cálculos de circumference/progress

---

### Mudanças no Index.tsx

**Arquivo: `src/pages/Index.tsx`**

#### 1. Remover props não utilizados
```typescript
// ANTES (linhas 565-574):
<AgendadasCard
  agendadasValue={dashboardData.gaugeKPIs[2]?.secondaryValue || 0}
  agendadasTarget={agendadasWeeklyTarget}
  agendadasPercentage={...}
  assessorData={assessorAgendadas}
/>

// DEPOIS:
<AgendadasCard
  agendadasValue={dashboardData.gaugeKPIs[2]?.secondaryValue || 0}
  assessorData={assessorAgendadas}
/>
```

#### 2. Remover cálculo de agendadasWeeklyTarget
O `useMemo` nas linhas 286-305 pode ser removido, pois não será mais utilizado.

---

### Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/AgendadasCard.tsx` | Simplificar - remover gauge, manter número e lista |
| `src/pages/Index.tsx` | Remover props de target/percentage e useMemo de target |

---

### Resultado Visual

O card mantém o layout horizontal (número à esquerda, lista à direita), mas agora:
- Exibe apenas o número total em destaque grande
- Mostra o label "reuniões" abaixo do número
- Lista de assessores permanece igual
- Sem gráfico gauge
- Sem informação de meta

