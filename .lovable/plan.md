

## Correção da Evolução na Tela Trimestral

### Problema Identificado
A função `getSnapshotFromDaysAgo(7)` compara timestamps com hora exata. Se voce acessa o dashboard antes do horario em que o snapshot foi criado 7 dias atras, a query nao encontra nada e a evolucao fica vazia.

Alem disso, nao existe snapshot do dia 20/fev (hoje), o que sugere que o upload de hoje nao gerou um snapshot corretamente.

### Solucao

**Arquivo:** `src/lib/evolutionUtils.ts`

1. **Corrigir a busca de snapshots por data** - Mudar `getSnapshotFromDaysAgo` para usar o **final do dia** (23:59:59) ao inves da hora atual, garantindo que encontre qualquer snapshot criado naquele dia:

```typescript
export async function getSnapshotFromDaysAgo(days: number): Promise<SnapshotRecord | null> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - days);
  // Usar final do dia para incluir qualquer snapshot do dia alvo
  targetDate.setHours(23, 59, 59, 999);

  const { data, error } = await (supabase as any)
    .from('kpi_snapshots')
    .select('*')
    .lte('created_at', targetDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as SnapshotRecord;
}
```

2. **Adicionar fallback** - Se nao encontrar snapshot de 7 dias, tentar buscar o snapshot mais antigo disponivel (qualquer um), para sempre mostrar alguma evolucao:

```typescript
// Se nao encontrou com 7 dias, buscar o snapshot mais antigo
if (!data) {
  const { data: oldest } = await (supabase as any)
    .from('kpi_snapshots')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  
  if (oldest) return oldest as unknown as SnapshotRecord;
}
```

3. **Atualizar o EvolutionCard** para mostrar ha quantos dias o snapshot e, caso use fallback (ao inves de fixo "7 dias").

**Arquivo:** `src/components/dashboard/AnalysisPage.tsx`

- Calcular dinamicamente quantos dias atras o snapshot foi criado
- Passar esse valor para o `EvolutionCard` ao inves de `daysAgo={7}` fixo

### Resumo dos arquivos editados
- `src/lib/evolutionUtils.ts` - corrigir busca por data e adicionar fallback
- `src/components/dashboard/AnalysisPage.tsx` - calculo dinamico de dias

