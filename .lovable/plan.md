

## Plano: Destacar Nomes dos Assessores em Caixa Alta

### Objetivo
Exibir os nomes dos assessores em letras maiúsculas (caixa alta) com maior destaque visual, mantendo o layout atual intacto.

---

### Arquivo a Modificar
**`src/components/dashboard/AssessorChart.tsx`**

---

### Alteração

**Linha 92 - Nome do assessor:**

| Propriedade | Atual | Novo |
|-------------|-------|------|
| Texto | Normal (como está) | `uppercase` (caixa alta) |
| Peso da fonte | `font-medium` | `font-semibold` |
| Tamanho | `text-responsive-3xs` | `text-responsive-3xs` (sem mudança) |

**Código atual:**
```tsx
<p className="text-responsive-3xs font-medium text-foreground truncate">{assessor.name}</p>
```

**Código novo:**
```tsx
<p className="text-responsive-3xs font-semibold text-foreground truncate uppercase tracking-wide">{assessor.name}</p>
```

---

### Classes Adicionadas

| Classe | Efeito |
|--------|--------|
| `uppercase` | Transforma texto para CAIXA ALTA |
| `font-semibold` | Aumenta peso da fonte (mais negrito que `font-medium`) |
| `tracking-wide` | Aumenta levemente o espaçamento entre letras para melhor legibilidade em caixa alta |

---

### Resultado Visual

**Antes:**
```
🕐 Bruno    ████████████░░░░  75%
🕐 Ana      ██████████░░░░░░  68%
```

**Depois:**
```
🕐 BRUNO    ████████████░░░░  75%
🕐 ANA      ██████████░░░░░░  68%
```

- Nomes em caixa alta com maior peso visual
- Mesmo tamanho de fonte - layout preservado
- Espaçamento entre letras otimizado para legibilidade

