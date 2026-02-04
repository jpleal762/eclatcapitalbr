
# Plano: Reduzir Escala dos Percentuais nos Gauges pela Metade

## Objetivo
Diminuir em 50% o tamanho dos textos de porcentagem em todos os componentes de gauge.

---

## Arquivos a Modificar

### 1. `src/components/dashboard/GaugeChart.tsx`

**Linha 216 - Percentual acima do gauge:**

| Antes | Depois |
|-------|--------|
| `text-[clamp(18px,2.5vw,28px)]` | `text-[clamp(9px,1.25vw,14px)]` |

```typescript
// Antes
<span className={`text-[clamp(18px,2.5vw,28px)] font-bold ...`}>
  {percentage}%
</span>

// Depois (metade)
<span className={`text-[clamp(9px,1.25vw,14px)] font-bold ...`}>
  {percentage}%
</span>
```

### 2. `src/components/dashboard/YearlyGaugeChart.tsx`

**Linha 73 - Percentual acima do gauge:**

| Antes | Depois |
|-------|--------|
| `text-responsive-sm` | `text-responsive-xs` |

```typescript
// Antes
<span className="text-responsive-sm font-bold text-outline" ...>
  {percentage}%
</span>

// Depois (classe menor)
<span className="text-responsive-xs font-bold text-outline" ...>
  {percentage}%
</span>
```

---

## Resumo

| Componente | Valor Atual | Novo Valor |
|------------|-------------|------------|
| GaugeChart | `clamp(18px, 2.5vw, 28px)` | `clamp(9px, 1.25vw, 14px)` |
| YearlyGaugeChart | `text-responsive-sm` | `text-responsive-xs` |

Ambas as mudancas reduzem o tamanho pela metade, mantendo a proporcionalidade responsiva.
