

## Plano: Tela Sprint com Seleção de Produtos e Destaque em "O que Falta"

### Visão Geral

Três melhorias para a tela Sprint:
1. **Checkboxes para seleção de produtos**: Permitir escolher quais KPIs/produtos aparecem nas barras
2. **Destaque no "O que Falta"**: Tornar o objetivo e o valor restante muito mais evidentes visualmente
3. **Cálculos globais filtrados**: Recalcular stats do header baseado apenas nos produtos selecionados

---

### Visualização Proposta

```text
+-------------------------------------------------------------------------+
|  SPRINT SEMANAL - MISSÃO: Zerar o gap                                    |
|                                                                         |
|  ┌─────────────────────────────────────────────────────────────────────┐|
|  │  SELECIONAR PRODUTOS:                                               ||
|  │  [✓] Captação NET   [✓] Receita   [✓] Diversificação               ||
|  │  [✓] Primeiras Reuniões   [ ] Habilitação   [ ] Ativação           ||
|  └─────────────────────────────────────────────────────────────────────┘|
|                                                                         |
|  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────┐ |
|  │   META TOTAL     │   │   PRODUZIDO      │   │   O QUE FALTA        │ |
|  │   R$ 145K        │   │   R$ 82K         │   │ ███  R$ 63K  ███     │ |
|  │   (objetivo)     │   │   (realizado)    │   │ !!! ZERAR !!!        │ |
|  └──────────────────┘   └──────────────────┘   └──────────────────────┘ |
|                                                                         |
+-------------------------------------------------------------------------+
|                                                                         |
|  ┌─────────────────────────────────────────────────────────────────────┐|
|  │  🔥 Receita                                                         ||
|  │  ╔══════════════════════════════════════════════════════════════╗  ||
|  │  ║  META: R$ 85.000   │   REALIZADO: R$ 42.300   │  FALTA: R$ 42.7K ║||
|  │  ╚══════════════════════════════════════════════════════════════╝  ||
|  │  [████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 49%       ||
|  │                                                                     ||
|  │  📈 +R$ 8.300 em 48h                                               ||
|  │  Falta: Hingrid -R$ 18.5K | Jose -R$ 12.7K                         ||
|  └─────────────────────────────────────────────────────────────────────┘|
|                                                                         |
+-------------------------------------------------------------------------+
```

---

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/dashboard/SprintPage.tsx` | **MODIFICAR** - Adicionar estado de produtos selecionados e filtrar dados |
| `src/components/dashboard/SprintHeader.tsx` | **MODIFICAR** - Adicionar checkboxes de produtos e destaque visual |
| `src/components/dashboard/SprintKPIBar.tsx` | **MODIFICAR** - Redesign para destacar Meta/Realizado/Falta |
| `src/types/kpi.ts` | **MODIFICAR** - Adicionar interface para configuracao de produtos |

---

### Detalhes Tecnicos

#### 1. Nova Interface para Produtos Selecionaveis

**Arquivo: `src/types/kpi.ts`**

```typescript
export interface SprintProductConfig {
  category: string;
  label: string;
  isCurrency: boolean;
  enabled: boolean;  // Novo - se esta selecionado
}

