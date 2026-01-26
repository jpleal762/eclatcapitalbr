

## Plano: Mudar Cor do HEAD BRUNO para Amarelo e Adicionar Exclamação em Alertas Vermelhos

### Alterações Solicitadas

1. **HEAD BRUNO** - Mudar a cor azul para amarelo/dourado (mesma cor dos nomes de assessores)
2. **Exclamação em alertas vermelhos** - Adicionar `!` quando o status de "abaixo do ritmo" for vermelho

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/GaugeChart.tsx` | **MODIFICAR** - Badge HEAD BRUNO + exclamação em alerta vermelho |
| `src/components/dashboard/QuarterlyKPIBar.tsx` | **MODIFICAR** - Badge HEAD BRUNO + exclamação em alerta vermelho |

---

### Detalhes Técnicos

#### 1. GaugeChart.tsx - Badge HEAD BRUNO (linha 231)

**Antes:**
```tsx
<span className="inline-flex items-center text-responsive-4xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">
  HEAD {headName}
</span>
```

**Depois:**
```tsx
<span className="inline-flex items-center text-responsive-4xs font-bold text-eclat-gold uppercase tracking-wide bg-yellow-500/10 px-1.5 py-0.5 rounded-md border border-yellow-500/20">
  HEAD {headName}
</span>
```

#### 2. GaugeChart.tsx - Adicionar Exclamação em Alertas Vermelhos (linha 96-98)

**Antes:**
```tsx
<span className={`text-responsive-4xs font-bold ${alertType === "RED" ? "text-red-500" : "text-orange-500"}`}>
  {formatNumber(difference, isCurrency)}
</span>
```

**Depois:**
```tsx
<span className={`text-responsive-4xs font-bold ${alertType === "RED" ? "text-red-500" : "text-orange-500"}`}>
  {alertType === "RED" && "! "}{formatNumber(difference, isCurrency)}
</span>
```

#### 3. GaugeChart.tsx - Texto "Head Bruno" na variante highlight (linha 366)

**Antes:**
```tsx
<p className="text-responsive-3xs text-card/70 mt-1 italic flex-shrink-0">Head Bruno</p>
```

**Depois:**
```tsx
<p className="text-responsive-3xs text-eclat-gold mt-1 italic flex-shrink-0">Head Bruno</p>
```

#### 4. QuarterlyKPIBar.tsx - Badge HEAD BRUNO (linha 56)

**Antes:**
```tsx
<span className="inline-flex items-center text-[8px] lg:text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide bg-blue-500/10 px-0.5 py-0.5 rounded border border-blue-500/20">
  HEAD {headName}
</span>
```

**Depois:**
```tsx
<span className="inline-flex items-center text-[8px] lg:text-[9px] font-bold text-eclat-gold uppercase tracking-wide bg-yellow-500/10 px-0.5 py-0.5 rounded border border-yellow-500/20">
  HEAD {headName}
</span>
```

#### 5. QuarterlyKPIBar.tsx - Adicionar Exclamação em Alertas Vermelhos (linha 110-113)

Para adicionar exclamação quando o status é vermelho, precisamos verificar se `textColor` contém "red":

**Antes:**
```tsx
{atingiuRitmo ? (
  <span className="text-green-500 font-medium">✓ OK</span>
) : faltaParaRitmo > 0 ? (
  <span className="text-blue-500 font-medium whitespace-nowrap">
    Ritmo: -{formatValue(faltaParaRitmo, isCurrency)}
  </span>
) : null}
```

**Depois:**
```tsx
{atingiuRitmo ? (
  <span className="text-green-500 font-medium">✓ OK</span>
) : faltaParaRitmo > 0 ? (
  <span className={`font-medium whitespace-nowrap ${textColor.includes("red") ? "text-red-500" : "text-blue-500"}`}>
    {textColor.includes("red") && "! "}Ritmo: -{formatValue(faltaParaRitmo, isCurrency)}
  </span>
) : null}
```

---

### Resumo Visual

| Elemento | Antes | Depois |
|----------|-------|--------|
| Badge HEAD BRUNO | `text-blue-600`, `bg-blue-500/10` | `text-eclat-gold`, `bg-yellow-500/10` |
| Alerta Abaixo Ritmo (vermelho) | `-R$ 150K` | `! -R$ 150K` |
| Alerta Abaixo Ritmo (laranja) | `-R$ 50K` | `-R$ 50K` (sem exclamação) |

---

### Benefícios

1. **Consistência visual** - HEAD BRUNO agora usa a mesma paleta dourada da marca
2. **Destaque para urgência** - A exclamação `!` sinaliza claramente os alertas críticos (vermelhos)
3. **Hierarquia de atenção** - Laranja = atenção moderada, Vermelho + `!` = atenção crítica

