

## Plano: Corrigir Histórico ICM para Usar Calendário Real

### Problema Identificado

A função `getHistoricalMonthsFromCurrent` busca meses anteriores baseada no **índice do array** de meses disponíveis, não no **calendário real**. Isso causa problemas quando:

1. O array não contém todos os meses consecutivos
2. A ordenação do array tem falhas
3. A transição de ano (Jan-26 → Dez-25 → Nov-25) não é calculada corretamente

**Exemplo do bug:**
- Mês atual: Janeiro 2026
- Array de meses: `["nov-25", "dez-25", "jan-26", "fev-26"]`
- Se a busca por índice falha, pode retornar "fev-26" em vez de "nov-25"

### Solução

Modificar `getHistoricalMonthsFromCurrent` para **calcular os meses anteriores baseado no calendário**, independente de como os dados estão no array.

---

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/lib/kpiUtils.ts` | **MODIFICAR** - Função `getHistoricalMonthsFromCurrent` para usar cálculo de calendário |

---

### Detalhes Técnicos

#### Modificar função `getHistoricalMonthsFromCurrent` (linhas 501-535)

**Antes (usa índice do array):**
```typescript
export function getHistoricalMonthsFromCurrent(
  availableMonths: string[], 
  count: number = 2
): string[] {
  const currentMonth = getCurrentMonthFormatted();
  
  if (availableMonths.length === 0) return [];
  
  const normalizeMonth = (m: string) => m.toLowerCase().replace("-", "/");
  const normalizedCurrent = normalizeMonth(currentMonth);
  
  const currentIndex = availableMonths.findIndex(m => 
    normalizeMonth(m) === normalizedCurrent
  );
  
  if (currentIndex === -1) {
    // Current month not in data, use most recent available
    const lastIndex = availableMonths.length - 1;
    const result: string[] = [];
    for (let i = count; i >= 1 && lastIndex - i >= 0; i--) {
      result.push(availableMonths[lastIndex - i]);
    }
    result.push(availableMonths[lastIndex]);
    return result;
  }
  
  // Get previous months + current month
  const result: string[] = [];
  for (let i = count; i >= 1 && currentIndex - i >= 0; i--) {
    result.push(availableMonths[currentIndex - i]);
  }
  result.push(availableMonths[currentIndex]);
  
  return result;
}
```

**Depois (usa cálculo de calendário):**
```typescript
export function getHistoricalMonthsFromCurrent(
  availableMonths: string[], 
  count: number = 2
): string[] {
  if (availableMonths.length === 0) return [];
  
  const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0-11
  const currentYear = now.getFullYear() % 100; // 26 para 2026
  
  const normalizeMonth = (m: string) => m.toLowerCase().replace("-", "/");
  
  // Calculate the previous N months based on calendar (not array index)
  const calendarMonths: string[] = [];
  for (let i = count; i >= 0; i--) {
    let targetMonthIdx = currentMonthIdx - i;
    let targetYear = currentYear;
    
    // Handle year rollback (e.g., January - 2 = November of previous year)
    while (targetMonthIdx < 0) {
      targetMonthIdx += 12;
      targetYear -= 1;
    }
    
    const monthStr = `${monthNames[targetMonthIdx]}-${targetYear.toString().padStart(2, '0')}`;
    calendarMonths.push(monthStr);
  }
  
  // Find matching months in availableMonths (case-insensitive, separator-agnostic)
  const result: string[] = [];
  for (const calMonth of calendarMonths) {
    const normalizedCal = normalizeMonth(calMonth);
    const found = availableMonths.find(m => normalizeMonth(m) === normalizedCal);
    if (found) {
      result.push(found);
    }
  }
  
  return result;
}
```

---

### Lógica do Cálculo de Calendário

```text
Mês atual: Janeiro 2026 (monthIdx = 0, year = 26)

Cálculo dos 2 meses anteriores + atual:
├── i = 2: monthIdx = 0 - 2 = -2 → -2 + 12 = 10, year = 25 → "nov-25"
├── i = 1: monthIdx = 0 - 1 = -1 → -1 + 12 = 11, year = 25 → "dez-25"
└── i = 0: monthIdx = 0 - 0 = 0, year = 26 → "jan-26"

Resultado: ["nov-25", "dez-25", "jan-26"] ✅
```

---

### Comportamento Final

| Mês Atual | Histórico Calculado |
|-----------|---------------------|
| Janeiro 2026 | NOV-25 → DEZ-25 → **JAN-26** |
| Fevereiro 2026 | DEZ-25 → JAN-26 → **FEV-26** |
| Março 2026 | JAN-26 → FEV-26 → **MAR-26** |

---

### Benefícios

1. **Calendário Real** - Calcula meses baseado na data atual, não no array
2. **Transição de Ano** - Funciona corretamente na virada de ano (Jan → Dez → Nov)
3. **Robustez** - Não depende da ordem ou completude do array de meses
4. **Flexibilidade** - Se um mês não existe nos dados, simplesmente não é incluído no resultado

