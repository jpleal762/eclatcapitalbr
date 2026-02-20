

## Adicionar 2 piores assessores em cada card da Evolução

### O que muda
Cada mini-card de evolucao passa a mostrar, abaixo do delta total, os nomes e valores dos 2 assessores com pior desempenho (menor delta) naquela categoria. O layout permanece o mesmo, apenas adicionando uma linha extra compacta.

### Implementacao

**1. Arquivo: `src/lib/evolutionUtils.ts`**

- Adicionar campo `worstAssessors` ao tipo `KPIEvolutionItem`:
```typescript
worstAssessors: { name: string; delta: number }[];
```

- Na funcao `calculateKPIEvolution`, quando `assessor === "all"`, extrair todos os assessores unicos dos dados, calcular o delta individual de cada um para a categoria, ordenar do pior para o melhor e pegar os 2 primeiros com delta negativo ou menor delta.

- Criar funcao auxiliar `getWorstAssessorsForCategory(currentData, previousSnapshot, category)` que:
  1. Extrai assessores unicos dos dados
  2. Para cada assessor calcula `sumRealizedForCategory(current, cat, assessor) - sumRealizedForCategory(previous, cat, assessor)`
  3. Ordena por delta crescente (pior primeiro)
  4. Retorna os 2 piores

**2. Arquivo: `src/components/dashboard/EvolutionCard.tsx`**

- No mini-card de cada KPI, abaixo do delta total, adicionar uma linha com os 2 piores assessores:
```tsx
{item.worstAssessors?.length > 0 && (
  <div className="flex gap-1 flex-wrap">
    {item.worstAssessors.map(a => (
      <span key={a.name} className="text-scale-4 text-red-500/70">
        {a.name} {formatValue(a.delta, item.isCurrency)}
      </span>
    ))}
  </div>
)}
```

- Usar `text-scale-4` (menor que o delta principal) para nao competir visualmente
- Cor vermelha com opacidade reduzida (`text-red-500/70`) para diferenciar do valor principal
- Mostrar apenas quando o filtro de assessor for "all" (os piores so fazem sentido na visao geral)

**3. Arquivo: `src/components/dashboard/AnalysisPage.tsx`**

- Passar `rawData` e `selectedAssessor` para que o calculo saiba quando mostrar os piores (apenas quando `selectedAssessor === "all"`)
- O campo `worstAssessors` vira vazio quando um assessor individual estiver selecionado

### Arquivos editados
- `src/lib/evolutionUtils.ts` - novo campo e funcao de calculo por assessor
- `src/components/dashboard/EvolutionCard.tsx` - exibir 2 piores abaixo do delta
- `src/components/dashboard/AnalysisPage.tsx` - nenhuma mudanca necessaria (ja passa assessor para calculateKPIEvolution)

