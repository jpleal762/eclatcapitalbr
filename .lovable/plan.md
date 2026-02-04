
# Plano: Aproximar Mais os Percentuais dos Gauges

## Alteracoes

### 1. `src/components/dashboard/GaugeChart.tsx` (linha 215)

```typescript
// Antes
<div className="flex justify-center flex-shrink-0 -mb-1">

// Depois
<div className="flex justify-center flex-shrink-0 -mb-2">
```

### 2. `src/components/dashboard/YearlyGaugeChart.tsx` (linha 72)

```typescript
// Antes
<div className="flex justify-center -mb-1">

// Depois
<div className="flex justify-center -mb-2">
```

Aumentar a margem negativa de `-mb-1` para `-mb-2` em ambos os componentes.
