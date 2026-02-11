
# Plano: Destacar assessores com alerta vermelho (triangulo) no ranking

## O que muda

No card "ICM Geral por Assessor", os assessores que estao com desempenho critico (triangulo vermelho - abaixo de 25% do ritmo ideal) receberao destaque visual adicional para chamar atencao imediatamente.

## Alteracoes visuais

**Arquivo:** `src/components/dashboard/AssessorChart.tsx`

Na funcao `renderAssessor`, determinar o status do assessor via `getKPIStatusIcon` e aplicar estilos condicionais quando for `RED_ALERT`:

1. **Fundo vermelho sutil**: trocar o fundo do item de `bg-muted/50` ou `bg-background` para `bg-red-500/10` com borda `border border-red-500/30`
2. **Nome em vermelho**: mudar a cor do nome do assessor de `text-foreground` para `text-red-600 dark:text-red-400`
3. **Percentual em vermelho**: o valor de ICM Geral (atualmente dourado) fica `text-red-600` em vez de `text-eclat-gold`
4. **Pulso sutil**: adicionar `animate-pulse` leve no container para atrair o olhar

Assessores com status `ORANGE_ALERT` (26-50% do ritmo) tambem receberao um destaque mais leve:
- Fundo `bg-orange-500/8` com borda `border border-orange-500/20`
- Nome em `text-orange-600 dark:text-orange-400`

Assessores acima do ritmo ou com alerta amarelo mantem o visual atual sem alteracoes.

## Logica tecnica

```text
const statusIcon = getKPIStatusIcon(assessor.geralPercentage, ritmoIdeal);
const isRedAlert = statusIcon === "RED_ALERT";
const isOrangeAlert = statusIcon === "ORANGE_ALERT";

// Classe do container
const bgClass = isRedAlert
  ? 'bg-red-500/10 border border-red-500/30'
  : isOrangeAlert
  ? 'bg-orange-500/8 border border-orange-500/20'
  : index < 3 ? 'bg-muted/50' : 'bg-background';

// Classe do nome
const nameClass = isRedAlert
  ? 'text-red-600 dark:text-red-400'
  : 'text-foreground';

// Classe do percentual geral
const percentClass = isRedAlert
  ? 'text-red-600'
  : 'text-eclat-gold';
```

## Resumo

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/dashboard/AssessorChart.tsx` | Estilos condicionais no `renderAssessor` baseados no status RED_ALERT e ORANGE_ALERT |
