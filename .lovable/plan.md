
## Plano: Triplicar Tamanho dos Nomes dos KPIs na Análise Trimestral

### Objetivo
Aumentar em 3x o tamanho dos nomes de cada KPI (ex: "Primeiras Reuniões", "Captação NET") na página de Análise Trimestral sem impactar o layout.

---

### Arquivo a Modificar
**`src/components/dashboard/QuarterlyKPIBar.tsx`**

---

### Alteração

**Linha 61 - Nome do KPI (label):**

| Propriedade | Atual | Novo |
|-------------|-------|------|
| Tamanho mobile | `text-scale-5` | `text-scale-11` |
| Tamanho desktop | `lg:text-scale-6` | `lg:text-scale-12` |

O sistema de escala usa multiplicadores onde cada nível é ~1.2x maior. Para triplicar:
- `text-scale-5` (~10px) → `text-scale-11` (~28-30px)
- `text-scale-6` (~12px) → `text-scale-12` (~32-36px)

**Código atual:**
```tsx
<span className="font-semibold text-foreground text-scale-5 lg:text-scale-6 truncate">{label}</span>
```

**Código novo:**
```tsx
<span className="font-semibold text-foreground text-scale-11 lg:text-scale-12 truncate">{label}</span>
```

---

### Por que não impacta o layout

1. **`truncate`** já está aplicado - nomes longos serão cortados com "..."
2. Layout usa **flexbox** com `justify-between` - nome e porcentagem se ajustam automaticamente
3. A altura do container é flexível (`h-full flex flex-col`)

---

### Resultado Visual

**Antes:**
```
Primeiras Reuniões                    75%
████████████░░░░░░░░░░
```

**Depois:**
```
PRIMEIRAS REUNIÕES                    75%
████████████░░░░░░░░░░
```
(com nome 3x maior e mais impactante)
