

## Correção: Filtro de Meses Anteriores Incluindo Meses Incorretos

### Problema Identificado

Na função `calculateAccumulatedGaps`, linha 820:
```typescript
const mIndex = monthNames.indexOf(mStr); // mStr = "mar" (inglês) → índice -1
```

O mês "mar" (março em inglês/português é igual) funciona, mas outros meses como "feb" retornam -1.

**O bug real**: Quando `mIndex = -1` (mês não reconhecido), a condição `mIndex < currentMonthIndex` é verdadeira (-1 < 1), então meses "inválidos" são incluídos erroneamente.

### Solução

Aplicar o mesmo mapeamento `englishToPortuguese` ao filtrar os meses anteriores:

```typescript
const previousMonths = availableMonths.filter(m => {
  const sep = m.includes("/") ? "/" : "-";
  let [mStr, yStr] = m.toLowerCase().split(sep);
  
  // Converter inglês para português se necessário
  mStr = englishToPortuguese[mStr] || mStr;
  
  const mIndex = monthNames.indexOf(mStr);
  const mYear = parseInt(yStr) + (parseInt(yStr) < 100 ? 2000 : 0);
  
  // Ignorar meses não reconhecidos (índice -1)
  if (mIndex === -1) return false;
  
  return mYear === currentYear && mIndex < currentMonthIndex;
});
```

### Arquivo a Modificar

**`src/lib/kpiUtils.ts`** - Linhas 817-823

### Resultado Esperado

Para Fevereiro (índice 1):
- Janeiro (índice 0) → 0 < 1 = true ✓ (incluído)
- Março (índice 2) → 2 < 1 = false ✗ (excluído)
- Meses não reconhecidos → índice -1 → excluídos

