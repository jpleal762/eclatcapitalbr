

## Plano: Corrigir Overflow de Informações nos Cards da Análise Trimestral

### Problema Identificado

Na página de Análise Trimestral, algumas informações estão vazando para fora dos cards devido a:

1. **Marcador de "Ritmo Ideal"** usa `bottom: "-20px"` fazendo o texto "Falta:" aparecer fora do card
2. **Espaçamentos muito grandes** entre elementos internos do card
3. **Margem inferior da barra de progresso** muito ampla, empurrando o texto de valores para fora

### Diagrama do Problema Atual

```text
┌─────────────────────────────────────────────┐
│  Receita XP                           59%   │ ← OK dentro do card
│  ════════════════════▏══════════════════════│ ← Barra de progresso
│                      │                      │
│                      │ Falta: R$ 150K       │ ← PROBLEMA: texto fora
└─────────────────────────────────────────────┘
                       ↓
         (texto aparece atrás do próximo card)
```

### Solução Proposta

```text
┌─────────────────────────────────────────────┐
│  Receita XP                           59%   │
│  ════════════════════▏══════════════════════│ ← Barra + marcador embutido
│  R$ 36 Mil / R$ 61 Mil    Falta: R$ 25 Mil │ ← Tudo dentro do card
└─────────────────────────────────────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/QuarterlyKPIBar.tsx` | **MODIFICAR** - Reestruturar layout interno |
| `src/components/dashboard/AnalysisPage.tsx` | **MODIFICAR** - Reduzir gaps entre cards |

---

### Detalhes Técnicos

#### 1. Reestruturar QuarterlyKPIBar

**Mudanças principais:**

1. **Remover posicionamento absoluto do marcador de ritmo** - O texto "Falta: R$ X" que aparece abaixo do marcador será movido para a linha de valores na parte inferior do card

2. **Reduzir padding do card** - Usar `p-2 lg:p-3` em vez de `p-responsive-sm lg:p-responsive`

3. **Reduzir margem inferior da barra de progresso** - De `mb-[clamp(14px,1.8vh,22px)]` para `mb-1`

4. **Adicionar overflow-hidden** ao card para garantir que nada vaze

5. **Mover indicador "Falta para Ritmo"** para a linha de valores existente

**Estrutura nova:**

```tsx
<div className="bg-card rounded-lg p-2 lg:p-3 h-full flex flex-col border border-border shadow-sm overflow-hidden">
  {/* Header: Label + Percentage */}
  <div className="flex justify-between items-center mb-1">
    <span className="font-semibold text-foreground text-xs lg:text-sm truncate">{label}</span>
    <span className={`font-bold text-sm lg:text-base ${textColor}`}>
      {percentage}%
    </span>
  </div>

  {/* Progress bar - altura fixa, sem margem excessiva */}
  <div className="relative h-3 lg:h-4 my-1">
    <div className="absolute inset-0 bg-muted rounded-full overflow-hidden">
      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${barWidth}%` }} />
      {/* Divisores de mês */}
      <div className="absolute h-full w-px bg-foreground/20" style={{ left: "33.33%" }} />
      <div className="absolute h-full w-px bg-foreground/20" style={{ left: "66.66%" }} />
    </div>
    
    {/* Marcador de Ritmo Ideal - sem texto abaixo */}
    {ritmoIdeal > 0 && ritmoIdeal <= 100 && (
      <div 
        className="absolute top-0 h-full flex items-center z-10"
        style={{ left: `${ritmoIdeal}%`, transform: "translateX(-50%)" }}
      >
        <div className="w-0.5 h-full bg-blue-500" />
        <div className="absolute -bottom-1 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-blue-500" />
      </div>
    )}
  </div>

  {/* Valores - TUDO em uma linha */}
  <div className="flex justify-between items-center text-[10px] lg:text-xs text-muted-foreground mt-1">
    <span>
      <span className="font-medium text-foreground">{formatValue(value, isCurrency)}</span>
      {" / "}
      {formatValue(target, isCurrency)}
    </span>
    
    {/* Indicador de status */}
    {atingiuRitmo ? (
      <span className="text-green-500 font-medium">✓ OK</span>
    ) : faltaParaRitmo > 0 ? (
      <span className="text-blue-500 font-medium">
        Ritmo: -{formatValue(faltaParaRitmo, isCurrency)}
      </span>
    ) : null}
    
    {/* Falta total */}
    {percentage < 100 && target > 0 && (
      <span className="text-muted-foreground">
        Falta: {formatValue(target - value, isCurrency)}
      </span>
    )}
  </div>
</div>
```

#### 2. Ajustar AnalysisPage

**Reduzir gaps entre cards:**

```tsx
// De:
<div className="flex-1 min-h-0 flex flex-col gap-responsive-sm overflow-hidden">

// Para:
<div className="flex-1 min-h-0 flex flex-col gap-1 lg:gap-1.5 overflow-hidden">
```

---

### Comparação Visual

**Antes:**
```text
┌────────────────────────────────┐
│ Receita XP              59%   │ (padding grande)
│                               │
│ █████████████▏                │ (margem grande abaixo)
│              │                │
│              └─ Falta: 150K   │ ← FORA DO CARD
├────────────────────────────────┤
│ Captação NET            21%   │
```

**Depois:**
```text
┌────────────────────────────────┐
│ Receita XP              59%   │ (compacto)
│ █████████████▏                │ (margem mínima)
│ R$36Mi/R$61Mi  Ritmo:-25K     │ ← DENTRO DO CARD
├────────────────────────────────┤
│ Captação NET            21%   │
```

---

### Benefícios

1. **Todas as informações dentro dos cards** - Nenhum elemento vazando
2. **Layout mais compacto** - Cabe mais KPIs na tela sem scroll
3. **Overflow controlado** - `overflow-hidden` previne vazamentos
4. **Responsivo** - Funciona em desktop e TV

