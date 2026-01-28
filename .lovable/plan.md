
## Plano: Aplicar Redução de 50% nas Outras Telas e Componentes

### Objetivo

Aplicar a mesma redução de 50% em todos os valores fixos de pixel que **não foram atualizados** na rodada anterior. Isso inclui as páginas de Análise (Trimestral), Sprint, e componentes auxiliares.

---

### Arquivos a Modificar

| Arquivo | Componente | Tipo de Alteração |
|---------|------------|-------------------|
| `src/components/dashboard/AnalysisPage.tsx` | Página Análise Trimestral | Reduzir tamanhos de fonte, ícones, gaps, paddings |
| `src/components/dashboard/QuarterlyKPIBar.tsx` | Barras KPI Trimestrais | Reduzir tamanhos de fonte, altura de barras, paddings |
| `src/components/dashboard/SprintPage.tsx` | Página Sprint | Reduzir tamanhos de fonte, ícones, checkboxes, gaps |
| `src/components/dashboard/SprintKPIBar.tsx` | Barras KPI Sprint | Reduzir tamanhos de fonte, ícones, barras, paddings |
| `src/components/dashboard/AssessorChart.tsx` | Gráfico de Assessores | Reduzir barras, ícones, espaçamentos |
| `src/components/dashboard/YearlyAssessorChart.tsx` | Ranking Anual | Reduzir tamanhos de fonte, ícones |
| `src/components/dashboard/FlipGaugeChart.tsx` | Flip do Gauge | Reduzir tamanhos de fonte no verso |
| `src/components/dashboard/YearlyAnalysisCard.tsx` | Card de Análise Anual | Reduzir tamanhos de fonte, paddings, ícones |
| `src/components/dashboard/ProgressBar.tsx` | Barra de Progresso | Reduzir ícone do clock |
| `src/components/dashboard/ExpandableCard.tsx` | Card Expansível | Reduzir tamanhos de ícones e paddings |

---

### Mapeamento de Redução (Valor Atual → 50%)

#### Fontes (px)

| Valor Atual | Novo Valor (50%) |
|-------------|------------------|
| `text-lg` (18px) | `text-[9px]` |
| `text-sm` (14px) | `text-[7px]` |
| `text-xs` (12px) | `text-[6px]` |
| `text-[10px]` | `text-[5px]` |
| `text-[11px]` | `text-[6px]` |
| `text-[12px]` | `text-[6px]` |
| `text-[9px]` | `text-[5px]` |
| `text-[8px]` | `text-[4px]` |

#### Alturas de Barras

| Valor Atual | Novo Valor (50%) |
|-------------|------------------|
| `h-2` (8px) | `h-1` (4px) |
| `h-3` (12px) | `h-1.5` (6px) |
| `h-4` (16px) | `h-2` (8px) |
| `h-1.5` (6px) | `h-[3px]` |
| `h-1` (4px) | `h-0.5` (2px) |

#### Paddings/Gaps

| Valor Atual | Novo Valor (50%) |
|-------------|------------------|
| `p-4` (16px) | `p-2` (8px) |
| `p-3` (12px) | `p-1.5` (6px) |
| `p-2` (8px) | `p-1` (4px) |
| `p-1.5` (6px) | `p-[3px]` |
| `p-1` (4px) | `p-0.5` (2px) |
| `gap-4` (16px) | `gap-2` (8px) |
| `gap-3` (12px) | `gap-1.5` (6px) |
| `gap-2` (8px) | `gap-1` (4px) |
| `gap-1.5` (6px) | `gap-[3px]` |
| `gap-1` (4px) | `gap-0.5` (2px) |
| `mb-4` (16px) | `mb-2` (8px) |
| `mb-2` (8px) | `mb-1` (4px) |
| `mb-1` (4px) | `mb-0.5` (2px) |
| `px-3` (12px) | `px-1.5` (6px) |
| `py-1` (4px) | `py-0.5` (2px) |

