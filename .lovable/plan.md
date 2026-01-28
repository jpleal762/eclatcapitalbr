
## Plano: Cores Condicionais para "Falta por Assessor" na Sprint

### Objetivo

Adicionar lógica de cores baseada no progresso individual de cada assessor:
- **Verde**: Meta atingida (100%)
- **Amarelo**: Progresso > 50% da meta
- **Vermelho**: Progresso < 50% da meta

---

### Arquivo a Modificar

**`src/components/dashboard/SprintKPIBar.tsx`**

---

### Lógica de Cálculo

```text
Meta Individual = contribution + remaining
Progresso % = (contribution / Meta Individual) × 100

Se achieved = true → Verde
Se progresso >= 50% → Amarelo  
Se progresso < 50% → Vermelho
```

---

### Alterações no Código

#### Linhas 149-168: Substituir lógica binária por ternária

**Código Atual:**
```tsx
{assessorBreakdown.map((assessor, idx) => (
  <div 
    key={idx} 
    className={cn(
      "flex flex-col items-center px-1 py-1 rounded text-center",
      assessor.achieved 
        ? "bg-green-500/15 text-green-400 border border-green-500/20" 
        : "bg-red-500/20 text-red-400 border border-red-500/30"
    )}
  >
```

**Código Novo:**
```tsx
{assessorBreakdown.map((assessor, idx) => {
  // Calcular progresso individual
  const individualTarget = (assessor.contribution || 0) + assessor.remaining;
  const progressPercent = individualTarget > 0 
    ? ((assessor.contribution || 0) / individualTarget) * 100 
    : 0;
  
  // Determinar classe de cor
  const colorClass = assessor.achieved
    ? "bg-green-500/15 text-green-400 border border-green-500/20"
    : progressPercent >= 50
      ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
      : "bg-red-500/20 text-red-400 border border-red-500/30";
  
  return (
    <div 
      key={idx} 
      className={cn(
        "flex flex-col items-center px-1 py-1 rounded text-center",
        colorClass
      )}
    >
      <span className="text-scale-5 lg:text-scale-6 font-medium">
        {assessor.name}
      </span>
      <span className="text-scale-6 font-bold">
        {assessor.achieved 
          ? "✓" 
          : formatValue(assessor.remaining, isCurrency)
        }
      </span>
    </div>
  );
})}
```

---

### Resultado Visual

| Progresso | Fundo | Texto | Borda |
|-----------|-------|-------|-------|
| 100% (atingiu) | verde/15 | verde-400 | verde/20 |
| ≥50% | amarelo/20 | amarelo-500 | amarelo/30 |
| <50% | vermelho/20 | vermelho-400 | vermelho/30 |

---

### Dados Utilizados

O tipo `AssessorWeeklyRemaining` já possui:
- `contribution?: number` - quanto já contribuiu
- `remaining: number` - quanto falta
- `achieved: boolean` - se atingiu a meta

A soma `contribution + remaining` representa a meta individual do assessor.
