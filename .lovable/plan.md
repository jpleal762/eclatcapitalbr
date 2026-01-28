

## Plano: Centralizar Gráficos Gauge nos Cards

### Objetivo

Garantir que todos os gráficos gauge fiquem centralizados **horizontal e verticalmente** dentro de seus respectivos cards, independentemente do tamanho da tela ou do conteúdo.

---

### Arquivos a Modificar

| Arquivo | Componente | Problema Atual |
|---------|------------|----------------|
| `src/components/dashboard/GaugeChart.tsx` | Gauge principal | Gauge não está perfeitamente centralizado verticalmente |
| `src/components/dashboard/FlipGaugeChart.tsx` | Wrapper flip do gauge | Container não força centralização |
| `src/components/dashboard/YearlyGaugeChart.tsx` | Gauge anual | Falta `justify-center` no container principal |
| `src/components/dashboard/ICMCard.tsx` | Card ICM com gauge | Gauge precisa de melhor centralização vertical |
| `src/components/dashboard/YearlyICMCard.tsx` | Card ICM anual | Container do gauge sem centralização vertical |

---

### Mudanças Específicas

#### 1. GaugeChart.tsx (Gauge Principal)

**Problema:** O container interno do gauge não usa `justify-center` consistentemente.

**Solução:**
- Alterar linha ~218: O container `flex flex-col items-center` deve incluir `justify-center`
- Alterar linha ~248: O wrapper do gauge interno deve ter `items-center justify-center` consistentes

```tsx
// Antes (linha 218)
<div className={`flex flex-col items-center ${showAssessorList ? 'flex-1' : ''} min-h-0 flex-1 overflow-hidden`}>

// Depois
<div className={`flex flex-col items-center justify-center ${showAssessorList ? 'flex-1' : ''} min-h-0 flex-1 overflow-hidden`}>
```

#### 2. FlipGaugeChart.tsx (Wrapper Flip)

**Problema:** O container não passa classes de centralização para o GaugeChart interno.

**Solução:**
- O GaugeChart já é renderizado com `h-full`, mas o container pai precisa forçar centralização
- Linha ~82-83: Adicionar classes de centralização no wrapper do front

```tsx
// Antes (linha 82-83)
<div className="absolute inset-0 backface-hidden overflow-hidden">
  <div className="relative h-full">

// Depois
<div className="absolute inset-0 backface-hidden overflow-hidden flex items-center justify-center">
  <div className="relative h-full w-full">
```

#### 3. YearlyGaugeChart.tsx (Gauge Anual)

**Problema:** O Card e seu container interno não têm `h-full` e `justify-center`.

**Solução:**
- Linha ~61: Adicionar `h-full flex flex-col` ao Card
- Linha ~62: Adicionar `flex-1 justify-center` ao container principal

```tsx
// Antes (linha 60-62)
<Card className="p-responsive shadow-card bg-card border-l-4 border-l-chart-graphite">
  <div className="flex flex-col items-center">

// Depois  
<Card className="p-responsive shadow-card bg-card border-l-4 border-l-chart-graphite h-full flex flex-col">
  <div className="flex flex-col items-center justify-center flex-1">
```

#### 4. ICMCard.tsx (Card ICM Mensal)

**Problema:** O gauge está dentro de um container `justify-around` que pode desbalancear.

**Solução:**
- Linha ~119: Mudar `justify-around` para `justify-center` com gap controlado
- Linha ~121-122: Adicionar `items-center justify-center` explícito ao wrapper do gauge

```tsx
// Antes (linha 119)
<div className="flex items-center justify-around gap-2 flex-1 min-h-0">
  {/* Gauge */}
  <div className="flex flex-col items-center">

// Depois
<div className="flex items-center justify-center gap-4 flex-1 min-h-0">
  {/* Gauge */}
  <div className="flex flex-col items-center justify-center">
```

#### 5. YearlyICMCard.tsx (Card ICM Anual)

**Problema:** Similar ao ICMCard, o gauge não está perfeitamente centralizado.

**Solução:**
- Linha ~83: Container `flex items-start` deve ser `flex items-center justify-center`
- Linha ~86: Container do gauge deve ter `items-center justify-center`

```tsx
// Antes (linha 83)
<div className="flex items-start justify-between gap-responsive-lg">
  {/* Gauge with graphite color */}
  <div className="flex flex-col items-center">

// Depois
<div className="flex items-center justify-center gap-responsive-lg">
  {/* Gauge with graphite color */}
  <div className="flex flex-col items-center justify-center">
```

---

### Classes CSS de Centralização

A centralização consistente usa estas classes Tailwind:

| Eixo | Classe | Função |
|------|--------|--------|
| Horizontal | `items-center` | Centraliza no eixo cruzado (horizontal em flex-col) |
| Vertical | `justify-center` | Centraliza no eixo principal (vertical em flex-col) |
| Ambos | `items-center justify-center` | Centralização completa |
| Flex container | `flex-1 min-h-0` | Permite o elemento crescer e encolher |

---

### Estrutura Visual Esperada

```text
┌──────────────────────────────────────┐
│           Card Container             │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │           ╭─────────╮          │  │
│  │          │  GAUGE   │          │  │
│  │           ╰─────────╯          │  │
│  │                                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
         ↑ Centralizado V+H ↑
```

---

### Resumo das Alterações

1. **GaugeChart.tsx**: Adicionar `justify-center` ao container principal do gauge (linha ~218)
2. **FlipGaugeChart.tsx**: Adicionar `flex items-center justify-center` ao container do front (linha ~82)
3. **YearlyGaugeChart.tsx**: Adicionar `h-full flex flex-col` ao Card e `justify-center flex-1` ao container interno
4. **ICMCard.tsx**: Mudar `justify-around` para `justify-center` e adicionar centralização ao wrapper do gauge
5. **YearlyICMCard.tsx**: Mudar `items-start` para `items-center` e adicionar `justify-center`

---

### Resultado Esperado

Após as alterações:
- Todos os gauges ficarão perfeitamente centralizados horizontal e verticalmente
- O layout se adaptará proporcionalmente em diferentes tamanhos de tela
- Os cards manterão a estrutura "fit-to-screen" já implementada
- O espaço disponível será distribuído uniformemente ao redor dos gauges

