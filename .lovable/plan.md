

## Plano: Ajustes no Gráfico de Assessores

### Alterações no Arquivo
**`src/components/dashboard/AssessorChart.tsx`**

---

### 1. Remover Triângulos Amarelo e Laranja

**Mudança no componente `StatusIcon`:**

| Status Atual | Ícone Atual | Novo Ícone |
|--------------|-------------|------------|
| TROPHY | Troféu (dourado) | Troféu (dourado) - SEM MUDANÇA |
| GREEN_CHECK | Relógio (verde) | Relógio (verde) - SEM MUDANÇA |
| CLOCK | Relógio (azul) | Relógio (azul) - SEM MUDANÇA |
| YELLOW_ALERT | Triângulo (amarelo) | **Relógio (amarelo)** |
| ORANGE_ALERT | Triângulo (laranja) | **Relógio (laranja)** |
| RED_ALERT | Triângulo (vermelho) | Triângulo (vermelho) - SEM MUDANÇA |

**Código:**
```tsx
function StatusIcon({ icon }: { icon: KPIStatusIcon }) {
  switch (icon) {
    case "TROPHY":
      return <Trophy className="icon-responsive-sm text-eclat-gold flex-shrink-0" />;
    case "GREEN_CHECK":
      return <Clock className="icon-responsive-sm text-green-500 flex-shrink-0" />;
    case "CLOCK":
      return <Clock className="icon-responsive-sm text-blue-500 flex-shrink-0" />;
    case "YELLOW_ALERT":
      return <Clock className="icon-responsive-sm text-eclat-gold flex-shrink-0" />;  // MUDOU
    case "ORANGE_ALERT":
      return <Clock className="icon-responsive-sm text-orange-500 flex-shrink-0" />; // MUDOU
    case "RED_ALERT":
      return <AlertTriangle className="icon-responsive-sm text-red-500 flex-shrink-0" />;
    default:
      return null;
  }
}
```

---

### 2. Engrossar Barras 3x

| Barra | Altura Atual | Nova Altura |
|-------|--------------|-------------|
| ICM Geral (dourada) | `h-[3px]` | `h-[9px]` |
| ICM Semanal (azul) | `h-0.5` (2px) | `h-1.5` (6px) |

**Linha 99 - Barra ICM Geral:**
```tsx
<div className="relative w-full h-[9px] bg-muted rounded-full overflow-visible mt-[1px]">
```

**Linha 128 - Barra ICM Semanal:**
```tsx
<div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-[1px]">
```

---

### Resultado Visual

**Antes:**
- Ícones: Triângulos amarelos/laranjas para performance abaixo do ritmo
- Barras: Finas (3px dourada, 2px azul)

**Depois:**
- Ícones: Relógio amarelo/laranja (mais sutil), triângulo APENAS para vermelho (crítico)
- Barras: 3x mais grossas (9px dourada, 6px azul) - muito mais visíveis

