

## Plano: Aumentar Percentuais em ICM Geral por Assessor em 2x

### Objetivo

Dobrar o tamanho das porcentagens exibidas no card "ICM Geral por Assessor" (AssessorChart).

---

### Arquivo a Modificar

**`src/components/dashboard/AssessorChart.tsx`**

### Alterações

| Linha | Elemento | Atual | Novo |
|-------|----------|-------|------|
| ~101 | ICM Geral % (gold) | `text-[5px]` | `text-scale-10` |
| ~104 | ICM Semanal % (blue) | `text-[5px]` | `text-scale-10` |

---

### Código Atual (linhas 99-106)

```tsx
<div className="text-right flex-shrink-0">
  <span className="text-[5px] font-bold text-eclat-gold">
    {assessor.geralPercentage}%
  </span>
  <span className="text-[5px] font-medium text-blue-500 block leading-tight">
    {assessor.semanaPercentage}%
  </span>
</div>
```

### Código Novo

```tsx
<div className="text-right flex-shrink-0">
  <span className="text-scale-10 font-bold text-eclat-gold">
    {assessor.geralPercentage}%
  </span>
  <span className="text-scale-10 font-medium text-blue-500 block leading-tight">
    {assessor.semanaPercentage}%
  </span>
</div>
```

---

### Resultado Esperado

- Percentuais ICM Geral (gold): 5px → 10px base (dobrado)
- Percentuais ICM Semanal (blue): 5px → 10px base (dobrado)
- Ambos responderão ao seletor de zoom global (1x a 2x)

