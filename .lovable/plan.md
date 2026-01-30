
## Plano: Dobrar Tamanho dos Top 2 Gaps de Assessores

### Objetivo
Aumentar em 2x o tamanho do texto dos "Top 2 Assessor Gaps" na análise trimestral (ex: "BRUNO: -R$ 150K") sem impactar o layout.

---

### Arquivo a Modificar
**`src/components/dashboard/QuarterlyKPIBar.tsx`**

---

### Alteração

**Linha 112 - Top 2 Assessor Gaps:**

| Propriedade | Atual | Novo |
|-------------|-------|------|
| Tamanho fonte | `text-scale-4` | `text-scale-8` |

No sistema de escala, `text-scale-4` é ~8px e `text-scale-8` é ~16px (dobro).

**Código atual:**
```tsx
{topAssessorGaps.map(a => <span key={a.name} className="px-0.5 py-[1px] text-scale-4 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-right font-semibold">
    {a.name}: -{formatValue(a.gap, isCurrency)}
  </span>)}
```

**Código novo:**
```tsx
{topAssessorGaps.map(a => <span key={a.name} className="px-0.5 py-[1px] text-scale-8 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-right font-semibold">
    {a.name}: -{formatValue(a.gap, isCurrency)}
  </span>)}
```

---

### Por que não impacta o layout

1. Os gaps ficam em uma `div` flexível com `gap-0.5` que se ajusta automaticamente
2. O container pai usa `flex justify-between` - elementos se redistribuem
3. O texto maior ainda cabe na linha horizontal existente

---

### Resultado Visual

**Antes:**
```
R$ 500K / R$ 1Mi    BRUNO: -R$ 150K  ANA: -R$ 120K    Ritmo: -R$ 200K
                    (pequeno)
```

**Depois:**
```
R$ 500K / R$ 1Mi    BRUNO: -R$ 150K  ANA: -R$ 120K    Ritmo: -R$ 200K
                    (2x maior, mais visível)
```
