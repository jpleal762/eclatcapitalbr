
## Correção: Cálculo dos Gaps Acumulados nas Barras Trimestrais

### Problema Identificado

O usuário identificou que os cálculos estão incorretos. Usando o exemplo de **Ativação**:
- Mês 1 (Janeiro): Faltou 6 → Gap M1 = **-6** ✓
- Mês 2 (Fevereiro): Faltou 18 → Gap acumulado deveria ser M1 + M2 = **-24**

A lógica atual calcula corretamente `cumulativeGap = gap M1 + gap M2`, mas pode haver um problema na forma como os gaps individuais estão sendo extraídos dos dados.

### Análise do Código Atual

```typescript
// Linha 488
const gap = Math.max(0, target - actual);
```

Isso está correto conceitualmente. O problema pode ser:

1. **Mapeamento de mês incorreto** - Os nomes dos meses podem não estar casando com os dados do Excel (inglês vs português)
2. **Filtro de assessor** - Se `assessor = "all"`, os dados podem não estar sendo agregados corretamente

### Solução

Adicionar debug logs para verificar os valores calculados e garantir que:
1. O mapeamento de mês (inglês → português) seja aplicado ao buscar os dados
2. Os valores de meta e realizado estejam corretos para cada mês

### Arquivo a Modificar

**`src/lib/quarterlyKpiUtils.ts`** - Função `calculateMonthlyGapsForBar`

#### Mudanças:

1. Aplicar mapeamento inglês → português nas chaves de busca
2. Adicionar console.log temporário para debug dos valores

```typescript
// Mapeamento de meses (já existe no arquivo, linhas 3-21)
const MONTH_MAP: Record<string, string> = {
  "jan": "jan", "feb": "fev", "mar": "mar", "apr": "abr",
  "may": "mai", "jun": "jun", "jul": "jul", "aug": "ago",
  "sep": "set", "oct": "out", "nov": "nov", "dec": "dez",
  // Portuguese already correct
  "fev": "fev", "abr": "abr", "mai": "mai", "ago": "ago",
  "set": "set", "out": "out", "dez": "dez",
};

// Na função getMonthValueFlexible (linha 528-536)
// O problema é que ela compara apenas key1 e key2 exatos,
// mas os dados podem vir como "Jan-26" ou "jan/26" ou "fev-26"
```

#### Correção Principal

A função `getMonthValueFlexible` precisa ser mais robusta para lidar com variações nos dados:

```typescript
function getMonthValueFlexible(records: ProcessedKPI[], monthName: string, yearSuffix: string): number {
  return records.reduce((sum, r) => {
    const monthData = r.monthlyData.find(m => {
      const sep = m.month.includes("/") ? "/" : "-";
      const parts = m.month.toLowerCase().split(sep);
      if (parts.length !== 2) return false;
      
      let [mStr, yStr] = parts;
      // Normalizar mês para português
      mStr = MONTH_MAP[mStr] || mStr;
      
      return mStr === monthName.toLowerCase() && yStr === yearSuffix;
    });
    return sum + (monthData?.value || 0);
  }, 0);
}
```

### Verificação com Console Logs

Adicionar logs temporários para debug:

```typescript
for (let i = 0; i < 3; i++) {
  const monthName = quarterDef.months[i];
  // ... cálculos ...
  
  console.log(`[GAP DEBUG] ${label} - ${monthName}/${yearSuffix}:`, {
    target,
    actual,
    gap: Math.max(0, target - actual)
  });
}
```

### Resultado Esperado

Para Ativação em Q1:
- Traço M1 (33.33%): Gap = -6 (meta M1 não batida)
- Traço M2 (66.66%): Gap = -24 (6 de Jan + 18 de Fev)

Conforme a barra avança:
- Se barra passar de 33.33%, o gap de M1 some (pois já "passamos" daquele ponto)
- Se barra passar de 66.66%, o gap de M2 some
