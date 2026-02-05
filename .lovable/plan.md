
# Plano: Substituir Receita por Receita PJ1 XP e PJ2 XP no Card Semanal

## Objetivo
No card "Planejamento Semanal Acumulado", remover a linha "Receita" e adicionar duas novas linhas:
- **Receita PJ1 XP**: Meta de "PJ1 XP Mês" (Planejado Semana), Realizado de "PJ1 XP" (Realizado)
- **Receita PJ2 XP**: Meta de "PJ2 XP Mês" (Planejado Semana), Realizado de "PJ2 XP" + "Receita Empilhada" (Realizado)

---

## Alteracoes

### Arquivo: `src/lib/kpiUtils.ts`

#### 1. Atualizar array metaSemanalCategories (linhas 1010-1018)

**Antes:**
```typescript
const metaSemanalCategories = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  { category: "Receita", label: "Receita", isCurrency: true },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação (ROA>1,5)", isCurrency: true },
  { category: "Parceiros Tri", label: "Receita Parceiros", isCurrency: true },
  { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false },
];
```

**Depois:**
```typescript
const metaSemanalCategories = [
  { category: "Captação net", label: "Captação NET", isCurrency: true },
  // Receita PJ1 XP: Meta = PJ1 XP Mês (Planejado Semana), Realizado = PJ1 XP (Realizado)
  { category: "PJ1 XP Mês", label: "Receita PJ1 XP", isCurrency: true, actualCategory: "PJ1 XP" },
  // Receita PJ2 XP: Meta = PJ2 XP Mês (Planejado Semana), Realizado = PJ2 XP + Receita Empilhada (Realizado)
  { category: "PJ2 XP Mês", label: "Receita PJ2 XP", isCurrency: true, actualCategory: "PJ2 XP", additionalActualCategory: "Receita Empilhada" },
  { category: "Diversificada ( ROA>1,5)", label: "Diversificação (ROA>1,5)", isCurrency: true },
  { category: "Parceiros Tri", label: "Receita Parceiros", isCurrency: true },
  { category: "Primeira reuniao", label: "Primeiras Reuniões", isCurrency: false },
  { category: "Habilitacao", label: "Habilitação", isCurrency: false },
  { category: "Ativacao", label: "Ativação", isCurrency: false },
];
```

#### 2. Atualizar logica do map metaSemanal (linhas 1020-1043)

**Antes:** A logica tratava apenas "Receita" como caso especial.

**Depois:** Tratar casos onde `actualCategory` e `additionalActualCategory` sao definidos:

```typescript
const metaSemanal: MetaSemanal[] = metaSemanalCategories.map(item => {
  const catData = filterByCategory(filteredByAssessor, item.category);
  const weeklyPlanned = catData.filter(d => isPlannedWeekStatus(d.status));
  
  const value = selectedMonth !== "all" 
    ? getMonthValue(weeklyPlanned, selectedMonth)
    : weeklyPlanned.reduce((s, d) => s + d.total, 0);
  
  // Determinar categoria para valor realizado
  const actualCat = (item as any).actualCategory || item.category;
  const actualCatData = filterByCategory(filteredByAssessor, actualCat);
  const realizedData = actualCatData.filter(d => isRealizedStatus(d.status));
  
  let realizedValue = selectedMonth !== "all"
    ? getMonthValue(realizedData, selectedMonth)
    : realizedData.reduce((s, d) => s + d.total, 0);
  
  // Adicionar categoria adicional se definida (ex: Receita Empilhada)
  if ((item as any).additionalActualCategory) {
    const additionalData = filterByCategory(filteredByAssessor, (item as any).additionalActualCategory);
    const additionalRealized = additionalData.filter(d => isRealizedStatus(d.status));
    realizedValue += selectedMonth !== "all"
      ? getMonthValue(additionalRealized, selectedMonth)
      : additionalRealized.reduce((s, d) => s + d.total, 0);
  }
    
  return { label: item.label, value, realizedValue, isCurrency: item.isCurrency };
});
```

#### 3. Atualizar weeklyCategories para calculo de percentual (linhas 1047-1055)

**Antes:**
```typescript
const weeklyCategories = [
  "Habilitacao",
  "Ativacao",
  "Captacao net",
  "Diversificada ( ROA>1,5)",
  "Receita",
  "Parceiros Tri",
  "Primeira Reuniao"
];
```

**Depois:**
```typescript
const weeklyCategories = [
  "Habilitacao",
  "Ativacao",
  "Captacao net",
  "Diversificada ( ROA>1,5)",
  "PJ1 XP Mês",  // Substituido de "Receita"
  "PJ2 XP Mês",  // Adicionado
  "Parceiros Tri",
  "Primeira Reuniao"
];
```

---

## Resumo das Mudancas

| Item | Antes | Depois |
|------|-------|--------|
| Linha 2 do card | Receita | Receita PJ1 XP |
| Linha 3 do card | - | Receita PJ2 XP (nova) |
| Meta PJ1 XP | - | PJ1 XP Mês + Planejado Semana |
| Realizado PJ1 XP | - | PJ1 XP + Realizado |
| Meta PJ2 XP | - | PJ2 XP Mês + Planejado Semana |
| Realizado PJ2 XP | - | PJ2 XP + Receita Empilhada + Realizado |

O card passara a ter 8 linhas (era 7), seguindo a mesma logica de calculo dos gauges individuais de PJ1 XP e PJ2 XP.
