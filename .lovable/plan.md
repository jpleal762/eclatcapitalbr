
## Ajuste dos assessores no card de Evolucao

### Mudancas

**Arquivo: `src/components/dashboard/EvolutionCard.tsx`**

1. **Primeiro nome apenas** - Extrair apenas o primeiro nome do assessor usando `a.name.split(" ")[0]` ao inves do nome completo.

2. **Layout: assessores ao lado do delta, um embaixo do outro, mesmo tamanho** - Mudar a area dos assessores de `flex gap-1 flex-wrap` (horizontal) para uma coluna vertical ao lado do valor do delta, com o mesmo tamanho de fonte (`text-scale-6 font-bold`):

```tsx
<div className="min-w-0 flex-1">
  <span className="text-scale-5 text-muted-foreground block truncate">{item.label}</span>
  <div className="flex items-start gap-1.5">
    <span className={`text-scale-6 font-bold ... `}>
      {isPositive ? "+" : ""}{formatValue(item.delta, item.isCurrency)}
    </span>
    {item.worstAssessors?.length > 0 && (
      <div className="flex flex-col">
        {item.worstAssessors.map(a => (
          <span key={a.name} className="text-scale-6 font-bold text-red-500/70">
            {a.name.split(" ")[0]} {a.delta >= 0 ? "+" : ""}{formatValue(a.delta, item.isCurrency)}
          </span>
        ))}
      </div>
    )}
  </div>
</div>
```

- O delta principal fica a esquerda
- Os 2 piores assessores ficam a direita, empilhados verticalmente
- Mesmo tamanho de fonte (`text-scale-6 font-bold`) que o numero principal
- Cor diferenciada (`text-red-500/70`) para distinguir

### Arquivo editado
- `src/components/dashboard/EvolutionCard.tsx`
