

## Correção: Mapeamento de Meses Inglês → Português

### Problema Identificado

O `currentMonth` está chegando como **"Feb-26"** (inglês) mas o array `monthNames` usa abreviações em **português** ("jan", "fev", "mar"...).

Logs confirmam:
```
currentMonth: Feb-26
monthStr: "feb"
currentMonthIndex: -1  ← "feb" não existe em ["jan", "fev", "mar"...]
```

---

### Solução

Adicionar um mapeamento de meses em inglês para português na função `calculateAccumulatedGaps`.

---

### Arquivo a Modificar

**`src/lib/kpiUtils.ts`** - Função `calculateAccumulatedGaps`

Adicionar mapeamento após extrair `monthStr`:

```typescript
// Mapeamento inglês → português
const englishToPortuguese: { [key: string]: string } = {
  "jan": "jan",
  "feb": "fev",
  "mar": "mar",
  "apr": "abr",
  "may": "mai",
  "jun": "jun",
  "jul": "jul",
  "aug": "ago",
  "sep": "set",
  "oct": "out",
  "nov": "nov",
  "dec": "dez"
};

const separator = currentMonth.includes("/") ? "/" : "-";
let [monthStr, yearStr] = currentMonth.toLowerCase().split(separator);

// Converter inglês para português se necessário
monthStr = englishToPortuguese[monthStr] || monthStr;

const currentMonthIndex = monthNames.indexOf(monthStr);
```

---

### Resultado Esperado

Após a correção:
```
currentMonth: Feb-26
monthStr: "feb" → "fev" (convertido)
currentMonthIndex: 1 ✓
```

Isso permitirá que a função encontre os meses anteriores (Janeiro/jan-26) e calcule os gaps corretamente.

---

### Verificação

Após implementar:
1. O log deve mostrar `currentMonthIndex: 1` para Fevereiro
2. `previousMonths` deve conter `["jan-26"]`
3. Gaps devem ser calculados e aplicados às metas

