
# Plano: Reduzir grafico Diversificacao para o mesmo tamanho do Ativacao

## Problema atual

- **Ativacao** (Coluna 1, linha inferior): ocupa metade da largura em `grid-cols-2`, usa `size="sm"` e `compact={true}`
- **Diversificacao** (Coluna 3, linha inferior): ocupa 100% da largura, usa `size="lg"` e `compact={true}` com `showAssessorList`

O grafico de Diversificacao esta muito maior que o de Ativacao por usar `size="lg"` e ocupar a largura total.

## Alteracao

**Arquivo:** `src/pages/Index.tsx` (linhas 997-1018)

Mudar as props do GaugeChart de Diversificacao:
- `size="lg"` para `size="sm"`

Isso igualara as dimensoes do gauge de Diversificacao as do Ativacao (e Habilitacao), mantendo o `showAssessorList` e `headName="BRUNO"` funcionando normalmente.

## Resumo

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Index.tsx` | Linha ~1007: trocar `size="lg"` por `size="sm"` no GaugeChart de Diversificacao |
