
## Plano: Corrigir Produtos que Não Aparecem e Remover Menu de Seleção

### Problema Identificado

Os produtos "Ativação", "Habilitação" e "Reuniões" não aparecem porque há uma **incompatibilidade nos nomes das categorias**:

| Em `SPRINT_PRODUCTS` (types/kpi.ts) | Em `calculateSprintData` (kpiUtils.ts) |
|-------------------------------------|----------------------------------------|
| `"Primeira reunião"` (com acento)   | `"Primeira reuniao"` (sem acento)      |
| `"Habilitação"` (com acento)        | `"Habilitacao"` (sem acento)           |
| `"Ativação"` (com acento)           | `"Ativacao"` (sem acento)              |

O filtro `selectedProducts.includes(kpi.category)` falha porque os nomes não batem.

---

### Correções

#### 1. Corrigir Nomes das Categorias em `SPRINT_PRODUCTS`

**Arquivo: `src/types/kpi.ts`**

Alterar as categorias para usar os mesmos nomes sem acento que o resto do sistema usa:

```typescript
export const SPRINT_PRODUCTS: SprintProductConfig[] = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  { category: "Receita", label: "Receita", isCurrency: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação", isCurrency: true },
  { category: "Primeira reuniao", label: "Reuniões", isCurrency: false },      // Corrigido
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },        // Corrigido
  { category: "Ativacao", label: "Ativação", isCurrency: false },              // Corrigido
];
```

#### 2. Remover Menu de Seleção de Produtos do Header

**Arquivo: `src/components/dashboard/SprintHeader.tsx`**

Remover a seção de checkboxes de seleção de produtos (linhas 105-118):

```tsx
// REMOVER esta seção inteira:
{/* Product Selection Checkboxes */}
<div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-3 p-2 bg-muted/20 rounded-lg">
  ...
</div>
```

Também remover as props desnecessárias:
- `availableProducts`
- `selectedProducts`
- `onProductToggle`

**Arquivo: `src/components/dashboard/SprintPage.tsx`**

- Remover o estado `selectedProducts` e a função `handleProductToggle`
- Mostrar todos os produtos (sem filtro)
- Simplificar as props passadas para o `SprintHeader`

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/types/kpi.ts` | **MODIFICAR** - Corrigir nomes das categorias (remover acentos) |
| `src/components/dashboard/SprintHeader.tsx` | **MODIFICAR** - Remover seção de checkboxes e props relacionadas |
| `src/components/dashboard/SprintPage.tsx` | **MODIFICAR** - Remover estado de seleção e mostrar todos os produtos |

---

### Resultado Esperado

- Todos os 6 KPIs (Captação NET, Receita, Diversificação, Reuniões, Habilitação, Ativação) aparecerão
- O header ficará mais limpo, sem o menu de seleção de produtos
- A área de "Meta Total", "Produzido", "O que Falta" ficará em destaque
