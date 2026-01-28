

## Plano: Melhorar Visualização do Progresso 48h + Animações Elegantes

### Problemas Identificados

1. **Progresso 48h**: Já existe a estrutura (`SprintEvolution`), mas pode não estar aparecendo consistentemente
2. **Animações exageradas**: As animações atuais são muito intensas e sem propósito visual claro:
   - `sprint-shake` (0.5s) - muito rápido e distrai
   - `sprint-glow` - box-shadow pulsante demais
   - `sprint-bounce` e `sprint-pulse` - movimentos contínuos cansativos

---

### Parte 1: Garantir Visibilidade do Progresso 48h

**Problema**: O indicador de evolução 48h aparece somente quando `evolution && evolution.difference !== 0`

**Solução**: Sempre mostrar a evolução quando disponível, mesmo se a diferença for zero (indica estagnação)

#### Arquivo: `SprintKPIBar.tsx`

- Mudar a condição para mostrar sempre que houver dados de evolução
- Adicionar tratamento visual para progresso zero (estagnação)
- Posicionar de forma mais integrada ao layout

---

### Parte 2: Redesign Completo das Animações

**Princípios**:
- Animações somente no hover (não infinitas)
- Transições suaves em vez de loops constantes
- Micro-interações elegantes
- Feedback visual sem distração

#### Arquivo: `tailwind.config.ts`

**Remover animações infinitas**:
- `sprint-shake` (tremendo constantemente)
- `sprint-pulse` (pulsando infinitamente)
- `sprint-bounce` (pulando sem parar)
- `sprint-glow` (brilhando infinitamente)

**Substituir por transições elegantes**:
- Usar `transition-all duration-200` para hovers suaves
- Micro-scale no hover (1.02-1.05 máximo)
- Sombra sutil no hover para profundidade
- Cores com transição suave

#### Arquivo: `SprintKPIBar.tsx`

**Simplificar classes dos assessores**:
```tsx
// ANTES (exagerado)
"animate-sprint-shake hover:scale-105"
"animate-sprint-glow hover:scale-110"

// DEPOIS (elegante)
"hover:scale-[1.03] hover:shadow-sm"
"hover:brightness-110"
```

**Nova lógica visual**:
- Verde: borda mais pronunciada + checkmark
- Amarelo: borda sutil + sem animação
- Vermelho: fundo suave + ícone de alerta discreto
- Hover único: scale sutil + sombra

---

### Parte 3: Melhorar Integração Visual do Progresso 48h

**Localização**: Mover para uma posição mais integrada dentro de cada KPI bar

**Estilo**:
```tsx
// Linha compacta integrada aos valores
<span className="text-green-500 text-scale-5">
  ↑ +R$ 50K (48h)
</span>
```

**Estados visuais**:
| Evolução | Ícone | Cor | Texto |
|----------|-------|-----|-------|
| Positiva | ↑ | verde | +valor (Xh) |
| Zerada | → | cinza | Sem variação |
| Negativa | ↓ | vermelho | -valor (Xh) |

---

### Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `tailwind.config.ts` | Remover keyframes `sprint-*` infinitos, manter transições |
| `SprintKPIBar.tsx` | Simplificar animações, melhorar visibilidade 48h, hover elegante |

---

### Resultado Esperado

**Visual mais limpo**:
- Sem elementos tremendo, pulsando ou brilhando infinitamente
- Hover sutil que dá feedback sem distrair
- Progresso 48h sempre visível e integrado

**Animações refinadas**:
- Transições suaves de 200ms no hover
- Scale máximo de 1.03 (quase imperceptível)
- Sombra leve para indicar interatividade

