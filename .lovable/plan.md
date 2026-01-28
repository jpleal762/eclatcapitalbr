

## Plano: Restaurar Layout "Fit-to-Screen" Proporcional

### Diagnóstico

O dashboard implementa um layout "fit-to-screen" onde todos os elementos devem caber proporcionalmente na tela sem scroll (em desktop/TV - 1024px+). A estrutura atual já utiliza:

- **Linha superior (Cards)**: `flex-[45]` = 45% da altura
- **Linha inferior (Gráficos)**: `flex-[55]` = 55% da altura  
- **Gráficos principais**: `flex-[65]` = 65% da coluna
- **Gráficos secundários**: `flex-[35]` = 35% da coluna

### Possíveis Causas de Desalinhamento

1. **Conteúdo interno crescendo além do container** - elementos sem `max-h-full` ou `overflow-hidden`
2. **Margens/paddings acumulados** - gaps e paddings somando altura extra
3. **Elementos flex não respeitando proporções** - falta de `min-h-0`
4. **Cards com altura mínima implícita** - conteúdo interno forçando crescimento

---

### Arquivos a Revisar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Index.tsx` | **REVISAR** - Verificar estrutura flex e proporções |
| `src/components/dashboard/GaugeChart.tsx` | **AJUSTAR** - Garantir overflow-hidden e max-height |
| `src/components/dashboard/FlipICMCard.tsx` | **AJUSTAR** - Container interno com overflow |
| `src/components/dashboard/FlipMetaTable.tsx` | **AJUSTAR** - Tabela com scroll interno |
| `src/components/dashboard/AssessorChart.tsx` | **AJUSTAR** - Lista com altura limitada |
| `src/components/dashboard/AgendadasCard.tsx` | **AJUSTAR** - Container proporcional |
| `src/index.css` | **VERIFICAR** - Classes responsivas |

---

### Mudanças Específicas

#### 1. Index.tsx - Estrutura Principal

Garantir que o container principal e suas linhas usem corretamente:
- `h-full` em todos os níveis
- `min-h-0` para permitir encolhimento flex
- `overflow-hidden` para prevenir crescimento

```tsx
// Estrutura esperada (verificar/corrigir)
<main className="flex-1 overflow-hidden px-4 py-3">
  <div className="h-full flex flex-col gap-3">
    {/* Top Row - Cards */}
    <div className="grid gap-3 flex-[45] min-h-0 overflow-hidden ...">
    
    {/* Bottom Row - Gauges */}
    <div className="grid gap-3 flex-[55] min-h-0 overflow-hidden ...">
```

#### 2. GaugeChart.tsx - Controle de Altura

Adicionar constraints para prevenir crescimento vertical:
- SVG wrapper com `flex-shrink-0`
- Container de assessores com `max-h-full overflow-y-auto`
- Labels com `truncate` para texto longo

#### 3. FlipICMCard.tsx / FlipMetaTable.tsx

Cards flip devem ter:
- Container interno com `h-full overflow-hidden`
- Conteúdo do back com `overflow-auto` (já existe, verificar)
- `max-h-full` no wrapper de conteúdo

#### 4. AssessorChart.tsx

Lista de assessores deve:
- Usar `justify-between` no container flex para distribuir verticalmente
- Não ter `overflow-y-auto` em desktop (já implementado)
- Manter altura proporcional ao container pai

#### 5. AgendadasCard.tsx

Card de reuniões agendadas deve:
- Manter layout horizontal com proporções fixas
- Lista de assessores com `overflow-y-auto` apenas se necessário
- Gauge compacto com `compact={true}` (já existe)

---

### Verificações de CSS

Confirmar que as classes responsivas em `src/index.css` estão corretas:

```css
/* Gaps não devem somar muito */
.gap-responsive-sm { gap: clamp(4px, 0.5vh, 10px); }
.gap-responsive { gap: clamp(6px, 0.8vh, 14px); }

/* Paddings compactos */
.p-responsive { padding: clamp(8px, 1vh, 16px); }
.p-responsive-sm { padding: clamp(4px, 0.5vh, 10px); }
```

---

### Regras do Layout Fit-to-Screen

1. **Container raiz**: `h-screen overflow-hidden`
2. **Todas as seções**: `flex-1 min-h-0 overflow-hidden`
3. **Grids**: Usar `flex-[N]` com `min-h-0`
4. **Cards**: `h-full flex flex-col overflow-hidden`
5. **Conteúdo interno**: `flex-1 min-h-0 overflow-hidden` ou `overflow-auto`
6. **Texto**: `truncate whitespace-nowrap` em labels
7. **Mobile**: Reverter para scroll vertical com `overflow-y-auto`

---

### Resultado Esperado

Após as correções:
- Todos os 3 cards superiores ocupam 45% da altura
- Todos os 9 gráficos inferiores ocupam 55% da altura
- Gráficos principais ocupam 65% de sua coluna
- Gráficos secundários ocupam 35% de sua coluna
- Nenhum scroll aparece em desktop/TV (≥1024px)
- Scroll vertical permitido em mobile (<1024px)

---

### Fluxo Visual

```text
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Card 1    │  │   Card 2    │  │   Card 3    │   45%       │
│  │  FlipICM    │  │  FlipMeta   │  │ Agendadas   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Graph 1    │  │  Graph 2    │  │  Graph 3    │   65%       │
│  │ AssessorC.  │  │  Receita    │  │  Captação   │              │
│  ├─────┬───────┤  ├─────┬───────┤  ├─────┬───────┤   55%       │
│  │ G4  │  G5   │  │ G6  │  G7   │  │ G8  │  G9   │   35%       │
│  └─────┴───────┘  └─────┴───────┘  └─────┴───────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