// Lista padrao de produtos para Sprint
export const SPRINT_PRODUCTS: SprintProductConfig[] = [
  { category: "Captacao net", label: "Captacao NET", isCurrency: true, enabled: true },
  { category: "Receita", label: "Receita", isCurrency: true, enabled: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificacao", isCurrency: true, enabled: true },
  { category: "Primeira reuniao", label: "Primeiras Reunioes", isCurrency: false, enabled: true },
  { category: "Habilitacao", label: "Habilitacao", isCurrency: false, enabled: true },
  { category: "Ativacao", label: "Ativacao", isCurrency: false, enabled: true },
];
```

#### 2. Estado de Selecao no SprintPage

**Arquivo: `src/components/dashboard/SprintPage.tsx`**

Adicionar estado para gerenciar quais produtos estao selecionados:

```typescript
interface SprintPageProps {
  // ... props existentes
  selectedProducts: string[];              // Novo - categorias selecionadas
  onProductToggle: (category: string) => void;  // Novo - callback para toggle
}
```

Logica de filtragem:
```typescript
// Filtrar dados baseado nos produtos selecionados
const filteredSprintData = sprintData.filter(
  kpi => selectedProducts.includes(kpi.category)
);

// Recalcular stats globais apenas com produtos selecionados
const globalStats = calculateGlobalStats(filteredSprintData);
```

#### 3. Checkboxes no SprintHeader

**Arquivo: `src/components/dashboard/SprintHeader.tsx`**

Adicionar nova props e secao de checkboxes:

```typescript
interface SprintHeaderProps {
  // ... props existentes
  availableProducts: SprintProductConfig[];
  selectedProducts: string[];
  onProductToggle: (category: string) => void;
}
```

Renderizar checkboxes em linha horizontal:

```tsx
<div className="flex flex-wrap gap-2 lg:gap-3 mb-3 p-2 bg-muted/20 rounded-lg">
  <span className="text-xs text-muted-foreground mr-2">Produtos:</span>
  {availableProducts.map(product => (
    <label key={product.category} className="flex items-center gap-1 cursor-pointer">
      <Checkbox 
        checked={selectedProducts.includes(product.category)}
        onCheckedChange={() => onProductToggle(product.category)}
      />
      <span className="text-xs lg:text-sm">{product.label}</span>
    </label>
  ))}
</div>
```

#### 4. Destaque Visual no "O que Falta" (Header)

**Arquivo: `src/components/dashboard/SprintHeader.tsx`**

Redesign do card "Ainda Falta" para maior destaque:

```tsx
{/* Card O QUE FALTA - com destaque visual */}
<div className={cn(
  "rounded-lg p-3 lg:p-4 text-center relative overflow-hidden",
  totalStillMissing > 0 
    ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-destructive/50" 
    : "bg-green-500/20 border-2 border-green-500/50"
)}>
  {/* Icone de alerta pulsante se falta algo */}
  {totalStillMissing > 0 && (
    <div className="absolute top-1 right-1">
      <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
    </div>
  )}
  
  <p className="text-[10px] lg:text-xs uppercase tracking-wide mb-1 font-bold">
    O QUE FALTA
  </p>
  <p className={cn(
    "text-lg lg:text-2xl font-black",  // Maior e mais bold
    totalStillMissing > 0 ? "text-destructive" : "text-green-500"
  )}>
    {totalStillMissing > 0 ? formatValue(totalStillMissing) : "ZERADO!"}
  </p>
  {totalStillMissing > 0 && (
    <p className="text-[9px] lg:text-[10px] text-destructive/80 font-medium mt-1">
      OBJETIVO: ZERAR
    </p>
  )}
</div>
```

#### 5. Redesign do SprintKPIBar com Destaque

**Arquivo: `src/components/dashboard/SprintKPIBar.tsx`**

Adicionar secao proeminente com Meta/Realizado/Falta:

```tsx
{/* Secao de Destaque: Meta | Realizado | Falta */}
<div className="grid grid-cols-3 gap-2 mb-2 p-2 bg-muted/10 rounded-lg border border-border/50">
  {/* Meta Semanal */}
  <div className="text-center">
    <p className="text-[9px] lg:text-[10px] text-muted-foreground uppercase">Meta</p>
    <p className="text-xs lg:text-sm font-semibold text-foreground">
      {formatValue(totalTarget, isCurrency)}
    </p>
  </div>
  
  {/* Realizado */}
  <div className="text-center">
    <p className="text-[9px] lg:text-[10px] text-muted-foreground uppercase">Realizado</p>
    <p className="text-xs lg:text-sm font-semibold text-green-500">
      {formatValue(totalRealized, isCurrency)}
    </p>
  </div>
  
  {/* O QUE FALTA - Destaque */}
  <div className={cn(
    "text-center rounded px-2 py-1",
    isCompleted 
      ? "bg-green-500/20" 
      : "bg-destructive/10 border border-destructive/30"
  )}>
    <p className="text-[9px] lg:text-[10px] uppercase font-bold">
      {isCompleted ? "Zerado" : "Falta"}
    </p>
    <p className={cn(
      "text-xs lg:text-sm font-black",
      isCompleted ? "text-green-500" : "text-destructive"
    )}>
      {isCompleted ? "✓" : formatValue(totalRemaining, isCurrency)}
    </p>
  </div>
</div>
```

---

### Fluxo de Dados

```text
Index.tsx
    │
    ├─► Estado: selectedProducts = ["Captacao net", "Receita", ...]
    │
    └─► SprintPage
            │
            ├─► Filtra sprintData por selectedProducts
            │
            ├─► Calcula globalStats (apenas produtos selecionados)
            │
            └─► SprintHeader
                    │
                    ├─► Checkboxes para toggle de produtos
                    │
                    └─► Card "O QUE FALTA" com destaque visual
```

---

### Comportamento da Selecao de Produtos

| Acao | Resultado |
|------|-----------|
| Marcar/Desmarcar checkbox | Toggle produto na lista |
| Produto desmarcado | Barra nao aparece, stats globais recalculados |
| Todos desmarcados | Mostrar mensagem "Selecione ao menos um produto" |
| Reset | Botao para selecionar todos novamente |

---

### Resultado Visual Final

```text
+-------------------------------------------------------------------------+
|  SPRINT SEMANAL - MISSAO: Zerar o gap                                    |
|  Produtos: [✓] Captacao NET  [✓] Receita  [ ] Diversificacao  ...       |
|                                                                         |
|  ┌────────────┐  ┌────────────┐  ╔════════════════════════════════════╗ |
|  │   META     │  │ PRODUZIDO  │  ║      O QUE FALTA                   ║ |
|  │  R$ 145K   │  │  R$ 82K    │  ║  !!!  R$ 63K  !!!                  ║ |
|  └────────────┘  └────────────┘  ║   OBJETIVO: ZERAR                  ║ |
|                                  ╚════════════════════════════════════╝ |
+-------------------------------------------------------------------------+
|                                                                         |
|  🔥 Receita                                                             |
|  ┌──────────────────────────────────────────────────────────────────┐   |
|  │  META: R$ 85K  │  REALIZADO: R$ 42.3K  │  ⚠ FALTA: R$ 42.7K      │   |
|  └──────────────────────────────────────────────────────────────────┘   |
|  [████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 49%            |
|  Falta: Hingrid -R$ 18.5K | Jose -R$ 12.7K                              |
|                                                                         |
|  🏆 Captacao NET                                     ✓ ZERADO!          |
|  ┌──────────────────────────────────────────────────────────────────┐   |
|  │  META: R$ 60K  │  REALIZADO: R$ 65K    │  ✓ ZERADO               │   |
|  └──────────────────────────────────────────────────────────────────┘   |
|  [████████████████████████████████████████████████████████] 100%        |
|  Todos os assessores atingiram a meta!                                  |
|                                                                         |
+-------------------------------------------------------------------------+
```

---

### Beneficios

1. **Flexibilidade**: Usuario escolhe quais produtos acompanhar
2. **Foco**: Pode focar apenas em KPIs prioritarios
3. **Clareza Visual**: "O que falta" fica impossivel de ignorar
4. **Contexto Completo**: Meta/Realizado/Falta sempre visiveis em cada barra
5. **Stats Dinamicos**: Header recalcula baseado na selecao