#### Ícones

| Valor Atual | Novo Valor (50%) |
|-------------|------------------|
| `h-5 w-5` (20px) | `h-2.5 w-2.5` (10px) |
| `h-4 w-4` (16px) | `h-2 w-2` (8px) |
| `h-3 w-3` (12px) | `h-1.5 w-1.5` (6px) |
| `h-2.5 w-2.5` (10px) | `h-[5px] w-[5px]` |
| `w-4 h-4` (16px) | `w-2 h-2` (8px) |
| `w-3.5 h-3.5` (14px) | `w-[7px] h-[7px]` |
| `w-3 h-3` (12px) | `w-1.5 h-1.5` (6px) |
| `w-2.5 h-2.5` (10px) | `w-[5px] h-[5px]` |
| `w-1.5 h-1.5` (6px) | `w-[3px] h-[3px]` |

#### Outros

| Valor Atual | Novo Valor (50%) |
|-------------|------------------|
| `w-[160px]` | `w-[80px]` |
| `w-[180px]` | `w-[90px]` |
| `w-[140px]` | `w-[70px]` |
| `w-[120px]` | `w-[60px]` |
| `w-[100px]` | `w-[50px]` |
| `h-8` (32px) | `h-4` (16px) |
| `h-6` (24px) | `h-3` (12px) |
| `w-8` (32px) | `w-4` (16px) |

---

### Alterações por Arquivo

#### 1. AnalysisPage.tsx

**Linhas 101-186** - Header e filtros:
- `p-4` → `p-2`
- `gap-4` → `gap-2`
- `h-5 w-5` → `h-2.5 w-2.5`
- `text-lg` → `text-[9px]`
- `text-sm` → `text-[7px]`
- `px-3 py-1` → `px-1.5 py-0.5`
- `w-[160px]` → `w-[80px]`
- `w-[100px]` → `w-[50px]`
- `px-2` → `px-1`
- `gap-1` → `gap-0.5`

**Linhas 192-234** - Headers de categoria:
- `w-1.5 h-1.5` → `w-[3px] h-[3px]`
- `text-[10px]` → `text-[5px]`
- `gap-1` → `gap-0.5`

**Linhas 247-254** - Card sem dados:
- `p-8` → `p-4`
- `h-16 w-16` → `h-8 w-8`
- `mb-4` → `mb-2`
- `text-xl` → `text-[10px]`
- `mb-2` → `mb-1`

#### 2. QuarterlyKPIBar.tsx

**Linha 50** - Container:
- `p-1.5 lg:p-2` → `p-[3px] lg:p-1`

**Linhas 52-64** - Label e porcentagem:
- `text-[10px] lg:text-xs` → `text-[5px] lg:text-[6px]`
- `text-[8px] lg:text-[9px]` → `text-[4px] lg:text-[5px]`
- `px-0.5 py-0.5` → `px-[1px] py-[1px]`
- `text-xs lg:text-sm` → `text-[6px] lg:text-[7px]`
- `gap-1` → `gap-0.5`
- `mb-0.5` → `mb-[1px]`

**Linhas 67-96** - Barra de progresso:
- `h-2 lg:h-3` → `h-1 lg:h-1.5`
- `my-0.5` → `my-[1px]`
- Triângulo: `border-l-[3px] border-r-[3px] border-t-[4px]` → `border-l-[1.5px] border-r-[1.5px] border-t-[2px]`
- `w-0.5` → `w-[1px]`

**Linhas 99-122** - Valores:
- `text-[9px] lg:text-[10px]` → `text-[5px] lg:text-[5px]`
- `mt-0.5` → `mt-[1px]`

#### 3. SprintPage.tsx

