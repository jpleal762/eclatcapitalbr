

## Plano: Tela "Tática da Semana"

### Objetivo
Criar uma nova página que exibe 3 táticas semanais por assessor, com visual amigável, fácil leitura e integração com os dados de KPI existentes.

---

### Design Visual (Sugestões)

**Opção Recomendada: Cards por Assessor**

```text
+------------------------------------------------------------------+
| TÁTICA DA SEMANA                     [Assessor ▾] [Mês ▾]        |
+------------------------------------------------------------------+
|                                                                  |
| ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────┐|
| │  🔵 BRUNO           │  │  🟢 CAROLINA        │  │  🟡 ANA     │|
| │  ─────────────────  │  │  ─────────────────  │  │  ─────────  │|
| │  1. Ligar para 5    │  │  1. Blitz de 20     │  │  1. Follow  │|
| │     clientes com    │  │     ligações        │  │     up nas  │|
| │     CDB vencendo    │  │     (10h-12h)       │  │     propost │|
| │  ○ Captação NET     │  │  ○ Reuniões         │  │  ○ Receita  │|
| │                     │  │                     │  │             │|
| │  2. Propor FIIs     │  │  2. Pedir 2         │  │  2. Revisar │|
| │     para 3 clientes │  │     indicações      │  │     3 carte │|
| │  ○ Diversificação   │  │  ○ Prospecção       │  │  ○ ROA      │|
| │                     │  │                     │  │             │|
| │  3. Champion Letter │  │  3. Recontatar      │  │  3. Ligar   │|
| │     em aportes      │  │     leads frios     │  │     PJ1 XP  │|
| │  ○ NNM              │  │  ○ Pipeline         │  │  ○ PJ       │|
| └─────────────────────┘  └─────────────────────┘  └─────────────┘|
|                                                                  |
+------------------------------------------------------------------+
```

**Características do Design:**

1. **Avatar/Inicial colorida** - Identificação rápida do assessor
2. **Texto conciso** - Máximo 2 linhas por tática
3. **Badge de categoria** - Indica qual KPI a tática impacta
4. **Cores de status** - Verde (feito), Amarelo (em andamento), Cinza (pendente)
5. **Responsivo** - 3 colunas no desktop, 1 coluna no mobile

---

### Arquivos a Criar/Modificar

#### 1. **Criar** `src/components/dashboard/TacticsWeekPage.tsx`

Componente principal da página com:
- Grid de cards de assessores
- 3 táticas por assessor
- Filtro de assessor e mês
- Modo de exibição: todos ou individual

#### 2. **Criar** `src/components/dashboard/AssessorTacticsCard.tsx`

Card individual de assessor com:
- Cabeçalho com avatar/nome
- Lista de 3 táticas
- Badge de categoria KPI
- Checkbox de status (opcional)

#### 3. **Modificar** `src/components/dashboard/PageToggle.tsx`

Adicionar navegação para a nova página:
- Novo tipo: `"tactics"`
- Ícone sugerido: `Lightbulb` ou `ClipboardList`
- Tooltip: "Tática da Semana"

#### 4. **Modificar** `src/pages/Index.tsx`

- Importar `TacticsWeekPage`
- Adicionar ao render condicional
- **Opcional:** Adicionar ao giro automático

#### 5. **Modificar** `src/types/kpi.ts`

Adicionar tipos para táticas:

```tsx
export interface WeeklyTactic {
  id: string;
  text: string;
  category: string;       // KPI relacionado
  status: "pending" | "in_progress" | "done";
}

export interface AssessorTactics {
  assessorName: string;
  tactics: WeeklyTactic[];
}
```

---

### Fonte dos Dados (Opções)

**Opção A: Táticas pré-definidas do Playbook (Recomendada inicialmente)**
- Usa o `KPI_PLAYBOOK` já existente
- Rotaciona táticas por assessor baseado nos gaps de KPI
- Sem necessidade de entrada manual

**Opção B: Geração via IA**
- Chama edge function que analisa gaps individuais
- Gera 3 táticas personalizadas por assessor
- Mais dinâmico, mas requer API calls

**Opção C: Entrada manual**
- Interface para gestor inserir táticas
- Salvamento no Lovable Cloud (banco de dados)
- Maior controle, mas requer manutenção

---

### Detalhes de Implementação

**Cores dos avatares:**
```tsx
const AVATAR_COLORS = [
  "bg-blue-500",    // Bruno
  "bg-green-500",   // Carolina
  "bg-amber-500",   // Ana
  "bg-purple-500",  // Paulo
  "bg-rose-500",    // Maria
];
```

**Badges de categoria:**
```tsx
const CATEGORY_BADGES = {
  "Captação NET": { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  "Receita": { bg: "bg-blue-500/10", text: "text-blue-600" },
  "Reuniões": { bg: "bg-amber-500/10", text: "text-amber-600" },
  "Diversificação": { bg: "bg-purple-500/10", text: "text-purple-600" },
};
```

---

### Layout Responsivo

| Tela | Colunas | Comportamento |
|------|---------|---------------|
| Desktop/TV (lg+) | 3-4 colunas | Grid fixo, sem scroll |
| Tablet (md) | 2 colunas | Grid com scroll vertical |
| Mobile | 1 coluna | Cards empilhados |

---

### Resultado Esperado

- Visual limpo e escaneável (ideal para TV)
- Cada assessor vê suas 3 prioridades da semana
- Gestor visualiza todas as táticas do time de uma vez
- Fácil identificação de qual KPI cada tática impacta
- Possibilidade futura de marcar como concluído

