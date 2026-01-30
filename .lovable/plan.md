

## Plano: Remover Sprint do Giro Automático de Telas

### Objetivo
Remover a página "Sprint" da rotação automática de páginas, mantendo apenas Dashboard, Análises e Prospecção no ciclo de 90 segundos.

---

### Arquivo a Modificar
**`src/pages/Index.tsx`**

---

### Alteração

**Linha 435 - Array de rotação:**

| Atual | Novo |
|-------|------|
| `["dashboard", "analysis", "sprint", "prospection"]` | `["dashboard", "analysis", "prospection"]` |

**Código atual:**
```tsx
const pageOrder: PageType[] = ["dashboard", "analysis", "sprint", "prospection"];
```

**Código novo:**
```tsx
const pageOrder: PageType[] = ["dashboard", "analysis", "prospection"];
```

---

### Resultado

- A página Sprint continua acessível manualmente pelo botão de navegação
- A rotação automática passa a ser: **Dashboard → Análises → Prospecção → Dashboard...**
- Ciclo de 3 páginas × 90 segundos = 4.5 minutos por volta completa

