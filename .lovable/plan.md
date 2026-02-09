

# Plano: Toggle de edicao de producao + Arredondamento para cima + Correcao de gauges

## 1. Toggle para liberar/bloquear edicao de producao nas Configuracoes

Adicionar um Switch no modal de Configuracoes (secao "Controles do Dashboard") que permite habilitar ou desabilitar a edicao de producao ao clicar nos numeros dos gauges.

**Arquivo:** `src/pages/Index.tsx`
- Criar estado `isProductionEditEnabled` (default: `true`)
- Passar como prop ao `TokenAccessConfig`
- Condicionar `onEditProduction` nos gauges: so passar o callback se `isProductionEditEnabled` for `true`, caso contrario passar `undefined`
- O botao "Editar Producao" dentro das configuracoes tambem respeita esse toggle

**Arquivo:** `src/components/dashboard/TokenAccessConfig.tsx`
- Adicionar prop `isProductionEditEnabled: boolean` e `onProductionEditEnabledChange: (enabled: boolean) => void`
- Adicionar novo item na grid de controles com icone `Edit3`, label "Liberar edicao de producao" e Switch
- O botao "Editar Producao" (Abrir) fica desabilitado quando o toggle esta desligado

## 2. Arredondamento para cima em Habilitacao e Ativacao

Atualmente o calculo de `value` para todos os KPIs usa os valores brutos. O `percentage` usa `Math.round`. Para Habilitacao e Ativacao, os valores devem ser arredondados para cima (`Math.ceil`).

**Arquivo:** `src/lib/kpiUtils.ts` (linha ~1184-1197)
- No bloco "Standard case" onde `value` e calculado para categorias como Habilitacao e Ativacao, aplicar `Math.ceil()` ao valor realizado quando a categoria for "Habilitacao" ou "Ativacao"
- Tambem aplicar `Math.ceil()` ao target para consistencia
- Isso afeta os gauges, ICM, e qualquer calculo derivado

## 3. Correcao do tamanho dos gauges que ultrapassam limites

### ICM Geral (`src/components/dashboard/ICMCard.tsx`)
- O gauge tem dimensoes fixas de 350x200 que podem ultrapassar o container em telas menores
- Trocar de dimensoes fixas para um wrapper com `max-width: 100%` e SVG responsivo usando `viewBox` + `width="100%"` + `preserveAspectRatio`
- Manter o `viewBox="0 0 350 210"` mas usar `width="100%"` e `height="auto"` no SVG
- Remover o `style={{ width: gaugeWidth, height: gaugeHeight }}` fixo e usar classes CSS com `max-w-[350px] w-full aspect-[350/200]`

### Receita Parceiros / FlipGaugeChart
- O `FlipGaugeChart` usa `compact={true}` e `size="sm"` que gera dimensoes de 135x78
- Verificar se o container `ExpandableCard` esta limitando corretamente
- Adicionar `max-w-full` ao wrapper do gauge no `GaugeChart.tsx` para o container SVG (linha ~245)
- Mudar o div do SVG de dimensoes fixas (`style={{ width, height }}`) para `style={{ maxWidth: width, width: '100%', aspectRatio: `${width}/${height}` }}`

**Arquivo:** `src/components/dashboard/GaugeChart.tsx` (linha ~245-248)
- Trocar:
  ```
  style={{ width: dynamicWidth, height: dynamicHeight }}
  ```
- Por:
  ```
  style={{ maxWidth: dynamicWidth, width: '100%', aspectRatio: `${dynamicWidth}/${dynamicHeight}` }}
  ```
- Ajustar o SVG para usar `width="100%" height="100%"` com `viewBox` e `preserveAspectRatio="xMidYMax meet"`

**Arquivo:** `src/components/dashboard/ICMCard.tsx` (linha ~131-134)
- Mesma abordagem: remover dimensoes fixas do wrapper, usar `max-w-[350px] w-full` e SVG com `width="100%"` + `viewBox`

---

## Resumo de arquivos alterados

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Index.tsx` | Estado `isProductionEditEnabled`, condicionar callbacks de edicao |
| `src/components/dashboard/TokenAccessConfig.tsx` | Switch "Liberar edicao de producao" + desabilitar botao Abrir |
| `src/lib/kpiUtils.ts` | `Math.ceil()` nos valores de Habilitacao e Ativacao |
| `src/components/dashboard/GaugeChart.tsx` | SVG responsivo com `viewBox` + `max-width` em vez de dimensoes fixas |
| `src/components/dashboard/ICMCard.tsx` | SVG responsivo com `viewBox` + `max-width` em vez de dimensoes fixas |

