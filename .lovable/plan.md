
# Plano: Ajustes visuais nos cards

## 1. Remover underline pontilhado do numero de producao

**Arquivo:** `src/components/dashboard/GaugeChart.tsx` (linha 271)

Remover `underline decoration-dotted` da classe do span clicavel. Manter `cursor-pointer` e `hover:text-eclat-gold` para feedback sutil sem os pontinhos.

## 2. Card azul "Falta para Meta Semanal" - mostrar numero ao lado do check quando atingido

**Arquivo:** `src/components/dashboard/FlipMetaTable.tsx` (linhas 183-192)

Quando a meta e atingida, em vez de mostrar apenas o icone de check + "Atingido", mostrar o icone de check + o nome do KPI + o valor realizado atual. Exemplo: `check Atingido 45` ao inves de so `check Atingido`.

Alteracao: trocar `<span>Atingido</span>` por `<span>{formatNumber(item.realizedValue!, item.isCurrency)}</span>` ao lado do check.

## 3. Meta Mes com cor mais discreta no card azul

**Arquivo:** `src/components/dashboard/FlipMetaTable.tsx` (linhas 99, 172)

Trocar a cor `text-amber-300/80` para `text-white/40` nas celulas de Meta Mes (tanto na frente quanto no verso), tornando-a mais discreta e menos chamativa que as outras colunas.

---

## Resumo de Arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/dashboard/GaugeChart.tsx` | Remover `underline decoration-dotted` do span clicavel |
| `src/components/dashboard/FlipMetaTable.tsx` | Mostrar valor ao lado do check; Meta Mes cor mais discreta |
