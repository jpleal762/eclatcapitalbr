

## Plano: Corrigir Ordenação dos Meses Históricos

### Problema Identificado

A função `getAvailableMonths` usa `.split("/")` para separar mês e ano, mas os dados do Excel podem vir com formato `JAN-26` (usando hífen `-`). Isso causa:

1. `"JAN-26".split("/")` → `["JAN-26"]` (1 elemento só)
2. `yearA` = `undefined`, `monthA` = `"JAN-26"`
3. Ordenação falha completamente
4. Meses ficam em ordem alfabética em vez de cronológica
5. **FEV** vem antes de **NOV** alfabeticamente, causando o bug

### Solução

Modificar `getAvailableMonths` para suportar **ambos os separadores** (`/` e `-`).

---

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/kpiUtils.ts` | **MODIFICAR** - Função `getAvailableMonths` para suportar hífen |

---

### Detalhes Técnicos

#### Modificar função `getAvailableMonths` (linhas 123-135)

**Antes:**
```typescript
export function getAvailableMonths(data: ProcessedKPI[]): string[] {
  const months = new Set<string>();
  data.forEach((record) => {
    record.monthlyData.forEach((m) => months.add(m.month));
  });
  return Array.from(months).sort((a, b) => {
    const [monthA, yearA] = a.split("/");
    const [monthB, yearB] = b.split("/");
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
    const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return monthOrder.indexOf(monthA.toLowerCase()) - monthOrder.indexOf(monthB.toLowerCase());
  });
}
```

**Depois:**
```typescript
export function getAvailableMonths(data: ProcessedKPI[]): string[] {
  const months = new Set<string>();
  data.forEach((record) => {
    record.monthlyData.forEach((m) => months.add(m.month));
  });
  
  // Helper to parse month string with either "/" or "-" separator
  const parseMonth = (m: string): { month: string; year: number } => {
    const separator = m.includes("/") ? "/" : "-";
    const parts = m.split(separator);
    const monthStr = parts[0]?.toLowerCase() || "";
    const yearStr = parts[1] || "0";
    return {
      month: monthStr,
      year: parseInt(yearStr) || 0
    };
  };
  
  const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  
  return Array.from(months).sort((a, b) => {
    const parsedA = parseMonth(a);
    const parsedB = parseMonth(b);
    
    // Sort by year first
    if (parsedA.year !== parsedB.year) {
      return parsedA.year - parsedB.year;
    }
    
    // Then sort by month order
    return monthOrder.indexOf(parsedA.month) - monthOrder.indexOf(parsedB.month);
  });
}
```

---

### Resultado Esperado

Com Janeiro 2026 como mês atual:

| Antes (Bug) | Depois (Corrigido) |
|-------------|---------------------|
| DEZ, FEV, JAN | NOV, DEZ, JAN |
| ❌ Fevereiro aparece | ✅ Novembro 2025 aparece |

#### Ordem Cronológica Correta:
```
... → OUT/25 → NOV/25 → DEZ/25 → JAN/26 → FEV/26 → ...
```

Quando selecionamos Janeiro/26 como mês atual:
- **2 meses anteriores**: NOV/25, DEZ/25
- **Mês atual**: JAN/26

---

### Benefícios

1. **Suporte a ambos formatos** - Funciona com `/` ou `-` como separador
2. **Ordenação cronológica correta** - Meses ordenados por ano, depois por mês
3. **Histórico correto** - Novembro e Dezembro aparecem como meses anteriores a Janeiro
4. **Retrocompatível** - Não quebra dados existentes com formato `/`

