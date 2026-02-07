
# Plano: Card Azul "Planejamento" + Reordenacao de Cards + HEAD BRUNO em Diversificacao

## Resumo

Tres alteracoes principais:
1. Renomear o card azul para "Planejamento" e adicionar coluna "Meta Mes" com indicacao visual do tipo de meta
2. Adicionar HEAD BRUNO em Diversificacao
3. Reorganizar cards de gauge: remover "Receita XP", subir "Receita PJ1 XP" para posicao principal, mover "Receita Parceiros" e "Receita PJ2 XP"

---

## 1. Card Azul - "Planejamento" com Meta Mes

### Alteracoes em `src/lib/kpiUtils.ts`

- Adicionar campo `monthlyTarget` ao calculo de `metaSemanal`, buscando o valor de "Planejado Mes" para cada categoria
- Adicionar campo `metaType` indicando se a linha e "Semana" ou "Mes"

### Alteracoes em `src/types/kpi.ts`

- Adicionar `monthlyTarget?: number` ao tipo `MetaSemanal`

### Alteracoes em `src/components/dashboard/FlipMetaTable.tsx`

**Frente:**
- Titulo: "Planejamento" (em vez de "Planejamento Semanal Acumulado")
- Subtitulo mantido: "*definido na reuniao semanal em equipe"
- Nova coluna "Meta Mes" na tabela entre "KPI" e "Meta" (que passa a se chamar "Meta Sem.")
- Cada linha mostra Meta Mensal (Planejado Mes) e Meta Semanal lado a lado
- Indicadores visuais: badges pequenos "S" (semana) e "M" (mes) nas colunas para clareza

**Verso:**
- Titulo: "Falta para Meta Semanal" (mantido)
- Mesma estrutura atualizada com a coluna extra

---

## 2. HEAD BRUNO em Diversificacao

### Alteracoes em `src/pages/Index.tsx`

- No gauge de Diversificacao (index 3), adicionar prop `headName="BRUNO"` (similar ao que ja existe em PJ1 XP)

### Alteracoes em `src/components/dashboard/AnalysisPage.tsx`

- Adicionar `"Diversificacao": "BRUNO"` no mapeamento `KPI_HEADS`

---

## 3. Reorganizacao dos Cards de Gauge

### Contexto atual (KPI_CATEGORIES, indices 0-8):
```text
[0] Captacao NET
[1] Receita XP         <-- REMOVER do dashboard
[2] Primeiras Reunioes
[3] Diversificacao
[4] Receita Parceiros
[5] Receita PJ1 XP
[6] Receita PJ2 XP
[7] Habilitacao
[8] Ativacao
```

### Nova disposicao nos cards do dashboard (Index.tsx):

**Coluna 2 (Graph 2 - posicao principal, 65%):**
- Antes: Receita XP (gaugeKPIs[1]) com assessor list
- Depois: **Receita PJ1 XP (gaugeKPIs[5])** com assessor list e headName="BRUNO"

**Coluna 2 (Graph 6 - sub-gauge esquerdo, 35%):**
- Antes: Receita PJ1 XP (gaugeKPIs[5]) com headName="BRUNO"
- Depois: **Receita PJ2 XP (gaugeKPIs[6])** com Receita Empilhada flip

**Coluna 2 (Graph 7 - sub-gauge direito, 35%):**
- Antes: Receita PJ2 XP (gaugeKPIs[6]) com flip empilhada
- Depois: **Receita Parceiros (gaugeKPIs[4])** com flip "Falta por Assessor"

### Alteracoes em `src/pages/Index.tsx`

- Graph 2: trocar referencia de `gaugeKPIs[1]` para `gaugeKPIs[5]`, adicionar `headName="BRUNO"`, manter `showAssessorList`
- Graph 6: trocar de `gaugeKPIs[5]` para `gaugeKPIs[6]`, usar FlipGaugeChart com additionalValue/empilhada
- Graph 7: trocar de `gaugeKPIs[6]` para `gaugeKPIs[4]`, usar FlipGaugeChart com assessorRemainingParceiros
- Atualizar `GAUGE_CATEGORY_MAP` para refletir os novos mapeamentos
- Atualizar `assessorRemainingReceita` para calcular remaining baseado em PJ1 XP (nova posicao principal)

---

## 4. Resumo de Arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `src/types/kpi.ts` | Adicionar `monthlyTarget` ao MetaSemanal |
| `src/lib/kpiUtils.ts` | Calcular monthlyTarget no metaSemanal |
| `src/components/dashboard/FlipMetaTable.tsx` | Renomear titulo, adicionar coluna Meta Mes |
| `src/pages/Index.tsx` | Reorganizar gauges, HEAD BRUNO em Diversificacao |
| `src/components/dashboard/AnalysisPage.tsx` | Adicionar Diversificacao ao KPI_HEADS |
