

# Plano: Adicionar Verde para KPIs Acima do Ritmo

## Objetivo
Destacar em verde os KPIs que estao acima ou igual ao ritmo ideal no relatorio PDF.

---

## Alteracoes Necessarias

### Arquivo: `src/lib/reportUtils.ts`

A cor verde ja esta definida em `COLORS.green: [34, 197, 94]`. Basta adicionar a logica condicional para aplicar verde quando `percentage >= ritmoIdeal`.

### Pontos de Alteracao

**1. ICM Geral (linha 88)**
```typescript
// Antes
const icmColor = dashboardData.icmGeral < ritmoIdeal ? COLORS.red : COLORS.text;

// Depois
const icmColor = dashboardData.icmGeral < ritmoIdeal ? COLORS.red : COLORS.green;
```

**2. Tabela Planejamento Semanal (linhas 149-157)**
```typescript
didParseCell: (data) => {
  if (data.section === 'body') {
    const percentage = semanalRows[data.row.index]?.[5] as number;
    if (percentage < ritmoIdeal) {
      data.cell.styles.textColor = COLORS.red;
    } else {
      data.cell.styles.textColor = COLORS.green; // ADICIONAR
    }
  }
}
```

**3. Tabela Metas Mensais (linhas 210-218)**
```typescript
didParseCell: (data) => {
  if (data.section === 'body') {
    const percentage = mensalRows[data.row.index]?.[5] as number;
    if (percentage < ritmoIdeal) {
      data.cell.styles.textColor = COLORS.red;
    } else {
      data.cell.styles.textColor = COLORS.green; // ADICIONAR
    }
  }
}
```

**4. Tabela Performance por Assessor (linhas 259-267)**
```typescript
didParseCell: (data) => {
  if (data.section === 'body') {
    const percentage = assessorRows[data.row.index]?.[3] as number;
    if (percentage < ritmoIdeal) {
      data.cell.styles.textColor = COLORS.red;
    } else {
      data.cell.styles.textColor = COLORS.green; // ADICIONAR
    }
  }
}
```

---

## Resultado Esperado

| Condicao | Cor |
|----------|-----|
| KPI abaixo do ritmo ideal | Vermelho (#DC2626) |
| KPI igual ou acima do ritmo ideal | Verde (#22c55e) |

