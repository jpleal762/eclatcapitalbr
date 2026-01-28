
## Plano: Atualizar IA Automaticamente (Limitado a 1x por Dia)

### Objetivo

Fazer a análise de IA atualizar automaticamente ao abrir o app, mas limitado a uma vez por dia para economizar créditos.

---

### Lógica de Implementação

1. **Armazenar timestamp** da última chamada à API no localStorage
2. **Verificar na abertura** se passaram mais de 24 horas desde a última atualização
3. **Se sim**: forçar nova análise (`force=true`)
4. **Se não**: usar dados em cache normalmente

---

### Arquivo a Modificar

**`src/components/dashboard/YearlyAnalysisCard.tsx`**

### Alterações

#### 1. Adicionar chave para timestamp (nova constante)

```typescript
const LAST_FETCH_KEY = "yearly-analysis-last-fetch";
```

#### 2. Função para verificar se pode atualizar

```typescript
function canRefreshToday(): boolean {
  const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
  if (!lastFetch) return true;
  
  const lastDate = new Date(lastFetch);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff >= 24;
}
```

#### 3. Atualizar `fetchAnalysis` para salvar timestamp

Após sucesso na chamada à API, salvar o timestamp:
```typescript
localStorage.setItem(LAST_FETCH_KEY, new Date().toISOString());
```

#### 4. Modificar `useEffect` para verificar atualização diária

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (yearlyData.gaugeKPIs.length > 0) {
      const shouldForceRefresh = canRefreshToday();
      fetchAnalysis(shouldForceRefresh);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [fetchAnalysis, yearlyData.gaugeKPIs.length]);
```

---

### Fluxo Resultante

```text
Usuário abre app
       ↓
Verifica localStorage: "yearly-analysis-last-fetch"
       ↓
┌──────────────────────────────────┐
│ Passaram 24h ou nunca buscou?    │
├────────┬─────────────────────────┤
│  SIM   │          NÃO            │
│   ↓    │           ↓             │
│ force  │    Usa cache            │
│ =true  │    (fetchAnalysis())    │
└────────┴─────────────────────────┘
```

---

### Detalhes Técnicos

- **Storage key**: `yearly-analysis-last-fetch`
- **Formato**: ISO timestamp (`2026-01-28T14:30:00.000Z`)
- **Intervalo**: 24 horas
- **Botão manual**: Continua funcionando independentemente do limite diário

