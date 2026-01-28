

## Plano: Ajustar Estilo do "Falta" Total

### Objetivo

Remover o fundo vermelho do valor total "Falta" (exibido na linha superior), mantendo apenas o texto em vermelho - igual ao padrão do "Real" que só tem o número verde.

O fundo vermelho permanece apenas na seção "Falta por Assessor".

---

### Alteração

**Arquivo:** `src/components/dashboard/SprintKPIBar.tsx`

**Linha 104-108** - Grid de valores (Falta total):

```tsx
// ANTES
<div className={cn(
  isCompleted 
    ? "text-green-500" 
    : "text-red-400 font-bold bg-red-500/15 px-1 rounded"
)}>

// DEPOIS
<div className={cn(
  isCompleted 
    ? "text-green-500" 
    : "text-red-400 font-bold"
)}>
```

---

### Resultado Visual

| Elemento | Estilo |
|----------|--------|
| **Meta** | `text-muted-foreground` + `text-foreground` (padrão) |
| **Real** | `text-muted-foreground` + `text-green-500` (só texto verde) |
| **Falta total** | `text-muted-foreground` + `text-red-400` (só texto vermelho) ✅ |
| **Falta por Assessor** | `bg-red-500/20` + `text-red-400` + `border` (com fundo vermelho) |

---

### Comparação

- **Antes**: "Falta: R$ 500K" tinha fundo vermelho claro
- **Depois**: "Falta: R$ 500K" apenas texto vermelho, sem fundo (igual ao "Real")

