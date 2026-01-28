

## Plano: Melhorar Contraste do Vermelho na Tela Sprint

### Problema Identificado

Na tela Sprint, os elementos que indicam "falta" (valores pendentes) estão com pouco destaque visual:

1. **Fundo vermelho muito transparente**: `bg-destructive/10` (10% opacidade) sobre fundo escuro do card
2. **Cor destructive no dark mode é muito escura**: `hsl(0 62% 30%)` - luminosidade de apenas 30%
3. **Resultado**: O vermelho quase se mistura com o fundo, perdendo impacto visual

### Solução Proposta

Aumentar a visibilidade mantendo o tema vermelho/verde:

1. **Aumentar opacidade do fundo vermelho**: De `bg-destructive/10` para `bg-red-500/20` ou `bg-red-600/25`
2. **Usar vermelho mais vibrante para texto**: De `text-destructive` para `text-red-400` (mais claro no dark mode)
3. **Adicionar borda sutil**: `border border-red-500/30` para reforçar o destaque
4. **Manter o verde igual**: Os elementos verdes já têm bom contraste com `bg-green-500/10` e `text-green-500`

### Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/dashboard/SprintKPIBar.tsx` | Ajustar cores de fundo, texto e borda nos elementos vermelhos |

### Alterações Específicas

#### 1. Grid de valores (linha 104-106)
```tsx
// ANTES
<div className={cn(isCompleted ? "text-green-500" : "text-destructive font-bold")}>

// DEPOIS
<div className={cn(
  isCompleted 
    ? "text-green-500" 
    : "text-red-400 font-bold bg-red-500/15 px-1 rounded"
)}>
```

#### 2. Breakdown por assessor - vermelho (linhas 148-153)
```tsx
// ANTES
assessor.achieved 
  ? "bg-green-500/10 text-green-500" 
  : "bg-destructive/10 text-destructive"

// DEPOIS
assessor.achieved 
  ? "bg-green-500/15 text-green-400 border border-green-500/20" 
  : "bg-red-500/20 text-red-400 border border-red-500/30"
```

#### 3. Ícones de urgência - Flame (linha 39)
```tsx
// ANTES
<Flame className="... text-destructive animate-pulse" />

// DEPOIS
<Flame className="... text-red-400 animate-pulse" />
```

#### 4. Porcentagem vermelha (linha 88)
```tsx
// ANTES
progressPercentage >= 50 ? "text-eclat-gold" : "text-destructive"

// DEPOIS
progressPercentage >= 50 ? "text-eclat-gold" : "text-red-400"
```

#### 5. Indicador de evolução negativa (linhas 123-127)
```tsx
// ANTES
evolution.difference > 0 ? "text-green-500" : "text-destructive"

// DEPOIS
evolution.difference > 0 ? "text-green-500" : "text-red-400"
```

### Comparação Visual

| Elemento | Antes | Depois |
|----------|-------|--------|
| Fundo vermelho | `bg-destructive/10` (quase invisível) | `bg-red-500/20` (mais visível) |
| Texto vermelho | `text-destructive` (escuro) | `text-red-400` (vibrante) |
| Borda | nenhuma | `border-red-500/30` (sutil) |
| Verde | `bg-green-500/10`, `text-green-500` | `bg-green-500/15`, `text-green-400` (ligeiramente mais vibrante) |

### Resultado Esperado

- Vermelho mais vibrante e destacado contra o fundo escuro
- Contraste claro entre assessores que atingiram (verde) vs faltam (vermelho)
- Borda sutil adiciona definição visual sem poluir
- Tema vermelho/verde mantido, apenas com mais intensidade

