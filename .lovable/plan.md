

# Plano: Dashboard 100% Responsivo

## Contexto atual

O dashboard usa um layout fixo com `flex-[45]`/`flex-[55]` e `grid-cols-3` projetado para desktop/TV 16:9. Em telas menores, os cards podem sobrepor ou ficar ilegíveis.

## Alteracoes propostas

### 1. Novo arquivo de estilos responsivos (`src/index.css`)

Adicionar regras globais de seguranca anti-overflow e tipografia com `clamp()`:

- `* { min-width: 0; box-sizing: border-box; }`
- Titulos: `font-size: clamp(14px, 1.2vw, 18px)`
- Metricas principais: `font-size: clamp(22px, 2.2vw, 34px)`
- Labels: `font-size: clamp(12px, 1vw, 14px)`
- Regras de truncamento com `-webkit-line-clamp: 2`
- Container queries: cada card com `container-type: inline-size`
- Classes utilitarias para scroll interno em cards: `.card-scroll-body { max-height: 240px; overflow-y: auto; }`

### 2. Layout principal do dashboard (`src/pages/Index.tsx`)

Substituir o layout fixo `flex-[45]`/`flex-[55]` por CSS Grid responsivo:

**De:**
```
<div class="h-full flex flex-col gap-3">
  <div class="grid gap-3 flex-[45]">...</div>  <!-- top row -->
  <div class="grid gap-3 flex-[55]">...</div>  <!-- bottom row -->
</div>
```

**Para:**
```
<div class="dashboard-grid">
  <!-- Todos os cards em um unico grid com auto-fit -->
</div>
```

Comportamento por breakpoint:
- `<= 480px`: 1 coluna, cards empilhados, padding reduzido
- `481px - 1024px`: 2 colunas
- `1025px - 1440px`: 3 colunas (layout atual)
- `> 1440px`: manter 3 colunas (nao expandir para 4, pois o dashboard tem exatamente 3 colunas logicas)

**Importante:** Em telas `lg+` (1025px+), manter o comportamento atual de fit-to-screen sem scroll usando `grid-template-rows` com fractions. O CSS Grid auto-fit sera usado apenas em telas menores para empilhamento automatico.

### 3. Cards individuais (`src/components/ui/card.tsx`)

- Adicionar `container-type: inline-size` como classe base
- Garantir `overflow: hidden` e `min-width: 0`

### 4. GaugeChart responsivo (`src/components/dashboard/GaugeChart.tsx`)

- SVGs com `max-width: 100%` e `aspect-ratio` controlado
- Percentagens e valores com `clamp()` em vez de classes fixas
- Lista "Falta por Assessor" com `max-height` e scroll interno
- Em container queries pequenos (`@container (max-width: 300px)`), esconder elementos secundarios

### 5. ICMCard / FlipICMCard

- Gauge SVG com `max-width: 100%` e viewBox responsivo
- Filtros em wrap com `flex-wrap` (ja tem)
- Tipografia com `clamp()`

### 6. AssessorChart

- Lista de assessores com scroll interno quando exceder altura disponivel
- Barras com largura proporcional ao container

### 7. FlipMetaTable

- Tabela com scroll horizontal em telas pequenas
- Celulas com `white-space: nowrap` e `overflow: hidden`

### 8. AgendadasCard

- Grid de assessores com `auto-fit` e `minmax`

---

## Resumo de arquivos alterados

| Arquivo | Alteracao |
|---------|-----------|
| `src/index.css` | Regras globais anti-overflow, tipografia clamp(), container queries, classes utilitarias |
| `src/pages/Index.tsx` | Refatorar grid do dashboard: manter 3 colunas em lg+, auto-stack em telas menores |
| `src/components/ui/card.tsx` | Adicionar container-type e overflow seguro |
| `src/components/dashboard/GaugeChart.tsx` | SVG responsivo, clamp(), scroll interno na lista |
| `src/components/dashboard/ICMCard.tsx` | Gauge responsivo, tipografia clamp() |
| `src/components/dashboard/FlipICMCard.tsx` | Propagar responsividade |
| `src/components/dashboard/AssessorChart.tsx` | Scroll interno, barras proporcionais |
| `src/components/dashboard/FlipMetaTable.tsx` | Tabela com scroll horizontal |
| `src/components/dashboard/AgendadasCard.tsx` | Grid auto-fit para assessores |

## Principio fundamental

- Em `lg+` (desktop/TV): manter layout atual de 3 colunas fit-to-screen sem scroll
- Em telas menores: cards empilham automaticamente com scroll vertical
- Nenhum card permite que conteudo vaze ou sobreponha outro
- Tipografia sempre legivel com `clamp()` garantindo minimos e maximos

