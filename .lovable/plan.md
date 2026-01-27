

## Plano: Melhorar Legibilidade do "Falta por Assessor"

### Problema Atual

1. **Nomes truncados** - A classe `truncate` corta nomes longos
2. **Texto muito pequeno** - Fontes de 8px e 9px dificultam leitura
3. **Grid muito apertado** - 4-6 colunas comprimem o conteúdo

### Solução

Ajustar estilos para melhor legibilidade mantendo a mesma estrutura de grid:

---

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/SprintKPIBar.tsx` | **MODIFICAR** - Ajustar tamanhos de fonte e remover truncate |

---

### Alterações Específicas (linhas 138-168)

| Elemento | Antes | Depois |
|----------|-------|--------|
| Grid | `grid-cols-4 lg:grid-cols-6` | `grid-cols-3 lg:grid-cols-4` |
| Título seção | `text-[8px] lg:text-[9px]` | `text-[9px] lg:text-[10px]` |
| Nome assessor | `text-[8px] lg:text-[9px] truncate` | `text-[10px] lg:text-[11px]` (sem truncate) |
| Valor/Check | `text-[9px] lg:text-[10px]` | `text-[11px] lg:text-[12px]` |
| Espaçamento | `gap-1 px-1 py-0.5` | `gap-1.5 px-1.5 py-1` |

---

### Código Atualizado

```tsx
{/* Assessor Breakdown - grid format showing all assessors */}
{assessorBreakdown.length > 0 && (
  <div className="mt-auto pt-1 border-t border-border/50">
    <span className="text-[9px] lg:text-[10px] text-muted-foreground mb-1 block">
      Falta por Assessor:
    </span>
    <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5">
      {assessorBreakdown.map((assessor, idx) => (
        <div 
          key={idx} 
          className={cn(
            "flex flex-col items-center px-1.5 py-1 rounded text-center",
            assessor.achieved 
              ? "bg-green-500/10 text-green-500" 
              : "bg-destructive/10 text-destructive"
          )}
        >
          <span className="text-[10px] lg:text-[11px] font-medium">
            {assessor.name}
          </span>
          <span className="text-[11px] lg:text-[12px] font-bold">
            {assessor.achieved 
              ? "✓" 
              : formatValue(assessor.remaining, isCurrency)
            }
          </span>
        </div>
      ))}
    </div>
  </div>
)}
```

---

### Comparação Visual

```text
ANTES (difícil leitura):
┌─────┬─────┬─────┬─────┬─────┬─────┐
│Marc.│José │Hing.│Onac.│Rôm. │✓Marc│  ← Nomes cortados
│R$6M │R$6M │R$6M │R$5M │R$1M │     │  ← Texto 8-9px
└─────┴─────┴─────┴─────┴─────┴─────┘

DEPOIS (legível):
┌─────────┬─────────┬─────────┬─────────┐
│ Marcelo │  José   │ Hingrid │Onacilda │  ← Nomes completos
│ R$ 6 Mi │ R$ 6 Mi │ R$ 6 Mi │ R$ 5 Mi │  ← Texto 10-12px
├─────────┼─────────┼─────────┼─────────┤
│ Rômulo  │✓Marcela │         │         │
│ R$ 1 Mi │         │         │         │
└─────────┴─────────┴─────────┴─────────┘
```

---

### Benefícios

1. **Nomes completos** - Remove `truncate` para exibir nomes inteiros
2. **Fonte maior** - De 8-9px para 10-12px, mais legível
3. **Mais espaço** - Grid de 3-4 colunas dá mais respiro visual
4. **Mesma estrutura** - Mantém o layout de cards sem mudanças estruturais

