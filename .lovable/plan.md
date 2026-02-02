

## Correção: Botão "Meta Acumulada" não está aplicando gaps

### Diagnóstico

Após análise do código, identifiquei que:
1. A passagem de props está correta (`Index.tsx` → `FlipICMCard` → `ICMCard`)
2. O estado `isAccumulatedMode` está sendo gerenciado corretamente
3. O cálculo de `accumulatedGaps` está sendo feito, mas possivelmente retornando vazio

### Problema Potencial

A função `calculateAccumulatedGaps` pode estar retornando um Map vazio por uma das seguintes razões:
- O mês atual pode ser Janeiro (sem meses anteriores no ano)
- Os meses disponíveis no dados podem ter formato diferente do esperado
- O filtro de assessor pode estar excluindo dados relevantes

### Correções Propostas

#### 1. Adicionar logs de debug em `calculateAccumulatedGaps`

Vou adicionar console.log para monitorar:
- Mês atual e índice
- Meses anteriores encontrados
- Gaps calculados para cada categoria

#### 2. Corrigir potencial problema de condição inicial

A condição `currentMonthIndex <= 0` está correta para Janeiro, mas pode estar falhando silenciosamente se o formato do mês não for reconhecido.

#### 3. Adicionar log em `processDashboardData`

Verificar se os gaps estão chegando e sendo aplicados.

---

### Arquivos a Modificar

#### `src/lib/kpiUtils.ts`

**Função `calculateAccumulatedGaps`** - Adicionar logs:

```typescript
export function calculateAccumulatedGaps(
  data: ProcessedKPI[],
  currentMonth: string,
  assessor: string
): Map<string, number> {
  const gaps = new Map<string, number>();
  
  console.log("=== calculateAccumulatedGaps DEBUG ===");
  console.log("currentMonth:", currentMonth);
  console.log("assessor:", assessor);
  
  // ... resto da lógica
  
  console.log("previousMonths encontrados:", previousMonths);
  
  // ... após calcular gaps
  
  console.log("Gaps calculados:", Object.fromEntries(gaps));
  console.log("=====================================");
  
  return gaps;
}
```

**Função `processDashboardData`** - Adicionar log quando gaps são aplicados:

```typescript
// Add accumulated gaps to target if provided
if (accumulatedGaps) {
  const gap = accumulatedGaps.get(kpi.category) || 0;
  if (gap > 0) {
    console.log(`[Meta Acumulada] ${kpi.label}: +${gap} ao target (${target} → ${target + gap})`);
  }
  target += gap;
}
```

---

### Verificação Adicional

Após adicionar os logs, poderemos identificar exatamente onde está o problema:

1. Se `previousMonths` está vazio → problema no parsing de datas
2. Se gaps estão sendo calculados mas não aplicados → problema em `processDashboardData`
3. Se o Map está chegando undefined → problema na passagem do estado

---

### Resultado Esperado

Após as correções:
- Console mostrará os gaps calculados
- Meta será atualizada corretamente (ex: 24 + 7 = 31 para Habilitação)
- Todos os percentuais e "quanto falta" serão recalculados com a nova meta

