
# Plano: Numero clicavel no lugar do lapis

## Resumo

Substituir o icone de lapis nos cards por um comportamento onde o proprio numero de producao (o valor central do gauge) se torna clicavel para abrir o modal de edicao.

---

## Alteracoes

### 1. `src/components/dashboard/GaugeChart.tsx`

- **Remover** o botao com icone de lapis (linhas 211-219)
- **Remover** import do `Pencil`
- **Tornar o valor central clicavel**: O `span` que exibe `formatNumber(value, isCurrency)` (linha 279) deixa de ter `pointer-events-none` no container pai quando `onEditProduction` esta presente
  - O container (linha 278) tera `pointer-events-none` condicional: so aplica quando NAO tem `onEditProduction`
  - O `span` do valor recebe `onClick` com `e.stopPropagation()` + `onEditProduction()`
  - Adiciona estilo visual sutil: `cursor-pointer underline decoration-dotted hover:text-eclat-gold transition-colors` para indicar que e clicavel
  - Mantem `pointer-events-auto` no span do valor para garantir clique mesmo com container `pointer-events-none`

### 2. `src/components/dashboard/FlipGaugeChart.tsx`

- Nenhuma alteracao necessaria (ja repassa `onEditProduction` para o `GaugeChart`)

### 3. Nenhuma outra alteracao

O `ProductionEditModal` e `Index.tsx` continuam iguais - apenas muda o elemento de gatilho dentro do `GaugeChart`.

---

## Detalhe Tecnico

Trecho do valor central atualizado:

```text
Container: pointer-events-none (quando sem onEditProduction)
           pointer-events-auto  (quando com onEditProduction, apenas no span do valor)

Span do valor:
  - Com onEditProduction: cursor-pointer, underline dotted, hover dourado, onClick abre modal
  - Sem onEditProduction: comportamento atual (sem interacao)
```

Isso mantem o click do FlipGaugeChart funcionando normalmente (o stopPropagation no valor impede que o flip seja acionado ao clicar no numero).
