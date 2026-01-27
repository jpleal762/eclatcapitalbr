

## Plano: Melhorar Visualização "Falta por Assessor" na Página Sprint

### Situação Atual

O relatório Sprint **já possui** a informação "Falta por Assessor" (`assessorBreakdown`), mas está limitada:

1. **Exibição compacta**: Apenas 4 assessores aparecem numa única linha
2. **Só quando "Todos" selecionado**: Quando um assessor específico é filtrado, o breakdown não aparece
3. **Texto pequeno**: Difícil de ler em telas maiores

### Solução Proposta

Melhorar a visualização do breakdown para mostrar **todos os assessores** de forma clara e organizada.

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/SprintKPIBar.tsx` | **MODIFICAR** - Expandir visualização do breakdown |

---

### Layout Proposto

```text
ANTES (linha compacta):
┌─────────────────────────────────────────────────────────────┐
│ Falta: Marcelo -R$ 6 Mi  José -R$ 6 Mi  Hingrid -R$ 6 Mi +2 │
└─────────────────────────────────────────────────────────────┘

DEPOIS (lista organizada):
┌─────────────────────────────────────────────────────────────┐
│ 📋 Falta por Assessor:                                      │
│ ┌────────────┬────────────┬────────────┬────────────┐      │
│ │ Marcelo    │ José       │ Hingrid    │ Onacilda   │      │
│ │ R$ 6 Mi    │ R$ 6 Mi    │ R$ 6 Mi    │ R$ 5 Mi    │      │
│ └────────────┴────────────┴────────────┴────────────┘      │
│ ┌────────────┬────────────┐                                 │
│ │ Rômulo     │ ✓ Marcela  │                                 │
│ │ R$ 1 Mi    │ Meta       │                                 │
│ └────────────┴────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Detalhes Técnicos

#### Modificar SprintKPIBar.tsx - Novo layout para breakdown

```tsx
{/* Assessor Breakdown - grid format showing all assessors */}
{assessorBreakdown.length > 0 && (
  <div className="mt-auto pt-1 border-t border-border/50">
    <span className="text-[8px] lg:text-[9px] text-muted-foreground mb-1 block">
      Falta por Assessor:
    </span>
    <div className="grid grid-cols-4 lg:grid-cols-6 gap-1">
      {assessorBreakdown.map((assessor, idx) => (
        <div 
          key={idx} 
          className={cn(
            "flex flex-col items-center px-1 py-0.5 rounded text-center",
            assessor.achieved 
              ? "bg-green-500/10 text-green-500" 
              : "bg-destructive/10 text-destructive"
          )}
        >
          <span className="text-[8px] lg:text-[9px] font-medium truncate w-full">
            {assessor.name}
          </span>
          <span className="text-[9px] lg:text-[10px] font-bold">
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

### Cálculo do Breakdown

A função `calculateWeeklyRemainingByAssessor` em `kpiUtils.ts` já calcula corretamente:

1. Para cada assessor, calcula `meta semanal - realizado`
2. Filtra assessores que já atingiram meta (`!a.achieved`)
3. Ordena por maior falta primeiro

**Observação**: Atualmente só mostra assessores que **não** atingiram a meta. Se quiser mostrar todos (incluindo os que bateram com ✓), precisamos ajustar a função.

---

### Opção Adicional: Mostrar Todos Assessores

Se quiser ver também quem já bateu a meta:

**Modificar kpiUtils.ts linha 1172:**

```typescript
// ANTES: Só mostrar quem ainda precisa produzir
.filter(a => !a.achieved)

// DEPOIS: Mostrar todos, ordenando por falta (quem bateu vai pro final)
.sort((a, b) => {
  if (a.achieved && !b.achieved) return 1;
  if (!a.achieved && b.achieved) return -1;
  return b.remaining - a.remaining;
});
```

---

### Benefícios

1. **Visualização completa** - Todos os assessores visíveis em grade organizada
2. **Cores indicativas** - Vermelho para quem falta, verde para quem bateu
3. **Compacto mas legível** - Grid responsivo de 4-6 colunas
4. **Consistência visual** - Mantém o padrão do dashboard principal