**Linhas 43-61** - Filtros e checkboxes:
- `gap-2 lg:gap-3` → `gap-1 lg:gap-1.5`
- `gap-1 lg:gap-1.5` → `gap-0.5 lg:gap-[3px]`
- `text-[10px] lg:text-xs` → `text-[5px] lg:text-[6px]`
- `h-3 w-3 lg:h-4 lg:w-4` → `h-1.5 w-1.5 lg:h-2 lg:w-2`
- `mb-2` → `mb-1`
- `gap-2` → `gap-1`

**Linhas 64-95** - Selects:
- `w-[140px] lg:w-[180px]` → `w-[70px] lg:w-[90px]`
- `w-[100px] lg:w-[120px]` → `w-[50px] lg:w-[60px]`
- `h-8` → `h-4`
- `text-xs lg:text-sm` → `text-[6px] lg:text-[7px]`

**Linha 99** - KPI Bars container:
- `gap-1 lg:gap-1.5` → `gap-0.5 lg:gap-[3px]`

#### 4. SprintKPIBar.tsx

**Linhas 27-39** - Ícones de urgência:
- `h-3 w-3 lg:h-4 lg:w-4` → `h-1.5 w-1.5 lg:h-2 lg:w-2`

**Linha 75** - Container:
- `p-2 lg:p-3` → `p-1 lg:p-1.5`

**Linhas 79-91** - Header:
- `mb-1` → `mb-0.5`
- `gap-2` → `gap-1`
- `text-xs lg:text-sm` → `text-[6px] lg:text-[7px]`
- `text-sm lg:text-base` → `text-[7px] lg:text-[8px]`

**Linhas 95-107** - Grid de valores:
- `gap-1 mb-1` → `gap-0.5 mb-0.5`
- `text-[9px] lg:text-[10px]` → `text-[5px] lg:text-[5px]`

**Linhas 110-118** - Barra de progresso:
- `h-3 lg:h-4` → `h-1.5 lg:h-2`
- `mb-1` → `mb-0.5`

**Linhas 121-136** - Indicador de evolução:
- `text-[9px] lg:text-[10px]` → `text-[5px] lg:text-[5px]`
- `h-3 w-3` → `h-1.5 w-1.5`
- `gap-1 mb-1` → `gap-0.5 mb-0.5`

**Linhas 139-168** - Breakdown por assessor:
- `pt-1` → `pt-0.5`
- `mb-1` → `mb-0.5`
- `gap-1.5` → `gap-[3px]`
- `px-1.5 py-1` → `px-[3px] py-0.5`
- `text-[10px] lg:text-[11px]` → `text-[5px] lg:text-[6px]`
- `text-[11px] lg:text-[12px]` → `text-[6px] lg:text-[6px]`

#### 5. AssessorChart.tsx

**Linha 88** - Assessor row:
- `gap-1 p-1` → `gap-0.5 p-0.5`

**Linha 92** - Nome:
- `gap-1` → `gap-0.5`

**Linhas 99-126** - Barras:
- `h-1.5` → `h-[3px]`
- `mt-0.5` → `mt-[1px]`
- `h-1` → `h-0.5`
- Clock: `w-3 h-3` → `w-1.5 h-1.5`
- Clock interno: `w-1.5 h-1.5` → `w-[3px] h-[3px]`
- Linha conectora: `h-1.5` → `h-[3px]`
- Top: `-8px` → `-4px`

**Linhas 135-142** - Percentagens:
- `text-[9px]` → `text-[5px]`

**Linha 150** - Card single assessor:
- `p-2` → `p-1`
- `mb-1` → `mb-0.5`
- `gap-1` → `gap-0.5`
- `p-4` → `p-2`

**Linha 165** - Card múltiplos:
- `p-2` → `p-1`
- `mb-1` → `mb-0.5`
- `gap-0.5` → `gap-[1px]`

#### 6. YearlyAssessorChart.tsx

**Linhas 45-46** - Header:
- `p-responsive-lg` permanece (já usa classe responsiva)

**Linha 52-53** - Ranking icons:
- `w-8` → `w-4`

