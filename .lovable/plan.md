

## Plano: Reduzir Fontes da Tela Sprint em 0.5x

### Objetivo

Reduzir pela metade todos os tamanhos de fonte e elementos na tela Sprint, retornando aos valores originais antes do aumento de 2x.

---

### Mapeamento de Alterações (÷2)

| Atual | Novo (0.5x) |
|-------|-------------|
| `text-scale-10` | `text-scale-5` |
| `text-scale-12` | `text-scale-6` |
| `text-scale-14` | `text-scale-7` |
| `text-scale-16` | `text-scale-8` |
| `size-scale-3` | `size-scale-1.5` |
| `size-scale-4` | `size-scale-2` |
| `h-scale-3` | `h-scale-1.5` |
| `h-scale-4` | `h-scale-2` |
| `h-scale-6` | `h-scale-3` |

---

### Arquivos a Modificar

#### 1. `src/components/dashboard/SprintPage.tsx`

| Linha | Elemento | Atual | Novo |
|-------|----------|-------|------|
| 49 | Product labels | `text-scale-10 lg:text-scale-12` | `text-scale-5 lg:text-scale-6` |
| 54 | Checkbox size | `size-scale-3 lg:size-scale-4` | `size-scale-1.5 lg:size-scale-2` |
| 70 | Select Assessor | `h-scale-6 text-scale-12 lg:text-scale-14` | `h-scale-3 text-scale-6 lg:text-scale-7` |
| 84 | Select Mês | `h-scale-6 text-scale-12 lg:text-scale-14` | `h-scale-3 text-scale-6 lg:text-scale-7` |
| 109 | Empty state | `text-scale-12` | `text-scale-6` |

#### 2. `src/components/dashboard/SprintKPIBar.tsx`

| Linha | Elemento | Atual | Novo |
|-------|----------|-------|------|
| 28-29 | Trophy/PartyPopper | `size-scale-3 lg:size-scale-4` | `size-scale-1.5 lg:size-scale-2` |
| 34 | Target icon | `size-scale-3 lg:size-scale-4` | `size-scale-1.5 lg:size-scale-2` |
| 37 | Timer icon | `size-scale-3 lg:size-scale-4` | `size-scale-1.5 lg:size-scale-2` |
| 39 | Flame icon | `size-scale-3 lg:size-scale-4` | `size-scale-1.5 lg:size-scale-2` |
| 82 | KPI label | `text-scale-12 lg:text-scale-14` | `text-scale-6 lg:text-scale-7` |
| 87 | Percentage | `text-scale-14 lg:text-scale-16` | `text-scale-7 lg:text-scale-8` |
| 95 | Values row | `text-scale-10` | `text-scale-5` |
| 114 | Progress bar | `h-scale-3 lg:h-scale-4` | `h-scale-1.5 lg:h-scale-2` |
| 126 | Evolution text | `text-scale-10` | `text-scale-5` |
| 128 | TrendingUp icon | `size-scale-3` | `size-scale-1.5` |
| 145 | "Falta por Assessor" | `text-scale-10` | `text-scale-5` |
| 159 | Assessor name | `text-scale-10 lg:text-scale-12` | `text-scale-5 lg:text-scale-6` |
| 162 | Assessor value | `text-scale-12` | `text-scale-6` |
| 176 | "Todos atingiram" | `text-scale-10` | `text-scale-5` |

---

### Resultado Esperado

A tela Sprint voltará aos tamanhos originais, mantendo a capacidade de escalar via seletor de zoom global (1x a 2x).

