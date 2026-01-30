

## Plano: Aumentar Gráficos de Arco 3x e Adicionar Contorno nos Números

### Alterações Propostas

#### 1. Aumentar Dimensões dos Gráficos de Arco para 3x

**Arquivo**: `src/components/dashboard/GaugeChart.tsx`

Dimensões atuais vs novas:

| Tamanho | Atual (width x height) | Novo 3x (width x height) |
|---------|------------------------|--------------------------|
| sm | 56 x 32 | 168 x 96 |
| md | 72 x 40 | 216 x 120 |
| lg | 80 x 45 | 240 x 135 |
| sm (compact) | 45 x 26 | 135 x 78 |
| md (compact) | 58 x 32 | 174 x 96 |
| lg (compact) | 64 x 36 | 192 x 108 |

Stroke width também 3x:
- sm: 5 → 15
- md: 6 → 18
- lg: 7 → 21

#### 2. Adicionar Contorno nos Números de Porcentagem

**Técnica**: CSS `text-shadow` com múltiplas sombras para criar efeito de contorno/outline

```css
/* Nova classe para contorno de texto */
.text-outline {
  text-shadow: 
    -1px -1px 0 hsl(var(--background)),
    1px -1px 0 hsl(var(--background)),
    -1px 1px 0 hsl(var(--background)),
    1px 1px 0 hsl(var(--background));
}
```

Aplicar em:
- `GaugeChart.tsx` - linha 240 (porcentagem acima do gauge)
- `YearlyGaugeChart.tsx` - linha 75 (porcentagem acima do gauge anual)

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/index.css` | Adicionar classe `.text-outline` |
| `src/components/dashboard/GaugeChart.tsx` | 3x nas dimensões + classe text-outline |
| `src/components/dashboard/YearlyGaugeChart.tsx` | 3x nas dimensões + classe text-outline |

---

### Detalhes Técnicos

#### index.css - Nova classe de contorno

```css
.text-outline {
  text-shadow: 
    -1px -1px 0 hsl(var(--background)),
    1px -1px 0 hsl(var(--background)),
    -1px 1px 0 hsl(var(--background)),
    1px 1px 0 hsl(var(--background)),
    0 -1px 0 hsl(var(--background)),
    0 1px 0 hsl(var(--background)),
    -1px 0 0 hsl(var(--background)),
    1px 0 0 hsl(var(--background));
}
```

#### GaugeChart.tsx - Novas dimensões

```typescript
const dimensions = {
  sm: { width: compact ? 135 : 168, height: compact ? 78 : 96, stroke: compact ? 12 : 15 },
  md: { width: compact ? 174 : 216, height: compact ? 96 : 120, stroke: compact ? 15 : 18 },
  lg: { width: compact ? 192 : 240, height: compact ? 108 : 135, stroke: compact ? 18 : 21 },
};
```

#### Porcentagem com contorno

```tsx
<span className={`text-responsive-sm font-bold whitespace-nowrap text-outline ${isHighlight ? "text-card" : "text-foreground"}`}>
  {percentage}%
</span>
```

---

### Resultado Esperado

- **Gráficos de arco 3x maiores**: Melhor visibilidade em TVs e telas grandes
- **Números com contorno**: Porcentagens claramente legíveis sobre qualquer fundo
- **Proporcional**: Stroke width também 3x para manter proporções corretas

