

## Plano: Adicionar Seleção de Produtos na Tela Sprint

### Objetivo

Adicionar checkboxes para que o usuário possa selecionar quais KPIs (produtos) deseja visualizar na tela Sprint, similar ao padrão já existente no DashboardSidebar.

### Arquitetura Proposta

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│  [Assessor ▼]  [Mês ▼]     ☑ Captação ☑ Receita ☑ Diversificação ☐ Reuniões  │
│                            ☑ Habilitação ☑ Ativação                           │
├───────────────────────────────────────────────────────────────────────────────┤
│  🔥 Captação NET                                                         45%  │
│  ...                                                                          │
├───────────────────────────────────────────────────────────────────────────────┤
│  🔥 Receita                                                              62%  │
│  ...                                                                          │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/SprintPage.tsx` | **MODIFICAR** - Adicionar checkboxes de seleção de produtos |
| `src/pages/Index.tsx` | **MODIFICAR** - Gerenciar estado de produtos selecionados e persistir no localStorage |

---

### Detalhes Técnicos

#### 1. Adicionar Estado de Seleção no Index.tsx

Criar estado para controlar quais produtos estão selecionados, com persistência no localStorage:

```tsx
const SPRINT_PRODUCTS_STORAGE_KEY = "sprint-selected-products";

// Estado inicial: todos selecionados
const [selectedSprintProducts, setSelectedSprintProducts] = useState<Set<string>>(() => {
  const saved = localStorage.getItem(SPRINT_PRODUCTS_STORAGE_KEY);
  if (saved) {
    try {
      return new Set(JSON.parse(saved));
    } catch {
      return new Set(SPRINT_PRODUCTS.map(p => p.category));
    }
  }
  return new Set(SPRINT_PRODUCTS.map(p => p.category));
});

// Persistir no localStorage
useEffect(() => {
  localStorage.setItem(SPRINT_PRODUCTS_STORAGE_KEY, JSON.stringify([...selectedSprintProducts]));
}, [selectedSprintProducts]);

// Filtrar sprintData pelos produtos selecionados
const filteredSprintData = useMemo(
  () => sprintData.filter(kpi => selectedSprintProducts.has(kpi.category)),
  [sprintData, selectedSprintProducts]
);
```

#### 2. Modificar SprintPage.tsx

Adicionar props e UI de checkboxes:

```tsx
interface SprintPageProps {
  sprintData: SprintKPIData[];
  assessors: string[];
  months: string[];
  selectedAssessor: string;
  selectedMonth: string;
  onAssessorChange: (assessor: string) => void;
  onMonthChange: (month: string) => void;
  isLocked?: boolean;
  evolutionMap?: Map<string, SprintEvolution>;
  // Novos props para seleção de produtos
  selectedProducts: Set<string>;
  onProductToggle: (category: string) => void;
}
```

Adicionar seção de checkboxes compactos no header:

```tsx
import { SPRINT_PRODUCTS } from "@/types/kpi";
import { Checkbox } from "@/components/ui/checkbox";

// Na área de filtros, adicionar linha de checkboxes:
<div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0 flex-wrap">
  {/* Checkboxes de produtos - linha compacta */}
  <div className="flex items-center gap-3 flex-wrap">
    {SPRINT_PRODUCTS.map((product) => (
      <label 
        key={product.category} 
        className="flex items-center gap-1.5 cursor-pointer text-[10px] lg:text-xs"
      >
        <Checkbox
          checked={selectedProducts.has(product.category)}
          onCheckedChange={() => onProductToggle(product.category)}
          className="h-3 w-3 lg:h-4 lg:w-4"
        />
        <span className="text-muted-foreground hover:text-foreground transition-colors">
          {product.label}
        </span>
      </label>
    ))}
  </div>
  
  {/* Filtros existentes */}
  <div className="flex items-center gap-2">
    <Select ... />
    <Select ... />
  </div>
</div>
```

#### 3. Atualizar Chamada do SprintPage no Index.tsx

Passar os novos props:

```tsx
<SprintPage
  sprintData={filteredSprintData}  // ← Dados filtrados
  assessors={assessors}
  months={months}
  selectedAssessor={filters.assessor}
  selectedMonth={filters.month}
  onAssessorChange={(value) => setFilters({ ...filters, assessor: value })}
  onMonthChange={(value) => setFilters({ ...filters, month: value })}
  isLocked={isViewLocked}
  evolutionMap={evolutionMap}
  selectedProducts={selectedSprintProducts}  // ← Novo
  onProductToggle={(category) => {           // ← Novo
    setSelectedSprintProducts(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }}
/>
```

---

### Layout Visual

```text
ANTES:
┌──────────────────────────────────────────────────────────────────────┐
│                                            [Assessor ▼] [Mês ▼]     │
├──────────────────────────────────────────────────────────────────────┤
│  (6 KPIs sempre visíveis)                                            │
└──────────────────────────────────────────────────────────────────────┘

DEPOIS:
┌──────────────────────────────────────────────────────────────────────┐
│  ☑ Captação ☑ Receita ☑ Diversificação      [Assessor ▼] [Mês ▼]    │
│  ☑ Reuniões ☑ Habilitação ☑ Ativação                                │
├──────────────────────────────────────────────────────────────────────┤
│  (Apenas KPIs selecionados aparecem)                                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Benefícios

1. **Flexibilidade** - Usuário escolhe quais KPIs visualizar
2. **Persistência** - Seleção salva no localStorage, mantém preferências
3. **Design compacto** - Checkboxes pequenos, não ocupam muito espaço
4. **Consistência** - Segue padrão já existente no DashboardSidebar
5. **Mensagem amigável** - Se nenhum produto selecionado, mostra "Selecione ao menos um produto"

