

## Plano: Redesign do Gráfico da Tela Sprint

### Problema Atual

O gráfico de barras verticais lado a lado (Meta cinza + Realizado colorido) não comunica bem o progresso porque:
- Difícil comparar visualmente duas barras separadas
- A linha pontilhada fica confusa
- Não há clareza sobre "quanto falta"

---

### Opções de Novo Design

| Opção | Visual | Vantagem |
|-------|--------|----------|
| **A) Barra Horizontal Preenchida** | `[████████░░░░] 75%` | Clássica, leitura instantânea |
| **B) Barra Termômetro** | Vertical única preenchendo de baixo pra cima | Visual de "tanque enchendo" |
| **C) Arco/Gauge Compacto** | Semi-círculo com ponteiro | Consistente com outros gráficos |
| **D) Card Focado no Número** | Número grande + mini barra | Foco no valor que falta |

---

### Recomendação: Opção A - Barra Horizontal Preenchida

É a mais intuitiva e ocupa menos espaço vertical, permitindo mostrar mais KPIs na tela.

#### Layout Proposto por Card

```text
┌─────────────────────────────────────────────────────────┐
│ 🏃 Captação NET                                    75%  │
│ ═══════════════════════════░░░░░░░░░░                   │
│ Meta: R$ 500K  |  Real: R$ 375K  |  Falta: R$ 125K     │
│ ─────────────────────────────────────────────────────── │
│ Falta por Assessor:                                     │
│ [Bruno: R$50K] [Ana: R$30K] [Carlos: R$25K] [João: ✓]  │
└─────────────────────────────────────────────────────────┘
```

#### Barra de Progresso - Estrutura

```tsx
{/* Barra horizontal única com gradiente */}
<div className="relative h-3 lg:h-4 w-full rounded-full bg-muted/30 overflow-hidden">
  {/* Preenchimento colorido */}
  <div 
    className={cn("h-full rounded-full transition-all duration-500", getBarColorClass())}
    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
  />
  {/* Marcador de 100% (linha vertical) */}
  <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-foreground/20" />
</div>
```

#### Cores por Faixa

| Progresso | Cor | Visual |
|-----------|-----|--------|
| 100% | Verde | `bg-green-500` |
| 50-99% | Dourado (gradient) | `bg-eclat-gradient` |
| < 50% | Vermelho (gradient) | `bg-red-gradient` |

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/dashboard/SprintKPIBar.tsx` | Substituir barras verticais por barra horizontal |

---

### Detalhes Técnicos

#### SprintKPIBar.tsx - Nova Barra de Progresso

```tsx
{/* Progress Bar - Horizontal style (replacing vertical columns) */}
<div className="relative h-3 lg:h-4 w-full rounded-full bg-muted/30 overflow-hidden mb-1">
  {/* Filled portion */}
  <div 
    className={cn(
      "h-full rounded-full transition-all duration-500",
      getBarColorClass()
    )}
    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
  />
  {/* Optional: marker at target */}
  {progressPercentage < 100 && (
    <div 
      className="absolute top-0 bottom-0 w-0.5 bg-white/50"
      style={{ left: '100%', transform: 'translateX(-100%)' }}
    />
  )}
</div>
```

#### Melhorias Adicionais

1. **Porcentagem maior e mais destacada** - Aumentar fonte do percentual
2. **Barra mais grossa** - De `h-scale-6` para `h-3 lg:h-4` (altura fixa em pixels para consistência)
3. **Remover complexidade** - Eliminar a linha pontilhada e as duas barras separadas

---

### Resultado Visual Esperado

**Antes (atual)**:
- Duas barras verticais lado a lado
- Linha pontilhada confusa
- Difícil leitura rápida

**Depois (proposto)**:
- Barra horizontal única
- Preenchimento intuitivo (esquerda → direita)
- Leitura instantânea do progresso
- Visual limpo e profissional

---

### Alternativa B - Se Preferir Visual Diferente

Se quiser algo mais visual/impactante, posso implementar um **mini gauge/arco** similar aos outros gráficos do dashboard, mantendo consistência visual com o resto do sistema.

