

# Plano: Clamp ICM Geral negativo a zero + Trocar relogio por traco

## 1. Clamp do ICM Geral quando negativo

**Arquivo:** `src/components/dashboard/ICMCard.tsx`
- Na linha 52, o calculo de `progress` usa `Math.min(icmGeral, 100)` mas nao protege contra negativos
- Alterar para `Math.min(Math.max(icmGeral, 0), 100)` para garantir que o arco nunca fique invertido
- Na linha 144, o texto central exibe `{icmGeral}%` sem clamp - alterar para `{Math.max(icmGeral, 0)}%`

## 2. Trocar icone Clock por um traco no indicador "No Ritmo"

O icone de relogio (Clock) sera substituido por um traco horizontal (icone `Minus` do Lucide) em todos os locais onde aparece "No Ritmo":

**Arquivo:** `src/components/dashboard/ICMCard.tsx` (linha 201)
- Trocar `<Clock>` por `<Minus>` e atualizar o import

**Arquivo:** `src/components/dashboard/YearlyICMCard.tsx` (linha 197)
- Trocar `<Clock>` por `<Minus>` e atualizar o import

## Resumo

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/dashboard/ICMCard.tsx` | Clamp negativo a zero no gauge + texto; trocar Clock por Minus |
| `src/components/dashboard/YearlyICMCard.tsx` | Trocar Clock por Minus no indicador "No Ritmo" |
