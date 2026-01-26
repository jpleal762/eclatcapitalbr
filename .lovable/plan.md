

## Plano: Incluir Receita Empilhada no Card "Meta Semanal Acumulada"

### Problema Identificado

O card "Meta Semanal Acumulada" (e seu verso "Falta para Meta Semanal") calcula o valor realizado de "Receita" apenas com a categoria base, sem incluir a "Receita Empilhada" (de PJ2 XP).

---

### Mudança Necessária

**Arquivo:** `src/lib/kpiUtils.ts`

**Localização:** Linhas 696-710 (cálculo de `metaSemanal`)

**Alteração:** Adicionar lógica condicional para somar "Receita Empilhada" ao `realizedValue` quando a categoria for "Receita"

```typescript
const metaSemanal: MetaSemanal[] = metaSemanalCategories.map(item => {
  const catData = filterByCategory(filteredByAssessor, item.category);
  const weeklyPlanned = catData.filter(d => isPlannedWeekStatus(d.status));
  const realizedData = catData.filter(d => isRealizedStatus(d.status));
  
  const value = selectedMonth !== "all" 
    ? getMonthValue(weeklyPlanned, selectedMonth)
    : weeklyPlanned.reduce((s, d) => s + d.total, 0);
  
  let realizedValue = selectedMonth !== "all"
    ? getMonthValue(realizedData, selectedMonth)
    : realizedData.reduce((s, d) => s + d.total, 0);
  
  // Para Receita, adicionar também a Receita Empilhada
  if (item.category === "Receita") {
    const empilhadaData = filterByCategory(filteredByAssessor, "Receita Empilhada");
    const empilhadaRealized = empilhadaData.filter(d => isRealizedStatus(d.status));
    realizedValue += selectedMonth !== "all"
      ? getMonthValue(empilhadaRealized, selectedMonth)
      : empilhadaRealized.reduce((s, d) => s + d.total, 0);
  }
    
  return { label: item.label, value, realizedValue, isCurrency: item.isCurrency };
});
```

---

### Resultado

| Coluna | Antes | Depois |
|--------|-------|--------|
| **Meta** | Categoria "Receita" (Planejado Semana) | Sem alteração |
| **Realizado** | Apenas "Receita" (Realizado) | "Receita" + "Receita Empilhada" (Realizado) |
| **Falta** (verso) | Calculado incorretamente | Calculado corretamente |

Isso alinha o card com a lógica já usada no ICM Geral, ICM Semanal e Gauge de Receita XP.

