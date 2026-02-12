
# Plano: Corrigir nomes dos graficos na barra lateral

## Problema

Os nomes dos graficos na barra lateral estao desatualizados e nao correspondem ao layout atual do dashboard. Quase todos os nomes estao errados.

## Mapeamento corrigido

**Arquivo:** `src/components/dashboard/DashboardSidebar.tsx`

Atualizar os arrays `CARD_ITEMS` e `GRAPH_ITEMS` com os nomes corretos:

| Key | Nome Atual (errado) | Nome Correto |
|-----|---------------------|--------------|
| graph1 | Captacao NET | ICM% por Assessor |
| graph2 | Receita XP | Receita PJ1 XP (HEAD BRUNO) |
| graph3 | Primeiras Reunioes | Captacao NET |
| graph4 | Diversificacao | Habilitacao |
| graph5 | Receita Parceiros | Ativacao |
| graph6 | Receita PJ1 XP (HEAD BRUNO) | Receita PJ2 XP / Empilhada |
| graph7 | Receita PJ2 XP | Receita Parceiros |
| graph8 | Habilitacao | Diversificacao |
| graph9 | Ativacao | (removido - nao existe separado) |

Os cards (card1, card2, card3) ja estao corretos.

## Remocao do graph9

O graph9 nao controla nenhum elemento separado no dashboard (o slot e compartilhado com graph8 para Diversificacao). Sera removido da sidebar e da interface `DashboardVisibility` para evitar confusao. Tambem sera removido do `defaultVisibility` e de qualquer referencia no `Index.tsx`.

## Resumo de alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/components/dashboard/DashboardSidebar.tsx` | Corrigir labels do GRAPH_ITEMS, remover graph9 da interface e defaults |
| `src/pages/Index.tsx` | Remover referencias a `visibility.graph9` (substituir por graph8 onde necessario) |
