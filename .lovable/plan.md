
# Plano: Corrigir Deslocamento de Conteudo nos Cards Inferiores

## Diagnostico

Os pares de cards na parte inferior estao com conteudo deslocado para baixo devido ao uso de `justify-center` nos wrappers internos dos componentes. Quando o container flex tem mais espaco vertical do que o conteudo necessita, o `justify-center` empurra o conteudo para o centro, causando o deslocamento para baixo.

## Arquivos a Modificar

### 1. `src/components/dashboard/GaugeChart.tsx` (linha 213)

Mudar alinhamento vertical de `justify-center` para `justify-start`:

```typescript
// Antes
<div className="flex flex-col items-center justify-center flex-1 min-h-0">

// Depois
<div className="flex flex-col items-center justify-start flex-1 min-h-0">
```

### 2. `src/components/dashboard/AssessorChart.tsx` (linha 155)

O layout de assessor unico usa `items-center justify-center` que pode causar deslocamento:

```typescript
// Antes
<div className="flex-1 flex items-center justify-center p-2">

// Depois
<div className="flex-1 flex items-center justify-start p-2">
```

### 3. `src/components/dashboard/FlipGaugeChart.tsx` (linha 58)

O wrapper do gauge na frente usa centralizacao que pode afetar:

```typescript
// Antes
<div className="absolute inset-0 backface-hidden overflow-hidden flex items-center justify-center">

// Depois
<div className="absolute inset-0 backface-hidden overflow-hidden flex items-start justify-center">
```

---

## Resumo das Mudancas

| Arquivo | Linha | Antes | Depois |
|---------|-------|-------|--------|
| GaugeChart.tsx | 213 | `justify-center` | `justify-start` |
| AssessorChart.tsx | 155 | `justify-center` | `justify-start` |
| FlipGaugeChart.tsx | 58 | `items-center` | `items-start` |

Essas alteracoes manterao o conteudo alinhado ao topo de cada card, evitando o deslocamento para baixo.
