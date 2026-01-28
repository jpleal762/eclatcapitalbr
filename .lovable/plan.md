

## Plano: Aumentar Fontes da Tela Sprint em 2x

### Objetivo

Dobrar todos os tamanhos de fonte na tela "Sprint", incluindo os componentes `SprintPage.tsx` e `SprintKPIBar.tsx`.

---

### Mapeamento de Alterações

#### Conversão de Tamanhos (x2)

| Antes | Depois |
|-------|--------|
| `text-[5px]` | `text-[10px]` |
| `text-[6px]` | `text-[12px]` |
| `text-[7px]` | `text-[14px]` |
| `text-[8px]` | `text-[16px]` |

---

### Arquivos a Modificar

#### 1. `src/components/dashboard/SprintPage.tsx`

| Linha | Elemento | Antes | Depois |
|-------|----------|-------|--------|
| 49 | Product checkbox labels | `text-[5px] lg:text-[6px]` | `text-[10px] lg:text-[12px]` |
| 54 | Checkbox size | `h-1.5 w-1.5 lg:h-2 lg:w-2` | `h-3 w-3 lg:h-4 lg:w-4` |
| 70 | Select Assessor | `text-[6px] lg:text-[7px]` | `text-[12px] lg:text-[14px]` |
| 84 | Select Mês | `text-[6px] lg:text-[7px]` | `text-[12px] lg:text-[14px]` |
| 109 | Empty state message | `text-[6px]` | `text-[12px]` |

#### 2. `src/components/dashboard/SprintKPIBar.tsx`

| Linha | Elemento | Antes | Depois |
|-------|----------|-------|--------|
| 28-29 | Trophy/PartyPopper icons | `h-1.5 w-1.5 lg:h-2 lg:w-2` | `h-3 w-3 lg:h-4 lg:w-4` |
| 34 | Target icon | `h-1.5 w-1.5 lg:h-2 lg:w-2` | `h-3 w-3 lg:h-4 lg:w-4` |
| 37 | Timer icon | `h-1.5 w-1.5 lg:h-2 lg:w-2` | `h-3 w-3 lg:h-4 lg:w-4` |
| 39 | Flame icon | `h-1.5 w-1.5 lg:h-2 lg:w-2` | `h-3 w-3 lg:h-4 lg:w-4` |
| 82 | KPI label | `text-[6px] lg:text-[7px]` | `text-[12px] lg:text-[14px]` |
| 87 | Percentage | `text-[7px] lg:text-[8px]` | `text-[14px] lg:text-[16px]` |
| 95 | Values row (Meta/Real/Falta) | `text-[5px] lg:text-[5px]` | `text-[10px] lg:text-[10px]` |
| 114 | Progress bar | `h-1.5 lg:h-2` | `h-3 lg:h-4` |
| 126 | Evolution text | `text-[5px] lg:text-[5px]` | `text-[10px] lg:text-[10px]` |
| 128 | TrendingUp icon | `h-1.5 w-1.5` | `h-3 w-3` |
| 145 | "Falta por Assessor" label | `text-[5px] lg:text-[5px]` | `text-[10px] lg:text-[10px]` |
| 159 | Assessor name | `text-[5px] lg:text-[6px]` | `text-[10px] lg:text-[12px]` |
| 162 | Assessor value | `text-[6px] lg:text-[6px]` | `text-[12px] lg:text-[12px]` |
| 176 | "Todos atingiram" message | `text-[5px] lg:text-[5px]` | `text-[10px] lg:text-[10px]` |

---

### Ajustes Complementares de UI

| Elemento | Antes | Depois |
|----------|-------|--------|
| Select height | `h-4` | `h-6` |
| Select width Assessor | `w-[70px] lg:w-[90px]` | `w-[100px] lg:w-[140px]` |
| Select width Mês | `w-[50px] lg:w-[60px]` | `w-[70px] lg:w-[90px]` |
| Progress bar height | `h-1.5 lg:h-2` | `h-3 lg:h-4` |
| All icons | `h-1.5 w-1.5 lg:h-2 lg:w-2` | `h-3 w-3 lg:h-4 lg:w-4` |

---

### Resultado Esperado

A tela Sprint terá todas as fontes dobradas:
- Labels dos checkboxes de produtos mais legíveis
- Selects de filtros com texto maior
- Nomes de KPIs e porcentagens mais visíveis
- Valores (Meta, Real, Falta) mais fáceis de ler
- Grid de assessores com nomes e valores maiores
- Ícones de status proporcionalmente aumentados

