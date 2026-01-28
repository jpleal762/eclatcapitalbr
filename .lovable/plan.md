

## Plano: Tooltips + Animações Divertidas na Sprint

### Objetivo

1. **Tooltip**: Mostrar o percentual de progresso ao passar o mouse sobre cada assessor
2. **Animações criativas**: Tornar a Sprint mais divertida e gamificada

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/dashboard/SprintKPIBar.tsx` | Adicionar tooltips e animações nos quadrados |
| `tailwind.config.ts` | Novas keyframes de animação |
| `src/index.css` | Classes CSS para animações extras |

---

### 1. Novas Animações (tailwind.config.ts)

```typescript
keyframes: {
  // Pulso suave para assessores em progresso
  "sprint-pulse": {
    "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(251, 191, 36, 0)" },
    "50%": { transform: "scale(1.02)", boxShadow: "0 0 8px 2px rgba(251, 191, 36, 0.3)" },
  },
  // Shake para quem está atrasado (<50%)
  "sprint-shake": {
    "0%, 100%": { transform: "translateX(0)" },
    "25%": { transform: "translateX(-2px)" },
    "75%": { transform: "translateX(2px)" },
  },
  // Bounce suave para quem está quase lá (>=80%)
  "sprint-bounce": {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-3px)" },
  },
  // Brilho para quem atingiu a meta
  "sprint-glow": {
    "0%, 100%": { boxShadow: "0 0 5px 0 rgba(34, 197, 94, 0.5)" },
    "50%": { boxShadow: "0 0 15px 3px rgba(34, 197, 94, 0.8)" },
  },
}
```

---

### 2. Tooltip com Radix UI (SprintKPIBar.tsx)

Usar o componente `Tooltip` já existente no projeto:

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Dentro do map de assessorBreakdown:
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <div className={cn("...", colorClass, animationClass)}>
        <span>{assessor.name}</span>
        <span>{formatValue(...)}</span>
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <div className="text-center">
        <p className="font-bold">{assessor.name}</p>
        <p>Progresso: {Math.round(progressPercent)}%</p>
        <p>Meta: {formatValue(individualTarget, isCurrency)}</p>
        <p>Realizado: {formatValue(assessor.contribution || 0, isCurrency)}</p>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### 3. Lógica de Animação por Status

```typescript
const getAnimationClass = () => {
  if (assessor.achieved) {
    return "animate-sprint-glow hover:scale-110";
  }
  if (progressPercent >= 80) {
    return "animate-sprint-bounce hover:scale-105";
  }
  if (progressPercent >= 50) {
    return "animate-sprint-pulse hover:scale-105";
  }
  // < 50% - Urgente!
  return "animate-sprint-shake hover:scale-105";
};
```

---

### 4. Detalhes do Tooltip

O tooltip mostrará:
- **Nome completo** do assessor
- **Progresso**: percentual calculado
- **Meta individual**: contribution + remaining
- **Realizado**: contribution atual
- **Emoji de status**: baseado no desempenho

---

### Resultado Visual Esperado

| Progresso | Cor | Animação | Emoji no Tooltip |
|-----------|-----|----------|------------------|
| 100% (atingiu) | Verde | Glow pulsante | :check_mark: |
| >= 80% | Verde claro | Bounce suave | :rocket: |
| >= 50% | Amarelo | Pulso suave | :hourglass: |
| < 50% | Vermelho | Shake urgente | :flame: |

---

### Detalhes Técnicos

#### SprintKPIBar.tsx - Alterações principais:

1. Importar componentes de Tooltip
2. Envolver cada card de assessor com Tooltip
3. Adicionar classes de animação condicionais
4. Adicionar transição suave no hover (`transition-all duration-200`)

#### tailwind.config.ts - Novas animações:

- `sprint-pulse`: Para assessores em progresso moderado
- `sprint-shake`: Urgência para atrasados
- `sprint-bounce`: Entusiasmo para quem está quase lá
- `sprint-glow`: Celebração para quem atingiu

#### index.css - Classes auxiliares:

- Estilos de hover adicionais
- Transições suaves globais

