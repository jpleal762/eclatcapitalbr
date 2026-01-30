

## Plano: Adicionar Página "Prospecção e Qualidade"

### Objetivo
Criar uma nova página no dashboard chamada "Prospecção e Qualidade" que exibirá os seguintes KPIs:
- Contatos
- Agendamentos
- Leads por Referência
- Financial Planning

---

### Arquivos a Criar/Modificar

#### 1. **Criar** `src/components/dashboard/ProspectionQualityPage.tsx`

Nova página seguindo o padrão das páginas existentes (AnalysisPage, SprintPage), com:
- Filtros de assessor, mês e ano
- Cards/barras para cada KPI (Contatos, Agendamentos, Leads por Referência, Financial Planning)
- Layout responsivo (mobile/desktop/TV)

---

#### 2. **Modificar** `src/components/dashboard/PageToggle.tsx`

Adicionar a nova página à navegação:

| Atual | Novo |
|-------|------|
| 3 páginas | 4 páginas |
| `dashboard → analysis → sprint` | `dashboard → analysis → sprint → prospection` |

**Alterações:**
- Adicionar `"prospection"` ao tipo `PageType`
- Adicionar ícone (sugestão: `Users` ou `Target`)
- Atualizar `pageOrder` e `pageConfig`

```tsx
export type PageType = "dashboard" | "analysis" | "sprint" | "prospection";

const pageOrder: PageType[] = ["dashboard", "analysis", "sprint", "prospection"];

const pageConfig = {
  // ...existentes...
  prospection: {
    icon: <Users className="h-4 w-4" />,
    nextTooltip: "Voltar ao Dashboard",
  },
};
```

---

#### 3. **Modificar** `src/pages/Index.tsx`

- Importar a nova página `ProspectionQualityPage`
- Adicionar renderização condicional quando `currentPage === "prospection"`
- Atualizar rotação automática para incluir a 4ª página

---

#### 4. **Modificar** `src/types/kpi.ts`

Adicionar constantes para os novos KPIs de prospecção:

```tsx
export const PROSPECTION_QUALITY_KPIS = [
  { category: "Contatos", label: "Contatos", isCurrency: false },
  { category: "Agendamentos", label: "Agendamentos", isCurrency: false },
  { category: "Leads Referência", label: "Leads por Referência", isCurrency: false },
  { category: "Financial Planning", label: "Financial Planning", isCurrency: false },
];
```

---

### Estrutura Visual da Nova Página

```text
+----------------------------------------------------------+
| Prospecção e Qualidade      [Assessor] [Mês] [Ano]       |
+----------------------------------------------------------+
|                                                          |
| ┌─────────────────────────────────────────────────────┐  |
| │ CONTATOS           Meta: 50    Real: 32    64%      │  |
| │ ██████████████░░░░░░░░░                             │  |
| └─────────────────────────────────────────────────────┘  |
|                                                          |
| ┌─────────────────────────────────────────────────────┐  |
| │ AGENDAMENTOS       Meta: 20    Real: 15    75%      │  |
| │ █████████████████░░░░░░░                            │  |
| └─────────────────────────────────────────────────────┘  |
|                                                          |
| ┌─────────────────────────────────────────────────────┐  |
| │ LEADS REFERÊNCIA   Meta: 30    Real: 22    73%      │  |
| │ ████████████████░░░░░░░░                            │  |
| └─────────────────────────────────────────────────────┘  |
|                                                          |
| ┌─────────────────────────────────────────────────────┐  |
| │ FINANCIAL PLANNING Meta: 10    Real: 8     80%      │  |
| │ ██████████████████████░░░░                          │  |
| └─────────────────────────────────────────────────────┘  |
|                                                          |
+----------------------------------------------------------+
```

---

### Detalhes Técnicos

1. **Dados**: Os KPIs serão lidos do mesmo arquivo Excel, esperando categorias:
   - "Contatos"
   - "Agendamentos" 
   - "Leads Referência"
   - "Financial Planning"

2. **Cálculos**: Reutilizar funções existentes de `kpiUtils.ts`:
   - `filterByCategory()`
   - `getMonthValue()`
   - `calculateIdealRhythm()`

3. **Componentes**: Reutilizar ou adaptar `QuarterlyKPIBar` para exibir as barras de progresso

4. **Rotação Automática**: Ajustar de 3 para 4 páginas (cada uma com ~90s de exibição)

---

### Resultado Final

- Nova página acessível via botão de navegação no header
- Rotação automática inclui a nova página
- Layout consistente com as demais páginas do dashboard
- Filtros funcionais (assessor, período)

