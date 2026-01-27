
## Plano: Adicionar Receita Parceiros no Meta Semanal e Sprint

### Objetivo

Incluir o KPI "Receita Parceiros" (categoria interna: `Parceiros Tri`) em dois locais:
1. **Card Meta Semanal Acumulada** - Com Meta, Realizado e Falta
2. **Página Sprint** - Seguindo o modelo dos demais KPIs

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/kpiUtils.ts` | **MODIFICAR** - Adicionar "Parceiros Tri" às listas de categorias |
| `src/types/kpi.ts` | **MODIFICAR** - Adicionar "Parceiros Tri" ao SPRINT_PRODUCTS |

---

### Detalhes Técnicos

#### 1. Adicionar "Receita Parceiros" ao Meta Semanal (kpiUtils.ts)

**Localização**: Linhas 858-865

```typescript
// ANTES: 6 categorias
const metaSemanalCategories = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  { category: "Receita", label: "Receita", isCurrency: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação (ROA>1,5)", isCurrency: true },
  { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false },
];

// DEPOIS: 7 categorias (adicionado Parceiros Tri)
const metaSemanalCategories = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  { category: "Receita", label: "Receita", isCurrency: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação (ROA>1,5)", isCurrency: true },
  { category: "Parceiros Tri", label: "Receita Parceiros", isCurrency: true },
  { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false },
];
```

**Nota**: A posição escolhida (após Diversificação) agrupa os KPIs monetários antes dos não-monetários (Reuniões, Habilitação, Ativação).

---

#### 2. Adicionar "Receita Parceiros" ao calculateSprintData (kpiUtils.ts)

**Localização**: Linhas 1188-1195

```typescript
// ANTES: 6 categorias
const categories = [
  { category: "Captação net", label: "Captação NET", isCurrency: true, includeEmpilhada: false },
  { category: "Receita", label: "Receita", isCurrency: true, includeEmpilhada: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true, includeEmpilhada: false },
  { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false, includeEmpilhada: false },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false, includeEmpilhada: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false, includeEmpilhada: false },
];

// DEPOIS: 7 categorias (adicionado Parceiros Tri)
const categories = [
  { category: "Captação net", label: "Captação NET", isCurrency: true, includeEmpilhada: false },
  { category: "Receita", label: "Receita", isCurrency: true, includeEmpilhada: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true, includeEmpilhada: false },
  { category: "Parceiros Tri", label: "Receita Parceiros", isCurrency: true, includeEmpilhada: false },
  { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false, includeEmpilhada: false },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false, includeEmpilhada: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false, includeEmpilhada: false },
];
```

---

#### 3. Adicionar checkbox "Receita Parceiros" no Sprint (types/kpi.ts)

**Localização**: Linhas 140-147

```typescript
// ANTES: 6 produtos
export const SPRINT_PRODUCTS: SprintProductConfig[] = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  { category: "Receita", label: "Receita", isCurrency: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true },
  { category: "Primeira reuniao", label: "Reuniões", isCurrency: false },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false },
];

// DEPOIS: 7 produtos (adicionado Parceiros Tri)
export const SPRINT_PRODUCTS: SprintProductConfig[] = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  { category: "Receita", label: "Receita", isCurrency: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true },
  { category: "Parceiros Tri", label: "Parceiros", isCurrency: true },
  { category: "Primeira reuniao", label: "Reuniões", isCurrency: false },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false },
];
```

---

#### 4. Atualizar weeklyCategories para cálculo de percentual (kpiUtils.ts)

**Localização**: Linhas 894-901

Para manter consistência no cálculo do percentual Semanal/Mensal:

```typescript
// ANTES
const weeklyCategories = [
  "Habilitacao",
  "Ativacao",
  "Captacao net",
  "Diversificada ( ROA>1,5)",
  "Receita",
  "Primeira Reuniao"
];

// DEPOIS (adicionado Parceiros Tri)
const weeklyCategories = [
  "Habilitacao",
  "Ativacao",
  "Captacao net",
  "Diversificada ( ROA>1,5)",
  "Receita",
  "Parceiros Tri",
  "Primeira Reuniao"
];
```

---

### Comportamento Final

#### Card Meta Semanal Acumulada (Frente)
```text
┌──────────────────────────────────────────────────┐
│ Meta Semanal Acumulada                           │
├──────────────────────────────────────────────────┤
│ KPI                    │  Meta      │ Realizado  │
│────────────────────────│────────────│────────────│
│ Captação NET           │ R$ 112.5K  │ R$ 85.3K   │
│ Receita                │ R$ 45.0K   │ R$ 32.1K   │
│ Diversificação         │ R$ 25.0K   │ R$ 18.5K   │
│ Receita Parceiros  ← NOVO │ R$ 15.0K │ R$ 8.2K   │
│ Primeiras Reuniões     │ 5          │ 3          │
│ Habilitação            │ 4          │ 2          │
│ Ativação               │ 3          │ 1          │
└──────────────────────────────────────────────────┘
```

#### Card Meta Semanal (Verso - Falta)
```text
┌──────────────────────────────────────────────────┐
│ Falta para Meta Semanal                          │
├──────────────────────────────────────────────────┤
│ KPI                    │  Meta      │ Falta      │
│────────────────────────│────────────│────────────│
│ Receita Parceiros  ← NOVO │ R$ 15.0K │ R$ 6.8K   │
│ ...                    │            │            │
└──────────────────────────────────────────────────┘
```

#### Página Sprint
```text
┌──────────────────────────────────────────────────┐
│ ☑ Captação  ☑ Receita  ☑ Diversificação          │
│ ☑ Parceiros ← NOVO  ☑ Reuniões  ☑ Habilitação   │
├──────────────────────────────────────────────────┤
│ 🔥 Receita Parceiros                        42%  │
│ Meta: R$ 15K │ Real: R$ 6.3K │ Falta: R$ 8.7K   │
│ ████████████░░░░░░░░░░░░░░░                      │
│ Falta por Assessor:                              │
│ ┌─────────┬─────────┬─────────┬─────────┐       │
│ │ Marcelo │ José    │ Hingrid │ ✓ Ana   │       │
│ │ R$ 2.1K │ R$ 1.8K │ R$ 1.5K │         │       │
│ └─────────┴─────────┴─────────┴─────────┘       │
└──────────────────────────────────────────────────┘
```

---

### Benefícios

1. **Visibilidade completa** - Receita Parceiros agora aparece nos dois principais painéis de acompanhamento semanal
2. **Consistência** - Segue exatamente o mesmo modelo visual e de cálculo dos demais KPIs
3. **Falta por Assessor** - Sprint mostrará breakdown individual para Parceiros
4. **Checkbox controlável** - Usuário pode mostrar/ocultar Parceiros no Sprint como os demais
