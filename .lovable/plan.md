

## Plano: Reduzir Tamanho dos Cards na Análise Trimestral

### Problema Identificado

Os 9 KPIs + 3 cabeçalhos de categoria estão ocupando muito espaço vertical, fazendo os gráficos ficarem ocultos. Atualmente cada card tem:
- Padding `p-2 lg:p-3` (8-12px)
- Altura da barra de progresso `h-3 lg:h-4` (12-16px)
- Margens entre elementos `mb-1`, `my-1`, `mt-1`

### Solução Proposta

Reduzir ainda mais o tamanho de cada componente:

```text
ANTES (cada card ~60px):
┌─────────────────────────────────────────────┐
│  Receita XP                           59%   │ (padding 12px)
│                                             │ (margem 4px)
│  ████████████████▏                         │ (barra 16px + margem)
│                                             │ (margem 4px)
│  R$ 36Mi / R$ 61Mi       Falta: R$ 25 Mil  │ (padding 12px)
└─────────────────────────────────────────────┘

DEPOIS (cada card ~40px):
┌────────────────────────────────────────────┐
│ Receita XP                           59%  │ (padding 4-6px)
│ ████████████████▏                         │ (barra 8-12px)
│ R$36Mi/R$61Mi          Falta: R$25Mi      │ (padding 4-6px)
└────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/QuarterlyKPIBar.tsx` | **MODIFICAR** - Reduzir padding, margens e altura da barra |
| `src/components/dashboard/AnalysisPage.tsx` | **MODIFICAR** - Reduzir gaps e compactar cabeçalhos de categoria |

---

### Detalhes Técnicos

#### 1. QuarterlyKPIBar.tsx - Compactar Layout

**Mudanças:**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Padding do card | `p-2 lg:p-3` | `p-1.5 lg:p-2` |
| Altura da barra | `h-3 lg:h-4` | `h-2 lg:h-3` |
| Margem da barra | `my-1` | `my-0.5` |
| Margem do header | `mb-1` | `mb-0.5` |
| Margem dos valores | `mt-1` | `mt-0.5` |
| Fonte do label | `text-xs lg:text-sm` | `text-[10px] lg:text-xs` |
| Fonte da % | `text-sm lg:text-base` | `text-xs lg:text-sm` |
| Fonte dos valores | `text-[10px] lg:text-xs` | `text-[9px] lg:text-[10px]` |

**Código resultante:**

```tsx
<div className="bg-card rounded-lg p-1.5 lg:p-2 h-full flex flex-col border border-border shadow-sm overflow-hidden">
  {/* Label and percentage - mais compacto */}
  <div className="flex justify-between items-center mb-0.5">
    <div className="flex items-center gap-1">
      <span className="font-semibold text-foreground text-[10px] lg:text-xs truncate">{label}</span>
      {headName && (
        <span className="inline-flex items-center text-[8px] lg:text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide bg-blue-500/10 px-0.5 py-0.5 rounded border border-blue-500/20">
          HEAD {headName}
        </span>
      )}
    </div>
    <span className={`font-bold text-xs lg:text-sm ${textColor}`}>
      {percentage}%
    </span>
  </div>

  {/* Progress bar - menor */}
  <div className="relative h-2 lg:h-3 my-0.5">
    {/* ... conteúdo mantido ... */}
  </div>

  {/* Values - fonte menor */}
  <div className="flex justify-between items-center text-[9px] lg:text-[10px] text-muted-foreground mt-0.5">
    {/* ... conteúdo mantido ... */}
  </div>
</div>
```

#### 2. AnalysisPage.tsx - Compactar Container e Headers

**Mudanças:**

| Elemento | Antes | Depois |
|----------|-------|--------|
| Gap entre cards | `gap-1 lg:gap-1.5` | `gap-0.5 lg:gap-1` |
| Headers de categoria | `text-xs` + dots `w-2 h-2` | `text-[10px]` + dots `w-1.5 h-1.5` |
| Gap do header | `gap-2` | `gap-1` |

**Código resultante:**

```tsx
{/* Container principal com gap menor */}
<div className="flex-1 min-h-0 flex flex-col gap-0.5 lg:gap-1 overflow-hidden lg:overflow-hidden overflow-y-auto">
  
  {/* Category headers mais compactos */}
  <div className="flex items-center gap-1 px-1 shrink-0">
    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
    <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
      {CATEGORY_GROUPS.prospeccao.label}
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
  
  {/* KPI bars */}
  ...
</div>
```

---

### Comparação de Espaço

| Métrica | Antes | Depois | Economia |
|---------|-------|--------|----------|
| Altura de cada card | ~60px | ~40px | ~33% |
| Gap entre cards | 4-6px | 2-4px | ~40% |
| Headers de categoria | ~20px | ~14px | ~30% |
| **Total para 9 KPIs + 3 headers** | ~600px | ~400px | **~33%** |

---

### Benefícios

1. **Todos os KPIs visíveis** - Cabem na tela sem scroll
2. **Informação preservada** - Nenhum dado removido, apenas compactado
3. **Legibilidade mantida** - Fontes ainda legíveis com tamanhos mínimos apropriados
4. **Consistência** - Proporções mantidas entre elementos

