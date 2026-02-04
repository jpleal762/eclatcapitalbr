
# Plano: Aproximar Percentuais das Barras dos Gauges

## Objetivo
Reduzir o espaco entre os labels de porcentagem e os arcos dos gauges.

---

## Alteracoes

### 1. `src/components/dashboard/GaugeChart.tsx` (linha 215)

Adicionar margem inferior negativa ao container do percentual:

```typescript
// Antes
<div className="flex justify-center flex-shrink-0">

// Depois
<div className="flex justify-center flex-shrink-0 -mb-1">
```

### 2. `src/components/dashboard/YearlyGaugeChart.tsx` (linha 72)

Adicionar margem inferior negativa ao container do percentual:

```typescript
// Antes
<div className="flex justify-center">

// Depois
<div className="flex justify-center -mb-1">
```

---

## Resultado

Os percentuais ficarao mais proximos dos arcos dos gauges, eliminando o espaco excessivo entre eles.