**Linha 67-69** - Porcentagens:
- `text-responsive-xs` permanece (já usa classe responsiva)

**Linha 96-97** - Others ranking:
- `w-8` → `w-4`

#### 7. FlipGaugeChart.tsx

**Linhas 109-143** - Verso (back card):
- `p-2` → `p-1`
- `mb-1` → `mb-0.5`
- `text-[10px]` → `text-[5px]`
- `p-0.5` → `p-[1px]`
- `w-2.5 h-2.5` → `w-[5px] h-[5px]`
- `space-y-0.5` → `space-y-[1px]`
- `text-[9px]` → `text-[5px]`
- `py-0` permanece
- `py-1` → `py-0.5`

#### 8. YearlyAnalysisCard.tsx

**Linha 125** - Card:
- `p-6` → `p-3`

**Linhas 127-139** - Header:
- `mb-4` → `mb-2`
- `text-lg` → `text-[9px]`
- `text-sm` → `text-[7px]`
- `gap-2` → `gap-1`
- `h-8 w-8` → `h-4 w-4`
- `h-4 w-4` → `h-2 w-2`

**Linhas 143-149** - Skeleton:
- `space-y-3` → `space-y-1.5`

**Linhas 158-189** - Conteúdo de análise:
- `space-y-4` → `space-y-2`
- `gap-2 mb-2` → `gap-1 mb-1`
- `text-sm` → `text-[7px]`
- `h-4 w-4` → `h-2 w-2`
- `space-y-1.5` → `space-y-[3px]`
- `text-xs` → `text-[6px]`
- `gap-2` → `gap-1`
- `mt-0.5` → `mt-[1px]`

**Linha 200** - Loading indicator:
- `mt-2` → `mt-1`
- `text-xs` → `text-[6px]`

#### 9. ProgressBar.tsx

**Linhas 63-66** - Clock marker:
- `w-4 h-4` → `w-2 h-2`
- `w-2.5 h-2.5` → `w-[5px] h-[5px]`
- `w-0.5` → `w-[1px]`
- `-mt-0.5` → `-mt-[1px]`

**Linha 70** - Diferença label:
- `-bottom-5` → `-bottom-2.5`

#### 10. ExpandableCard.tsx

**Linhas 39-43** - Botão expandir:
- `top-2 left-2` → `top-1 left-1`
- `p-1.5` → `p-[3px]`
- `w-3.5 h-3.5` → `w-[7px] h-[7px]`

**Linhas 52-56** - Botão minimizar:
- `top-4 left-4` → `top-2 left-2`
- `p-2` → `p-1`
- `w-5 h-5` → `w-2.5 h-2.5`

**Linha 62** - Overlay padding:
- `p-4` → `p-2`

---

### Resumo das Alterações

| Arquivo | Nº de Alterações |
|---------|------------------|
| AnalysisPage.tsx | ~25 |
| QuarterlyKPIBar.tsx | ~20 |
| SprintPage.tsx | ~15 |
| SprintKPIBar.tsx | ~30 |
| AssessorChart.tsx | ~20 |
| YearlyAssessorChart.tsx | ~4 |
| FlipGaugeChart.tsx | ~10 |
| YearlyAnalysisCard.tsx | ~25 |
| ProgressBar.tsx | ~6 |
| ExpandableCard.tsx | ~8 |

---

### Resultado Esperado

Após as alterações:
- Todas as telas (Dashboard, Análise, Sprint) terão proporções consistentes
- Todos os elementos visuais terão **metade do tamanho** anterior
- Layout compacto e uniforme em todo o app
- Mais espaço livre em todos os cards e barras

---

### Aviso Importante

Alguns tamanhos resultantes (ex: `text-[4px]`, `text-[5px]`) podem ser **extremamente pequenos** e difíceis de ler. Após implementação, pode ser necessário ajustar tamanhos mínimos de fonte para garantir legibilidade.
