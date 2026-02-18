
## 3 Ajustes no Dashboard

### 1. Renomear "Primeiras Reunioes" para "CRM Diagnostico"
**Arquivo:** `src/lib/kpiUtils.ts`
- Alterar o label `"Primeiras Reunioes"` para `"CRM Diagnostico"` nas definicoes de KPI (linhas 62, 1018, 1361)

**Arquivo:** `src/lib/yearlyKpiUtils.ts`
- Alterar o label na linha 265

**Arquivo:** `src/pages/Index.tsx`
- Atualizar o fallback label na linha 829 de `"Primeiras Reunioes"` para `"CRM Diagnostico"`

### 2. Remover o flip do Card 3 e mostrar Gauge + Agendadas lado a lado
**Arquivo:** `src/pages/Index.tsx` (linhas 814-854)
- Remover toda a logica de flip (perspective, rotate-y-180, backface-hidden)
- Substituir por um layout horizontal com duas colunas:
  - Coluna esquerda: GaugeChart "CRM Diagnostico" (flex-1)
  - Coluna direita: AgendadasCard com lista de reunioes agendadas por assessor (flex-1)
- Ambos visiveis simultaneamente, sem flip

### 3. Texto descritivo no percentual do card Planejamento
**Arquivo:** `src/components/dashboard/FlipMetaTable.tsx` (linhas 103-110)
- Adicionar o texto "Percentual planejado p/ semana" ao lado do valor percentual no rodape do card
- Alterar de apenas `{weekToMonthPercentage}%` para incluir o label descritivo

### Detalhes tecnicos

**Index.tsx - Card 3 (linhas ~814-854):**
Substituir o bloco do flip por:
```tsx
<ExpandableCard>
  <div className="flex flex-row gap-2 h-full">
    <div className="flex-1 min-w-0">
      <GaugeChart
        label="CRM Diagnostico"
        ...props existentes...
      />
    </div>
    <div className="flex-1 min-w-0">
      <AgendadasCard
        agendadasValue={...}
        assessorData={assessorAgendadas}
      />
    </div>
  </div>
</ExpandableCard>
```

**FlipMetaTable.tsx - Rodape (linhas 103-110):**
Adicionar label descritivo junto ao percentual:
```tsx
<div className="flex items-center gap-2">
  <span className="text-responsive-lg font-semibold text-white">
    {weekToMonthPercentage !== undefined ? `${weekToMonthPercentage}%` : "-"}
  </span>
  <span className="text-responsive-xs text-white/60">Percentual planejado p/ semana</span>
</div>
```

**kpiUtils.ts** e **yearlyKpiUtils.ts:**
Trocar todas ocorrencias de `label: "Primeiras Reunioes"` por `label: "CRM Diagnostico"`.

### Arquivos editados
- `src/lib/kpiUtils.ts` - renomear label
- `src/lib/yearlyKpiUtils.ts` - renomear label
- `src/pages/Index.tsx` - remover flip, layout lado a lado
- `src/components/dashboard/FlipMetaTable.tsx` - texto no percentual
